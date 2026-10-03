import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'teal' }) => {
  const colorMap = {
    teal: { bg: 'var(--accent-teal-light)', text: 'var(--accent-teal)', border: 'rgba(8, 131, 126, 0.2)' },
    blue: { bg: 'var(--medical-blue-light)', text: 'var(--medical-blue)', border: 'rgba(2, 132, 199, 0.2)' },
    emerald: { bg: 'var(--emerald-light)', text: 'var(--emerald-success)', border: 'rgba(13, 148, 104, 0.2)' },
    rose: { bg: 'var(--rose-light)', text: 'var(--rose-danger)', border: 'rgba(225, 29, 72, 0.2)' },
    amber: { bg: 'var(--amber-light)', text: 'var(--amber-warning)', border: 'rgba(217, 119, 6, 0.2)' },
    purple: { bg: 'var(--purple-light)', text: 'var(--purple-accent)', border: 'rgba(124, 58, 237, 0.2)' },
  };

  const currentTheme = colorMap[color] || colorMap.teal;

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '6px 0 2px', fontFamily: 'var(--font-mono)' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{
        width: 44,
        height: 44,
        borderRadius: 'var(--radius-lg)',
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
        border: `1px solid ${currentTheme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {Icon && <Icon size={22} />}
      </div>
    </div>
  );
};
