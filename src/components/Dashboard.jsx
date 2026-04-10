import React from 'react';
import { translations } from '../lib/i18n';

export default function Dashboard({ reports, lang }) {
  const t = translations[lang];
  
  const volunteerStats = reports.reduce((acc, r) => {
    if (r.status === 'Cleaned' && r.cleanedBy) {
      // Automatic severity-based scoring
      const pts = r.severity === 'High' ? 50 : r.severity === 'Medium' ? 25 : 10;
      if (!acc[r.cleanedBy]) acc[r.cleanedBy] = { name: r.cleanedBy, points: 0, count: 0 };
      acc[r.cleanedBy].points += pts;
      acc[r.cleanedBy].count += 1;
    }
    return acc;
  }, {});

  const leaderboard = Object.values(volunteerStats).sort((a, b) => b.points - a.points);

  return (
    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, width: '320px', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: 'rgba(10, 15, 25, 0.9)', padding: '20px', borderRadius: '16px', color: 'white', border: '1px solid #1e293b', marginBottom: '12px', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}><p style={{ fontSize: '10px' }}>{t.reported}</p><p style={{ fontSize: '20px', fontWeight: 'bold' }}>{reports.length}</p></div>
          <div style={{ textAlign: 'center' }}><p style={{ fontSize: '10px', color: '#fb923c' }}>{t.active}</p><p style={{ fontSize: '20px', fontWeight: 'bold' }}>{reports.filter(r => r.status !== 'Cleaned').length}</p></div>
          <div style={{ textAlign: 'center' }}><p style={{ fontSize: '10px', color: '#4ade80' }}>{t.cleaned}</p><p style={{ fontSize: '20px', fontWeight: 'bold' }}>{reports.filter(r => r.status === 'Cleaned').length}</p></div>
        </div>
      </div>

      <div style={{ backgroundColor: 'rgba(10, 15, 25, 0.9)', padding: '16px', borderRadius: '16px', color: 'white', border: '1px solid #1e293b', backdropFilter: 'blur(10px)' }}>
        <p style={{ fontSize: '12px', color: '#eab308', fontWeight: 'bold', marginBottom: '10px' }}>🏆 {t.leaderboard}</p>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {leaderboard.map((user, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '4px', fontSize: '12px' }}>
              <span>{i + 1}. {user.name} ({user.count} {t.count})</span>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{user.points} {t.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}