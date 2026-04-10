import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Dashboard from './components/Dashboard';
import { initialReports } from './data/dummyData';
import { Camera, Sparkles, Loader2, MapPin, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

// Custom icons based on severity
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
const LocationInitializer = () => {
  const map = useMap();
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { animate: true, duration: 1.5 });
        },
        (err) => console.log("User denied location on load")
      );
    }
  }, [map]);
  return null;
};

export default function App() {
  const [reports, setReports] = useState(initialReports);
  const [draftLocation, setDraftLocation] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [severity, setSeverity] = useState('Medium');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiReason, setAiReason] = useState('');
  const [riskTags, setRiskTags] = useState([]);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setDraftLocation(e.latlng);
      },
    });
    return null;
  };

  const simulateClaudeVision = () => {
    setIsAiAnalyzing(true);
    setTimeout(() => {
      setIsAiAnalyzing(false);
      setSeverity('High');
      setAiReason('Hazardous construction debris and large volume of plastic waste detected.');
      setRiskTags(['Toxic Runoff Risk ☠️', 'Blocks Drainage 🌧️']);
    }, 2000);
  };

  const submitReport = () => {
    const newReport = {
      id: Date.now(),
      lat: draftLocation.lat,
      lng: draftLocation.lng,
      severity: severity,
      status: 'Reported',
      photo: '📸',
      aiNotes: aiReason,
      tags: riskTags
    };
    setReports([...reports, newReport]);
    setShowReportForm(false);
    setDraftLocation(null);
  };

  const claimSpot = (id) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'In Progress' } : r));
  };

  const handleCancelReport = () => {
    setShowReportForm(false);
    setDraftLocation(null);
  };

  const handleReportAction = () => {
    if (draftLocation) {
      setShowReportForm(true);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          // FIXED: Added "lng:" right here 👇
          setDraftLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSeverity('Medium');
          setAiReason('');
          setRiskTags([]);
          setShowReportForm(true);
        }, () => {
           alert("Please allow location access or tap anywhere on the map to drop a pin first.");
        });
      }
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', backgroundColor: '#020617', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* BRANDING LOGO - TOP LEFT */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'none' }}>
        <div style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', padding: '10px', borderRadius: '14px', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Zap size={28} color="white" fill="white" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: 'white', letterSpacing: '-1px', lineHeight: '1' }}>Clean<span style={{ color: '#3b82f6' }}>X</span></h1>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px' }}>DevFest MVP</span>
        </div>
      </div>

      <Dashboard reports={reports} />
      
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        
        <LocationInitializer />
        <MapEvents />
        
        {reports.map((report) => (
          <Marker key={report.id} position={[report.lat, report.lng]} icon={getIcon(report.severity, report.status)}>
            <Popup className="dark-popup">
              <div style={{ width: '220px', padding: '6px' }}>
                {report.photo !== '📸' && (
                  <img src={report.photo} alt="Waste" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontWeight: '900', fontSize: '18px', margin: 0, color: '#0f172a' }}>{report.severity} Alert</h3>
                  <span style={{ fontSize: '10px', padding: '4px 10px', backgroundColor: '#f1f5f9', borderRadius: '99px', fontWeight: '800', textTransform: 'uppercase', color: '#475569' }}>{report.status}</span>
                </div>
                
                {report.desc && <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0', lineHeight: '1.5', fontWeight: '500' }}>{report.desc}</p>}
                
                {report.aiNotes && (
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px', borderRadius: '8px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#1d4ed8', margin: '0 0 6px 0', display: 'flex', gap: '4px', alignItems: 'center', fontWeight: '600' }}>
                      <Sparkles size={12} /> AI Analysis
                    </p>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {report.tags?.map((tag, i) => (
                        <span key={i} style={{ fontSize: '9px', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '3px 6px', borderRadius: '4px', fontWeight: '700' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'block', width: '100%', boxSizing: 'border-box', backgroundColor: '#f1f5f9', color: '#334155', padding: '10px', borderRadius: '8px', fontWeight: '700', border: 'none', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', marginBottom: '8px', fontSize: '13px', transition: 'background 0.2s' }}
                >
                  📍 Get Directions
                </a>
                
                {report.status === 'Reported' && (
                  <button onClick={() => claimSpot(report.id)} style={{ width: '100%', background: 'linear-gradient(to right, #2563eb, #1d4ed8)', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 10px rgba(37,99,235,0.3)' }}>
                    Claim (+50 pts)
                  </button>
                )}
                {report.status === 'In Progress' && (
                  <button 
                    onClick={() => {
                      setReports(reports.map(r => r.id === report.id ? { ...r, status: 'Cleaned' } : r));
                      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: ['#16a34a', '#4ade80', '#ffffff'] });
                    }} 
                    style={{ width: '100%', background: 'linear-gradient(to right, #16a34a, #15803d)', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 10px rgba(22,163,74,0.3)' }}
                  >
                    Mark Cleaned (+100 pts)
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {draftLocation && (
          <Marker position={[draftLocation.lat, draftLocation.lng]} icon={getIcon(severity, 'Draft')} />
        )}
      </MapContainer>

      {/* Primary Action Button - Polished */}
      <button 
        onClick={handleReportAction}
        style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', padding: '16px 36px', borderRadius: '999px', fontWeight: '800', fontSize: '16px', border: 'none', boxShadow: '0 12px 30px -5px rgba(37, 99, 235, 0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s' }}
      >
        <MapPin size={22} />
        {draftLocation ? "Report at this Pin" : "Use GPS to Report"}
      </button>

      {/* Bottom Sheet Report Form */}
      {showReportForm && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', backgroundColor: '#0f172a', color: 'white', zIndex: 2000, borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '36px 28px', boxSizing: 'border-box', boxShadow: '0 -20px 50px rgba(0,0,0,0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>New Waste Report</h2>
              <p style={{ fontSize: '13px', color: '#64748b', fontFamily: 'monospace', margin: '6px 0 0 0', fontWeight: '500' }}>
                📍 {draftLocation?.lat.toFixed(5)}, {draftLocation?.lng.toFixed(5)}
              </p>
            </div>
            <button onClick={handleCancelReport} style={{ backgroundColor: '#1e293b', color: '#94a3b8', border: 'none', padding: '10px 14px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <button 
              onClick={simulateClaudeVision}
              disabled={isAiAnalyzing}
              style={{ width: '100%', border: '2px dashed #334155', backgroundColor: '#1e293b', borderRadius: '20px', padding: '36px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8', cursor: 'pointer' }}
            >
              {isAiAnalyzing ? <Loader2 size={36} style={{ marginBottom: '14px', animation: 'spin 1s linear infinite', color: '#3b82f6' }} /> : <Camera size={40} style={{ marginBottom: '14px', color: '#cbd5e1' }} />}
              <span style={{ fontWeight: '800', fontSize: '17px', color: 'white', marginBottom: '10px' }}>
                {isAiAnalyzing ? 'Claude is analyzing photo...' : 'Tap to upload evidence'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '6px 12px', borderRadius: '99px', fontWeight: '700' }}>
                <ShieldCheck size={14} />
                <span>Pre-checked by Claude Vision AI</span>
              </div>
            </button>

            {aiReason && (
               <div style={{ backgroundColor: 'rgba(30, 58, 138, 0.2)', border: '1px solid #1e40af', padding: '18px', borderRadius: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start', color: '#bfdbfe', fontSize: '15px', lineHeight: '1.6' }}>
                 <Sparkles size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#60a5fa' }} />
                 <div>
                   <p style={{ margin: '0 0 10px 0' }}><strong>AI Assessment:</strong> {aiReason}</p>
                   <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                     {riskTags.map((tag, i) => (
                       <span key={i} style={{ fontSize: '11px', backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>{tag}</span>
                     ))}
                   </div>
                 </div>
               </div>
            )}

            <div>
              <p style={{ fontWeight: '800', color: '#e2e8f0', marginBottom: '14px', fontSize: '15px' }}>Severity Override</p>
              <div style={{ display: 'flex', gap: '14px' }}>
                {['Low', 'Medium', 'High'].map(level => (
                  <button 
                    key={level}
                    onClick={() => setSeverity(level)}
                    style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', border: severity === level ? '2px solid #3b82f6' : '2px solid #334155', backgroundColor: severity === level ? '#3b82f6' : 'transparent', color: severity === level ? 'white' : '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={submitReport}
              style={{ width: '100%', background: 'linear-gradient(to right, #2563eb, #1d4ed8)', color: 'white', padding: '20px', borderRadius: '16px', fontWeight: '900', fontSize: '18px', border: 'none', marginTop: '10px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)' }}
            >
              Post to Live Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}