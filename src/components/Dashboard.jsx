import React from 'react';

export default function Dashboard({ reports }) {
  const total = reports.length;
  const inProgress = reports.filter(r => r.status === 'In Progress').length;
  const cleaned = reports.filter(r => r.status === 'Cleaned').length;

  const leaderboard = [
    { name: 'You', points: cleaned * 100 + inProgress * 50 },
    { name: 'Alex M.', points: 450 },
    { name: 'Sarah K.', points: 300 }
  ];

  return (
    <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '16px', width: '320px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Stats Panel */}
      <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.85)', border: '1px solid #374151', padding: '20px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'space-between', color: 'white', backdropFilter: 'blur(12px)' }}>
        <div style={{ textAlign: 'center', width: '33%' }}>
          <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>Reported</p>
          <p style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>{total}</p>
        </div>
        <div style={{ textAlign: 'center', width: '33%', borderLeft: '1px solid #374151' }}>
          <p style={{ fontSize: '10px', color: '#fb923c', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>Active</p>
          <p style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>{inProgress}</p>
        </div>
        <div style={{ textAlign: 'center', width: '33%', borderLeft: '1px solid #374151' }}>
          <p style={{ fontSize: '10px', color: '#4ade80', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>Cleaned</p>
          <p style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>{cleaned}</p>
        </div>
      </div>

      {/* Leaderboard Panel */}
      <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.85)', border: '1px solid #374151', padding: '20px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', color: 'white', backdropFilter: 'blur(12px)' }}>
        <p style={{ fontSize: '12px', color: '#eab308', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px 0' }}>🏆 Top Volunteers</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {leaderboard.sort((a, b) => b.points - a.points).map((user, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontWeight: user.name === 'You' ? 'bold' : 'normal', color: user.name === 'You' ? '#60a5fa' : '#d1d5db' }}>
                {idx + 1}. {user.name}
              </span>
              <span style={{ fontFamily: 'monospace', color: '#4ade80', fontWeight: 'bold' }}>{user.points} pts</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}