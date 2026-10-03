import React from 'react';
import { 
  UserPlus, 
  Stethoscope, 
  BedDouble, 
  Pill, 
  Syringe, 
  Activity, 
  Receipt, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export const TimelineWidget = ({ events = [] }) => {
  const getEventIcon = (eventTitle = '') => {
    const title = eventTitle.toLowerCase();
    if (title.includes('registration')) return { icon: UserPlus, color: 'var(--accent-teal)', bg: 'var(--accent-teal-light)' };
    if (title.includes('admitted') || title.includes('admission') || title.includes('ward')) return { icon: BedDouble, color: 'var(--medical-blue)', bg: 'var(--medical-blue-light)' };
    if (title.includes('order') || title.includes('doctor') || title.includes('consultation')) return { icon: Stethoscope, color: 'var(--purple-accent)', bg: 'var(--purple-light)' };
    if (title.includes('pharmacy') || title.includes('dispensed')) return { icon: Pill, color: 'var(--amber-warning)', bg: 'var(--amber-light)' };
    if (title.includes('administered') || title.includes('nurse')) return { icon: Syringe, color: 'var(--emerald-success)', bg: 'var(--emerald-light)' };
    if (title.includes('vitals') || title.includes('telemetry')) return { icon: Activity, color: 'var(--rose-danger)', bg: 'var(--rose-light)' };
    if (title.includes('bill') || title.includes('payment') || title.includes('invoice')) return { icon: Receipt, color: 'var(--primary-navy)', bg: 'var(--primary-navy-subtle)' };
    return { icon: CheckCircle2, color: 'var(--accent-teal)', bg: 'var(--accent-teal-light)' };
  };

  if (!events || events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
        No journey events recorded yet.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '16px', margin: '10px 0' }}>
      {/* Vertical Connecting Line */}
      <div style={{
        position: 'absolute',
        top: '16px',
        bottom: '16px',
        left: '30px',
        width: '2px',
        backgroundColor: 'var(--border-light)',
        zIndex: 1
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {events.map((ev, index) => {
          const { icon: Icon, color, bg } = getEventIcon(ev.event);
          const dateStr = ev.date ? new Date(ev.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent';

          return (
            <div key={ev.id || index} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative', zIndex: 2 }}>
              {/* Icon Bubble */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: bg,
                color: color,
                border: `2px solid var(--bg-surface)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0
              }}>
                <Icon size={16} />
              </div>

              {/* Event Content Box */}
              <div style={{
                flex: 1,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>
                    {ev.event}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    <span>{dateStr}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {ev.description}
                </div>

                {(ev.staffMember || ev.staffRole) && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: 6 }}>
                    <span>Logged by:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{ev.staffMember}</strong>
                    {ev.staffRole && <span>({ev.staffRole})</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
