import React, { useState, useEffect, useRef } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useSearchParams, Link } from 'react-router-dom';
import '../../styles/bedside.css';
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  Pill,
  Clock,
  PhoneCall,
  User,
  ShieldAlert,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';

export const BedsideMonitorPage = () => {
  const { patients, orders, showToast } = useHospital();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef(null);

  const initialPatientId = searchParams.get('patientId');
  const admittedPatients = patients.filter(p => p.status === 'Admitted');
  
  const [activePatient, setActivePatient] = useState(
    admittedPatients.find(p => p.patientId === initialPatientId) || admittedPatients[0] || patients[0]
  );

  const [callNurseActive, setCallNurseActive] = useState(false);

  // Live fluctuating vitals for bedside telemetry
  const [liveTelemetry, setLiveTelemetry] = useState({
    heartRate: 78,
    systolicBP: 122,
    diastolicBP: 79,
    spO2: 98,
    respiratoryRate: 16,
    temperature: 36.9
  });

  useEffect(() => {
    if (initialPatientId) {
      const found = admittedPatients.find(p => p.patientId === initialPatientId);
      if (found) setActivePatient(found);
    }
  }, [initialPatientId, admittedPatients]);

  // Vitals Fluctuation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTelemetry(prev => ({
        heartRate: Math.round(76 + Math.sin(Date.now() / 3000) * 8 + (Math.random() * 2 - 1)),
        systolicBP: Math.round(120 + Math.cos(Date.now() / 5000) * 6 + (Math.random() * 2 - 1)),
        diastolicBP: Math.round(78 + Math.sin(Date.now() / 4000) * 4 + (Math.random() * 2 - 1)),
        spO2: Math.min(100, Math.max(92, Math.round(97 + (Math.random() * 2 - 1)))),
        respiratoryRate: Math.round(16 + (Math.random() * 2 - 1)),
        temperature: parseFloat((36.8 + (Math.random() * 0.2 - 0.1)).toFixed(1))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Canvas ECG Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let x = 0;
    let dataPoints = [];

    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    const midY = height / 2;

    const render = () => {
      // Fade trail
      ctx.fillStyle = 'rgba(17, 24, 39, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Advance X
      x = (x + 3) % width;
      if (x <= 3) {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, width, height);
      }

      // ECG P-Q-R-S-T spike pattern
      const cyclePos = (x % 140);
      let y = midY;
      if (cyclePos === 20) y = midY - 6; // P wave
      else if (cyclePos === 40) y = midY + 4; // Q
      else if (cyclePos === 50) y = midY - 34; // R spike
      else if (cyclePos === 60) y = midY + 14; // S
      else if (cyclePos === 80) y = midY - 10; // T wave
      else y = midY + (Math.random() * 2 - 1); // Baseline noise

      ctx.beginPath();
      ctx.strokeStyle = '#22c55e'; // Medical Green ECG
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#22c55e';
      ctx.moveTo(x - 3, midY);
      ctx.lineTo(x, y);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activePatient]);

  const handleNurseCall = () => {
    setCallNurseActive(true);
    showToast(`Emergency Nurse Assistance requested for Bed ${activePatient?.currentBed || 'EMR'}. Station alerted.`, 'danger');
    setTimeout(() => setCallNurseActive(false), 8000);
  };

  if (!activePatient) {
    return (
      <div className="bedside-monitor-page" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>No admitted patients in telemetry registry.</h2>
        <Link to="/wards" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Go to Ward & Bed Map
        </Link>
      </div>
    );
  }

  const patientMedOrders = orders.filter(
    o => o.patientId === activePatient.patientId && ['Medication', 'Injection', 'IV Fluid'].includes(o.category)
  );

  return (
    <div className="bedside-monitor-page">
      {/* Top Header Controls */}
      <div className="bedside-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to={`/patient/${activePatient.patientId}`} style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={20} />
            <span>Profile</span>
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="bedside-patient-name">
                {activePatient.firstName} {activePatient.lastName}
              </span>
              <span className="mono" style={{ fontSize: '1.1rem', color: '#38bdf8', fontWeight: 800 }}>
                {activePatient.patientId}
              </span>
              <span className="badge badge-emergency" style={{ fontSize: '0.8rem' }}>
                Bed: {activePatient.currentBed || 'E-01'} ({activePatient.currentWardName})
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
              Attending: <strong>{activePatient.assignedDoctorName}</strong> • Blood: <strong style={{ color: '#f87171' }}>{activePatient.bloodGroup}</strong> • Diag: {activePatient.diagnosis}
            </div>
          </div>
        </div>

        {/* Patient Switcher for Terminal Demo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Switch Bed:</span>
          <select 
            value={activePatient.patientId}
            onChange={e => {
              const p = admittedPatients.find(item => item.patientId === e.target.value);
              if (p) setActivePatient(p);
            }}
            style={{
              backgroundColor: '#1f2937',
              color: 'white',
              border: '1px solid #374151',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none'
            }}
          >
            {admittedPatients.map(p => (
              <option key={p.patientId} value={p.patientId}>
                Bed {p.currentBed}: {p.firstName} {p.lastName} ({p.currentWardName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4-Column Live Telemetry Cards */}
      <div className="bedside-telemetry-grid">
        {/* Heart Rate */}
        <div className="telemetry-card ecg">
          <div className="telemetry-label">
            <span>ECG Heart Rate</span>
            <HeartPulse size={18} />
          </div>
          <div className="telemetry-val" style={{ color: '#f87171' }}>
            {liveTelemetry.heartRate}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>BPM • Rhythm: Sinus Regular</div>
        </div>

        {/* Blood Pressure */}
        <div className="telemetry-card bp">
          <div className="telemetry-label">
            <span>NIBP Blood Pressure</span>
            <Activity size={18} />
          </div>
          <div className="telemetry-val" style={{ color: '#38bdf8' }}>
            {liveTelemetry.systolicBP}/{liveTelemetry.diastolicBP}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>mmHg • Mean: 93</div>
        </div>

        {/* SpO2 Pulse Ox */}
        <div className="telemetry-card spo2">
          <div className="telemetry-label">
            <span>SpO2 Saturation</span>
            <Activity size={18} />
          </div>
          <div className="telemetry-val" style={{ color: '#34d399' }}>
            {liveTelemetry.spO2}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Pleth Waveform Normal</div>
        </div>

        {/* Respiration & Temperature */}
        <div className="telemetry-card rr">
          <div className="telemetry-label">
            <span>Respiration / Temp</span>
            <Activity size={18} />
          </div>
          <div className="telemetry-val" style={{ color: '#c084fc', fontSize: '2.5rem' }}>
            {liveTelemetry.respiratoryRate} / <span style={{ fontSize: '2.2rem', color: '#fbbf24' }}>{liveTelemetry.temperature}°</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>RPM / °C Core Temp</div>
        </div>
      </div>

      {/* Real-time ECG Canvas Oscilloscope */}
      <div style={{
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        borderRadius: 'var(--radius-xl)',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Lead II Live Continuous Cardiac Waveform (25mm/s)
          </div>
          <span className="pulse-indicator live"></span>
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', height: '90px', borderRadius: '8px' }} />
      </div>

      {/* Bottom Grid: Active Medications Schedule & Nurse Call Station */}
      <div className="bedside-split">
        {/* Left: Active Scheduled Medications */}
        <div className="bedside-panel">
          <div className="bedside-panel-title">
            <Pill size={20} color="var(--accent-teal)" />
            <span>Active Bedside Medication Dosing & IV Infusions</span>
          </div>

          {patientMedOrders.length === 0 ? (
            <div style={{ color: '#9ca3af', padding: '20px 0' }}>
              No active medications currently ordered for this bed.
            </div>
          ) : (
            <div>
              {patientMedOrders.map((order, idx) => (
                <div 
                  key={order._id || idx}
                  className={`bedside-order-item ${idx === 0 ? 'due-now' : ''}`}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{order.medicineName}</strong>
                      <span className="mono" style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>
                        {order.dosage} ({order.route})
                      </span>
                      {idx === 0 && (
                        <span className="badge badge-emergency" style={{ fontSize: '0.7rem' }}>
                          DUE NOW
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
                      Schedule: <strong>{order.frequency}</strong> • Times: {order.administrationTimes?.join(', ') || '08:00 AM'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-dispensed" style={{ fontSize: '0.75rem' }}>
                      {order.pharmacyStatus || 'Ready'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Emergency Call Nurse & Care Team */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Emergency Nurse Button */}
          <div className="bedside-panel" style={{ textAlign: 'center' }}>
            <button 
              className="nurse-call-btn"
              onClick={handleNurseCall}
              style={{
                background: callNurseActive ? 'linear-gradient(135deg, #22c55e, #16a34a)' : undefined
              }}
            >
              <PhoneCall size={22} />
              <span>{callNurseActive ? 'NURSE STATION ALERTED' : 'CALL NURSE (EMERGENCY)'}</span>
            </button>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 8 }}>
              Pushes immediate high-priority alert to ward nurse terminal.
            </div>
          </div>

          {/* Care Team on Duty */}
          <div className="bedside-panel">
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>
              On-Duty Care Team
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Attending Physician:</span>
                <strong style={{ color: '#ffffff' }}>{activePatient.assignedDoctorName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Ward Head Nurse:</span>
                <strong style={{ color: '#ffffff' }}>Anita Verma (RN)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Emergency Extension:</span>
                <strong className="mono" style={{ color: '#38bdf8' }}>EXT-1001</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
