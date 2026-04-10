import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Dashboard from './components/Dashboard';
import { initialReports } from './data/dummyData';
import { Camera, Sparkles, Loader2, MapPin, ShieldCheck } from 'lucide-react';

const getIcon = (severity, status) => {
  let color = severity === 'High' ? '#ef4444' : severity === 'Medium' ? '#f97316' : '#22c55e';
  if (status === 'Cleaned') color = '#4b5563'; 
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #111827; box-shadow: 0 0 15px ${color}; ${severity === 'High' && status !== 'Cleaned' ? 'animation: pulse 2s infinite;' : ''}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};


// Component to handle asking for GPS on load and flying to user location
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

  // Map click now ONLY drops a pin, doesn't force the form open
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
      setAiReason('AI detected hazardous construction debris and large volume of plastic waste.');
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
      aiNotes: aiReason
    };
    setReports([...reports, newReport]);
    setShowReportForm(false);
    setDraftLocation(null);
  };

  const claimSpot = (id) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'In Progress' } : r));
  };

  // Cancels form and clears the ghost marker
  const handleCancelReport = () => {
    setShowReportForm(false);
    setDraftLocation(null);
  };

  // Handles the main action button
  const handleReportAction = () => {
    if (draftLocation) {
      setShowReportForm(true);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setDraftLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSeverity('Medium');
          setAiReason('');
          setShowReportForm(true);
        }, () => {
           alert("Please allow location access or tap anywhere on the map to drop a pin first.");
        });
      }
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', backgroundColor: '#030712', fontFamily: 'system-ui, sans-serif' }}>
      
      <Dashboard reports={reports} />
      
      {/* Centered on India by default until GPS kicks in */}
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        
        <LocationInitializer />
        <MapEvents />
        
        {reports.map((report) => (
          <Marker key={report.id} position={[report.lat, report.lng]} icon={getIcon(report.severity, report.status)}>
            <Popup className="dark-popup">
              <div style={{ width: '200px', padding: '4px' }}>
                {report.photo !== '📸' && (
                  <img src={report.photo} alt="Waste" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0, color: '#111827' }}>{report.severity} Alert</h3>
                  <span style={{ fontSize: '10px', padding: '2px 8px', backgroundColor: '#f3f4f6', borderRadius: '99px', fontWeight: 'bold', textTransform: 'uppercase', color: '#374151' }}>{report.status}</span>
                </div>
                
                {report.desc && <p style={{ fontSize: '12px', color: '#4b5563', margin: '0 0 12px 0', lineHeight: '1.4' }}>{report.desc}</p>}
                
                {report.aiNotes && (
                  <p style={{ fontSize: '11px', color: '#2563eb', backgroundColor: '#eff6ff', padding: '6px', borderRadius: '6px', marginBottom: '12px', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                    ✨ {report.aiNotes}
                  </p>
                )}
                
                {report.status === 'Reported' && (
                  <button onClick={() => claimSpot(report.id)} style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '8px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                    Claim (+50 pts)
                  </button>
                )}
                {report.status === 'In Progress' && (
                  <button onClick={() => setReports(reports.map(r => r.id === report.id ? { ...r, status: 'Cleaned' } : r))} style={{ width: '100%', backgroundColor: '#16a34a', color: 'white', padding: '8px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
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

      {/* Primary Action Button */}
      <button 
        onClick={handleReportAction}
        style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, backgroundColor: '#2563eb', color: 'white', padding: '16px 32px', borderRadius: '999px', fontWeight: 'bold', fontSize: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
      >
        <MapPin size={20} />
        {draftLocation ? "Report at this Pin" : "Use GPS to Report"}
      </button>

      {/* Bottom Sheet Report Form */}
      {showReportForm && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', backgroundColor: '#111827', color: 'white', zIndex: 2000, borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '32px 24px', boxSizing: 'border-box', boxShadow: '0 -10px 40px rgba(0,0,0,0.7)', transition: 'all 0.3s ease-in-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>New Waste Report</h2>
              <p style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace', margin: '4px 0 0 0' }}>
                {draftLocation?.lat.toFixed(4)}, {draftLocation?.lng.toFixed(4)}
              </p>
            </div>
            <button onClick={handleCancelReport} style={{ backgroundColor: '#1f2937', color: '#9ca3af', border: 'none', padding: '8px 12px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <button 
              onClick={simulateClaudeVision}
              disabled={isAiAnalyzing}
              style={{ width: '100%', border: '2px dashed #374151', backgroundColor: '#1f2937', borderRadius: '16px', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#9ca3af', cursor: 'pointer' }}
            >
              {isAiAnalyzing ? <Loader2 size={32} style={{ marginBottom: '12px', animation: 'spin 1s linear infinite', color: '#3b82f6' }} /> : <Camera size={36} style={{ marginBottom: '12px', color: '#d1d5db' }} />}
              <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'white', marginBottom: '8px' }}>
                {isAiAnalyzing ? 'Claude is analyzing photo...' : 'Tap to upload evidence'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '99px' }}>
                <ShieldCheck size={12} />
                <span>Pre-checked by Claude Vision AI</span>
              </div>
            </button>

            {aiReason && (
               <div style={{ backgroundColor: 'rgba(30, 58, 138, 0.3)', border: '1px solid #1e3a8a', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', color: '#93c5fd', fontSize: '14px', lineHeight: '1.5' }}>
                 <Sparkles size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                 <p style={{ margin: 0 }}><strong>AI Assessment:</strong> {aiReason}</p>
               </div>
            )}

            <div>
              <p style={{ fontWeight: 'bold', color: '#d1d5db', marginBottom: '12px', fontSize: '14px' }}>Severity Override</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Low', 'Medium', 'High'].map(level => (
                  <button 
                    key={level}
                    onClick={() => setSeverity(level)}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 'bold', border: severity === level ? '2px solid white' : '2px solid #374151', backgroundColor: severity === level ? 'white' : 'transparent', color: severity === level ? 'black' : '#9ca3af', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={submitReport}
              style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '18px', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', border: 'none', marginTop: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            >
              Post to Live Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}