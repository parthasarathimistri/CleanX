import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet';
import { db, auth, googleProvider, storage } from './lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithPopup } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { translations } from './lib/i18n';
import Dashboard from './components/Dashboard';
import confetti from 'canvas-confetti';
import { Zap, Camera, Sparkles, Loader2, MapPin, ShieldCheck, CheckCircle } from 'lucide-react';

// Component to fix map layout after login
const MapResizeFixer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => { map.invalidateSize(); }, 200);
  }, [map]);
  return null;
};

// Custom color-coded icons based on severity [cite: 11, 20]
const getIcon = (severity, status) => {
  let color = severity === 'High' ? '#ef4444' : severity === 'Medium' ? '#f97316' : '#22c55e';
  if (status === 'Cleaned') color = '#4b5563'; 
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #0f172a; box-shadow: 0 0 20px ${color}; ${severity === 'High' && status !== 'Cleaned' ? 'animation: pulse 2s infinite;' : ''}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};


export default function App() {
  const [user] = useAuthState(auth);
  const [reports, setReports] = useState([]);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en'); // Persists across refresh [cite: 27]
  const [draftLocation, setDraftLocation] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [severity, setSeverity] = useState('Medium');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiReason, setAiReason] = useState('');
  const [riskTags, setRiskTags] = useState([]);
  
  // States for the new After Photo upload system
  const [isUploadingAfter, setIsUploadingAfter] = useState(false);
  const [cleaningReportId, setCleaningReportId] = useState(null);
  const fileInputRef = useRef(null);

  const t = translations[lang];

  // Language Persistence [cite: 27]
  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);

  // Real-time Firestore Listener [cite: 13, 25]
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  const login = () => signInWithPopup(auth, googleProvider);

  const MapEvents = () => {
    useMapEvents({ click(e) { setDraftLocation(e.latlng); } });
    return null;
  };

  // Mock AI Analysis for New Reports
  const simulateClaudeVision = () => {
    setIsAiAnalyzing(true);
    setTimeout(() => {
      setIsAiAnalyzing(false);
      setSeverity('High');
      setAiReason('AI detected hazardous industrial waste.');
      setRiskTags(['Toxic Risk ☠️', 'Drainage Block 🌧️']);
    }, 2000);
  };

  // Submit initial waste report
  const submitReport = async () => {
    await addDoc(collection(db, "reports"), {
      lat: draftLocation.lat,
      lng: draftLocation.lng,
      severity: severity, // Computed automatically or via AI [cite: 26]
      status: 'Reported',
      photo: `https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&q=80`, 
      aiNotes: aiReason,
      tags: riskTags,
      reportedBy: user.displayName,
      timestamp: serverTimestamp()
    });
    setShowReportForm(false);
    setDraftLocation(null);
  };

  const claimSpot = async (id) => {
    await updateDoc(doc(db, "reports", id), { status: 'In Progress', claimedBy: user.displayName });
  };

  // Trigger the camera/file picker for Proof
  const triggerAfterPhoto = (id) => {
    setCleaningReportId(id);
    if (fileInputRef.current) {
      // Reset input so selecting the same file again still fires onChange.
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle the real "After" picture upload [cite: 32]
  const handleAfterPhotoUpload = async (e) => {
    const file = e.target.files[0];
    const reportId = cleaningReportId;
    if (!file || !reportId) {
      e.target.value = '';
      setCleaningReportId(null);
      return;
    }

    setIsUploadingAfter(true);
    try {
      const storageRef = ref(storage, `cleanups/${reportId}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "reports", reportId), {
        status: 'Cleaned',
        afterPhoto: downloadURL,
        cleanedBy: user.displayName,
        cleanedAt: serverTimestamp()
      });

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Verification upload failed. Please try again.");
    } finally {
      setIsUploadingAfter(false);
      setCleaningReportId(null);
      e.target.value = '';
    }
  };

  const seedDummyData = async () => {
    const dummyData = [
      { lat: 12.8235, lng: 80.0435, severity: 'High', status: 'Reported', photo: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&q=80', timestamp: serverTimestamp() },
      { lat: 12.8210, lng: 80.0450, severity: 'Medium', status: 'Reported', photo: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400&q=80', timestamp: serverTimestamp() },
      { lat: 12.8255, lng: 80.0420, severity: 'Low', status: 'Cleaned', photo: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?w=400&q=80', afterPhoto: 'https://images.unsplash.com/photo-1518005020251-58296b974910?w=400&q=80', cleanedBy: 'Volunteer Alex', timestamp: serverTimestamp() }
    ];
    for (const data of dummyData) { await addDoc(collection(db, "reports"), data); }
    alert("Test data seeded!");
  };

  if (!user) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617', color: 'white' }}>
      <Zap size={60} color="#3b82f6" fill="#3b82f6" style={{ marginBottom: '20px' }} />
      <h1 style={{ marginBottom: '20px' }}>CleanX</h1>
      <button onClick={login} style={{ padding: '16px 32px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Login with Google</button>
    </div>
  );

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', backgroundColor: '#020617', fontFamily: 'system-ui' }}>
      
      {/* Top Controls: Branding & Language Toggle [cite: 40, 41] */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ background: '#2563eb', padding: '10px', borderRadius: '14px' }}><Zap size={24} color="white" fill="white" /></div>
        <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px', padding: '8px', fontWeight: 'bold' }}>
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="ta">தமிழ்</option>
          <option value="te">తెలుగు</option>
        </select>
        <button onClick={seedDummyData} style={{ fontSize: '10px', background: 'none', color: '#64748b', border: '1px solid #334155', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}>Seed Data</button>
      </div>

      <Dashboard reports={reports} lang={lang} />
      
      <MapContainer center={[12.823, 80.045]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <MapResizeFixer />
        <MapEvents />
        
        {reports.map((r) => (
          <Marker key={r.id} position={[r.lat, r.lng]} icon={getIcon(r.severity, r.status)}>
            <Popup>
              <div style={{ width: '240px' }}>
                {/* Side-by-Side Proof Card [cite: 18, 20, 33] */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '9px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{t.before}</p>
                    <img src={r.photo} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                  </div>
                  {r.afterPhoto && (
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#16a34a', margin: '0 0 4px 0' }}>{t.after}</p>
                      <img src={r.afterPhoto} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                    </div>
                  )}
                </div>

                <h3 style={{ margin: '0 0 4px 0' }}>{r.severity} {t.severity}</h3>
                
                {/* Status: Pending Proof enforcement [cite: 35] */}
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>
                  {r.status === 'Cleaned' ? t.cleaned : (r.status === 'Pending Proof' ? t.pending : t.reported)}
                </p>
                
                {r.status === 'Reported' && (
                  <button onClick={() => claimSpot(r.id)} style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.claim}</button>
                )}
                {(r.status === 'In Progress' && r.claimedBy === user.displayName) && (
                  <button 
                    onClick={() => triggerAfterPhoto(r.id)} 
                    disabled={isUploadingAfter && cleaningReportId === r.id}
                    style={{ width: '100%', backgroundColor: '#16a34a', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    {isUploadingAfter && cleaningReportId === r.id ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                    {t.markCleaned}
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {draftLocation && <Marker position={[draftLocation.lat, draftLocation.lng]} icon={getIcon('Medium', 'Draft')} />}
      </MapContainer>

      {/* Hidden File Input for Picture Verification [cite: 32] */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        capture="environment" 
        style={{ display: 'none' }} 
        onChange={handleAfterPhotoUpload} 
      />

      <button 
        onClick={() => draftLocation ? setShowReportForm(true) : alert("Tap map to drop pin first!")}
        style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', padding: '16px 36px', borderRadius: '999px', fontWeight: 'bold', border: 'none', boxShadow: '0 12px 30px rgba(37,99,235,0.5)', cursor: 'pointer' }}
      >
        <MapPin size={20} style={{ marginRight: '8px' }} />
        {draftLocation ? t.submit : t.newReport}
      </button>

      {showReportForm && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', backgroundColor: '#0f172a', color: 'white', zIndex: 2000, borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '30px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>{t.newReport}</h2>
            <button onClick={() => setShowReportForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>
          <button onClick={simulateClaudeVision} disabled={isAiAnalyzing} style={{ width: '100%', border: '2px dashed #334155', backgroundColor: '#1e293b', borderRadius: '16px', padding: '30px', color: '#94a3b8', cursor: 'pointer', marginBottom: '20px' }}>
            {isAiAnalyzing ? <Loader2 className="animate-spin" /> : <Camera size={32} />}
            <p style={{ fontWeight: 'bold', color: 'white' }}>{isAiAnalyzing ? 'Analyzing...' : t.upload}</p>
            <div style={{ fontSize: '11px', color: '#10b981' }}><ShieldCheck size={12} /> {t.aiCheck}</div>
          </button>
          {aiReason && <div style={{ backgroundColor: 'rgba(37,99,235,0.1)', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>✨ {aiReason}</div>}
          <button onClick={submitReport} style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '18px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '18px' }}>{t.submit}</button>
        </div>
      )}
    </div>
  );
}