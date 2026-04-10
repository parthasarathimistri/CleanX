import React from 'react';
import { translations } from '../lib/i18n';

export default function Dashboard({ reports, lang }) {
  const t = translations[lang];
  const stats = {
    total: reports.length,
    active: reports.filter(r => r.status === 'Reported' || r.status === 'In Progress' || r.status === 'Pending Proof').length,
    cleaned: reports.filter(r => r.status === 'Cleaned').length
  };

  // Rank volunteers by score, including name and cleanup count [cite: 12]
  const volunteerStats = reports.reduce((acc, r) => {
    if (r.status === 'Cleaned' && r.cleanedBy) {
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
      <div style={{ backgroundColor: 'rgba(10, 15, 25, 0.9)', padding: '20px', borderRadius: '16px', color: 'white', backdropFilter: 'blur(10px)', marginBottom: '12px', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}><p style={{ fontSize: '10px', color: '#9ca3af' }}>{t.reported}</p><p style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.total}</p></div>
          <div style={{ textAlign: 'center' }}><p style={{ fontSize: '10px', color: '#fb923c' }}>{t.active}</p><p style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.active}</p></div>
          <div style={{ textAlign: 'center' }}><p style={{ fontSize: '10px', color: '#4ade80' }}>{t.cleaned}</p><p style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.cleaned}</p></div>
        </div>
      </div>

      <div style={{ backgroundColor: 'rgba(10, 15, 25, 0.9)', padding: '16px', borderRadius: '16px', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid #1e293b' }}>
        <p style={{ fontSize: '12px', color: '#eab308', fontWeight: 'bold', marginBottom: '10px' }}>🏆 {t.leaderboard}</p>
        {leaderboard.map((user, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '4px', fontSize: '12px' }}>
            <span>{i + 1}. {user.name} ({user.count} {t.count})</span>
            <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{user.points} {t.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}