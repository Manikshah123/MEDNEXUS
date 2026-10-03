import React, { useState, useEffect } from 'react';
import { Heart, Activity, Wind, Thermometer, ShieldAlert } from 'lucide-react';

export const VitalsWidget = ({ baseVitals = { heartRate: 78, systolicBP: 120, diastolicBP: 80, spO2: 98, temperature: 36.8, respiratoryRate: 16 }, live = true }) => {
  const [vitals, setVitals] = useState(baseVitals);

  useEffect(() => {
    if (!live) return;
    const interval = setInterval(() => {
      setVitals({
        heartRate: Math.round(baseVitals.heartRate + (Math.random() * 4 - 2)),
        systolicBP: Math.round(baseVitals.systolicBP + (Math.random() * 4 - 2)),
        diastolicBP: Math.round(baseVitals.diastolicBP + (Math.random() * 2 - 1)),
        spO2: Math.min(100, Math.max(90, Math.round(baseVitals.spO2 + (Math.random() * 2 - 1)))),
        temperature: parseFloat((baseVitals.temperature + (Math.random() * 0.2 - 0.1)).toFixed(1)),
        respiratoryRate: Math.round(baseVitals.respiratoryRate + (Math.random() * 2 - 1))
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [baseVitals, live]);

  return (
    <div className="vitals-grid">
      {/* Heart Rate */}
      <div className="vital-card hr">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--rose-danger)', textTransform: 'uppercase' }}>Heart Rate</span>
          <Heart size={16} color="var(--rose-danger)" />
        </div>
        <div className="vital-val">{vitals.heartRate}</div>
        <div className="vital-unit">BPM • Normal: 60-100</div>
      </div>

      {/* Blood Pressure */}
      <div className="vital-card bp">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--medical-blue)', textTransform: 'uppercase' }}>Blood Pressure</span>
          <Activity size={16} color="var(--medical-blue)" />
        </div>
        <div className="vital-val">{vitals.systolicBP}/{vitals.diastolicBP}</div>
        <div className="vital-unit">mmHg • Target: 120/80</div>
      </div>

      {/* SpO2 */}
      <div className="vital-card spo2">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase' }}>SpO2 Pulse Ox</span>
          <Activity size={16} color="var(--accent-teal)" />
        </div>
        <div className="vital-val">{vitals.spO2}%</div>
        <div className="vital-unit">Normal: 95 - 100%</div>
      </div>

      {/* Temperature */}
      <div className="vital-card temp">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--amber-warning)', textTransform: 'uppercase' }}>Temperature</span>
          <Thermometer size={16} color="var(--amber-warning)" />
        </div>
        <div className="vital-val">{vitals.temperature}°C</div>
        <div className="vital-unit">Oral • Normal: 36.5 - 37.5°C</div>
      </div>

      {/* Respiration */}
      <div className="vital-card rr">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--purple-accent)', textTransform: 'uppercase' }}>Respiration Rate</span>
          <Wind size={16} color="var(--purple-accent)" />
        </div>
        <div className="vital-val">{vitals.respiratoryRate}</div>
        <div className="vital-unit">Breaths/min • Normal: 12-20</div>
      </div>
    </div>
  );
};
