import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db, auth, googleProvider } from './lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { translations } from './lib/i18n';
import Dashboard from './components/Dashboard';
import confetti from 'canvas-confetti';
import { Zap } from 'lucide-react';

export default function App() {
  const [user] = useAuthState(auth);
  const [reports, setReports] = useState([]);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en'); // Persists across refresh [cite: 27]
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const handleCleanup = async (reportId) => {
    const afterPhoto = prompt("Enter cleanup photo URL (Proof Required):"); // Logic to stay 'Pending Proof' [cite: 35]
    if (!afterPhoto) return;
    
    const reportRef = doc(db, "reports", reportId);
    await updateDoc(reportRef, {
      status: 'Cleaned',
      afterPhoto: afterPhoto,
      cleanedBy: user.displayName,
      totalScore: (user.totalScore || 0) + 10 // Visible on map claimed spots [cite: 14]
    });
    confetti({ particleCount: 150, spread: 70 });
  };

  if (!user) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' }}>
    <button onClick={() => signInWithPopup(auth, googleProvider)} style={{ padding: '16px 32px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Login with Google</button>
  </div>;

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', backgroundColor: '#020617' }}>
      {/* LOGO & LANGUAGE TOGGLE */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, display: 'flex', gap: '12px' }}>
        <div style={{ backgroundColor: '#2563eb', padding: '8px', borderRadius: '12px' }}><Zap color="white" fill="white" /></div>
        <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px', padding: '8px', fontWeight: 'bold' }}>
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="ta">தமிழ்</option>
          <option value="te">తెలుగు</option>
        </select>
      </div>

      <Dashboard reports={reports} lang={lang} />

      <MapContainer center={[12.823, 80.045]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {reports.map(r => (
          <Marker key={r.id} position={[r.lat, r.lng]}>
            <Popup>
              <div style={{ width: '220px' }}>
                {/* BEFORE / AFTER CARD [cite: 18, 33] */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}><p style={{ fontSize: '8px', fontWeight: 'bold' }}>{t.before}</p><img src={r.photo} style={{ width: '100%', borderRadius: '4px' }} /></div>
                  {r.afterPhoto && <div style={{ flex: 1 }}><p style={{ fontSize: '8px', fontWeight: 'bold', color: '#16a34a' }}>{t.after}</p><img src={r.afterPhoto} style={{ width: '100%', borderRadius: '4px' }} /></div>}
                </div>
                <h4 style={{ margin: '0 0 4px 0' }}>{r.severity} {t.severity}</h4>
                <p style={{ fontSize: '11px', margin: '0 0 8px 0' }}>{r.status === 'Cleaned' ? t.cleaned : t.pending}</p>
                {r.status === 'In Progress' && <button onClick={() => handleCleanup(r.id)} style={{ width: '100%', backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold' }}>{t.markCleaned}</button>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}