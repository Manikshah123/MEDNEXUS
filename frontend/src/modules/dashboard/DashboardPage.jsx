import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { PatientBadge } from '../../components/common/PatientBadge';
import { TimelineWidget } from '../../components/common/TimelineWidget';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  BedDouble,
  HeartPulse,
  Pill,
  Receipt,
  UserPlus,
  Stethoscope,
  Activity,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const DashboardPage = () => {
  const { patients, wards, orders, medicines, bills, notifications } = useHospital();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Compute Metrics
  const admittedPatients = patients.filter(p => p.status === 'Admitted');
  const emergencyPatients = patients.filter(p => p.priority === 'Emergency' || p.priority === 'Urgent');
  
  let totalBeds = 0;
  let occupiedBeds = 0;
  wards.forEach(w => {
    totalBeds += (w.totalBeds || 0);
    occupiedBeds += (w.occupiedBeds || 0);
  });
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const pendingPharmacyOrders = orders.filter(o => o.category === 'Medication' && o.pharmacyStatus === 'Preparing');
  const totalRevenue = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);

  // Collect most recent events across all patients
  const recentEvents = patients
    .flatMap(p => (p.timeline || []).map(t => ({ ...t, patientName: `${p.firstName} ${p.lastName}`, patientId: p.patientId })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-navy) 0%, #1e3a5f 100%)',
        color: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-md)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="pulse-indicator live" style={{ width: 10, height: 10 }}></span>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hospital Operational Command Center
            </span>
          </div>
          <h1 style={{ color: 'white', fontSize: '1.7rem', fontWeight: 800 }}>
            Welcome back, {currentUser?.name}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 4 }}>
            MEDNEXUS is currently monitoring <strong>{admittedPatients.length} admitted patients</strong> across {wards.length} specialized wards.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/reception')}
            style={{ backgroundColor: 'var(--accent-teal)' }}
          >
            <UserPlus size={16} />
            <span>Register Patient</span>
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/doctor')}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <Stethoscope size={16} />
            <span>Doctor Rounds</span>
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/bedside')}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <HeartPulse size={16} />
            <span>Bedside Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard 
          title="Total Registered" 
          value={patients.length} 
          subtitle="Unique Patient IDs" 
          icon={Users} 
          color="blue"
        />
        <StatCard 
          title="Inpatient Admissions" 
          value={admittedPatients.length} 
          subtitle={`${emergencyPatients.length} high priority`} 
          icon={BedDouble} 
          color="rose"
        />
        <StatCard 
          title="Ward Bed Occupancy" 
          value={`${occupancyRate}%`} 
          subtitle={`${occupiedBeds} / ${totalBeds} beds occupied`} 
          icon={Activity} 
          color="teal"
        />
        <StatCard 
          title="Pharmacy Dispense Queue" 
          value={pendingPharmacyOrders.length} 
          subtitle="Awaiting preparation" 
          icon={Pill} 
          color="amber"
        />
        <StatCard 
          title="Revenue Realized" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          subtitle="Hospital ledger receipts" 
          icon={Receipt} 
          color="emerald"
        />
      </div>

      {/* Main Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px' }}>
        {/* Left Column: Active Inpatient Ward Roster & Bed Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Admitted Patients Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <HeartPulse size={18} color="var(--accent-teal)" />
                  <span>Active Inpatient Roster ({admittedPatients.length})</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Continuous journey tracking connected via unique Patient ID
                </div>
              </div>
              <Link to="/patients" className="btn btn-secondary btn-sm">
                View All Directory
              </Link>
            </div>

            <div className="table-container">
              <table className="med-table">
                <thead>
                  <tr>
                    <th>Patient Identifier</th>
                    <th>Diagnosis / Reason</th>
                    <th>Ward / Bed</th>
                    <th>Attending Doctor</th>
                    <th>Priority</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admittedPatients.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: 'var(--medical-blue-light)',
                            color: 'var(--medical-blue)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem'
                          }}>
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <div>
                            <Link to={`/patient/${p.patientId}`} style={{ fontWeight: 700, color: 'var(--primary-navy)', textDecoration: 'none' }}>
                              {p.firstName} {p.lastName}
                            </Link>
                            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-teal)' }}>
                              {p.patientId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: '200px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-navy)' }}>{p.diagnosis || 'Under Observation'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Blood: {p.bloodGroup}</div>
                      </td>
                      <td>
                        <span className="badge badge-occupied" style={{ fontWeight: 700 }}>
                          {p.currentWardName || 'Emergency'} • Bed {p.currentBed || 'N/A'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {p.assignedDoctorName || 'Dr. Anand Sharma'}
                      </td>
                      <td>
                        <span className={`badge ${p.priority === 'Emergency' ? 'badge-emergency' : p.priority === 'Urgent' ? 'badge-urgent' : 'badge-normal'}`}>
                          {p.priority || 'Normal'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Link to={`/bedside?patientId=${p.patientId}`} className="btn btn-secondary btn-sm" title="Open Bedside Monitor">
                            <HeartPulse size={14} color="var(--rose-danger)" />
                          </Link>
                          <Link to={`/patient/${p.patientId}`} className="btn btn-outline-teal btn-sm">
                            Journey
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ward Bed Capacities Overview */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BedDouble size={18} color="var(--medical-blue)" />
                <span>Ward Bed Capacities & Occupancy Levels</span>
              </div>
              <Link to="/wards" className="btn btn-secondary btn-sm">
                Open Bed Map
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {wards.slice(0, 4).map(ward => {
                const total = ward.totalBeds || 1;
                const occ = ward.occupiedBeds || 0;
                const pct = Math.round((occ / total) * 100);

                return (
                  <div key={ward._id} style={{
                    padding: '16px',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-alt)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>{ward.name}</span>
                      <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: pct > 80 ? 'var(--rose-danger)' : 'var(--accent-teal)' }}>
                        {occ}/{total} ({pct}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-light)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: pct > 80 ? 'var(--rose-danger)' : pct > 50 ? 'var(--amber-warning)' : 'var(--accent-teal)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>Floor {ward.floor} • Head: {ward.headNurse || 'Staff'}</span>
                      <span>Ext: {ward.contactExtension || '1000'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Clinical Stream & System Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* High Priority Alerts */}
          <div className="card" style={{ borderColor: 'rgba(225, 29, 72, 0.3)' }}>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <div className="card-title" style={{ color: 'var(--rose-danger)' }}>
                <AlertTriangle size={18} />
                <span>Clinical Triage & Alerts</span>
              </div>
              <span className="badge badge-emergency">Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.filter(n => n.priority === 'Critical' || n.priority === 'High').slice(0, 3).map(n => (
                <div key={n._id} style={{
                  padding: '12px',
                  backgroundColor: 'var(--rose-light)',
                  border: '1px solid rgba(225, 29, 72, 0.2)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--rose-danger)', marginBottom: 2 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                    {n.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Hospital Event Feed */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="var(--purple-accent)" />
                <span>Live Hospital Event Feed</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recentEvents.map((ev, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  paddingBottom: '12px',
                  borderBottom: idx < recentEvents.length - 1 ? '1px solid var(--border-light)' : 'none'
                }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-teal-light)',
                    color: 'var(--accent-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <Activity size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--primary-navy)' }}>
                        {ev.event}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {ev.description}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', fontWeight: 600, marginTop: 3 }}>
                      Patient: {ev.patientName} ({ev.patientId})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
