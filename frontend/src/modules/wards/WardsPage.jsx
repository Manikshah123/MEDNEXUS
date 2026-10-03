import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  BedDouble,
  Users,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Plus,
  ArrowRight,
  HeartPulse,
  X,
  Phone,
  Layers,
  Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const WardsPage = () => {
  const { wards, patients, refreshData, showToast } = useHospital();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedWardId, setSelectedWardId] = useState(wards[0]?._id || 'w1');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetBed, setTargetBed] = useState(null);
  const [loading, setLoading] = useState(false);

  // Assign Form
  const [assignForm, setAssignForm] = useState({
    patientId: '',
    doctorName: 'Dr. Anand Sharma',
    diagnosis: '',
    priority: 'Normal'
  });

  const activeWard = wards.find(w => w._id === selectedWardId) || wards[0];
  const unadmittedPatients = patients.filter(p => p.status !== 'Admitted');

  const handleOpenAssign = (roomNumber, bed) => {
    if (bed.status === 'Occupied') {
      if (bed.patientId) navigate(`/patient/${bed.patientId}`);
      return;
    }

    setTargetBed({ roomNumber, bedId: bed.bedId });
    setAssignForm(prev => ({
      ...prev,
      patientId: unadmittedPatients[0]?.patientId || '',
      diagnosis: unadmittedPatients[0]?.diagnosis || 'Acute Inpatient Admission'
    }));
    setShowAssignModal(true);
  };

  const handleBedStatusToggle = async (roomNumber, bedId, currentStatus) => {
    const nextStatus = currentStatus === 'Available' ? 'Cleaning' : 'Available';
    try {
      await api.wards.updateBedStatus(activeWard._id, roomNumber, bedId, nextStatus);
      await refreshData();
      showToast(`Bed ${bedId} updated to ${nextStatus}`, 'info');
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!targetBed || !assignForm.patientId) return;
    setLoading(true);

    try {
      await api.wards.assignBed({
        patientId: assignForm.patientId,
        wardId: activeWard._id,
        roomNumber: targetBed.roomNumber,
        bedId: targetBed.bedId,
        doctorName: assignForm.doctorName,
        diagnosis: assignForm.diagnosis,
        priority: assignForm.priority
      });

      await refreshData();
      showToast(`Patient successfully admitted to ${activeWard.name}, Bed ${targetBed.bedId}!`, 'success');
      setShowAssignModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to assign bed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BedDouble size={24} color="var(--accent-teal)" />
            <h1>Ward Management & Interactive Bed Map</h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Real-time visual bed layout, occupancy status, sterilization tracking and admission assignment.
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-surface)', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--emerald-success)' }}></span>
            <span>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--medical-blue)' }}></span>
            <span>Occupied</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--purple-accent)' }}></span>
            <span>Sterilization</span>
          </div>
        </div>
      </div>

      {/* Ward Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '6px'
      }}>
        {wards.map(ward => {
          const isSelected = ward._id === activeWard?._id;
          const occ = ward.occupiedBeds || 0;
          const total = ward.totalBeds || 1;
          const pct = Math.round((occ / total) * 100);

          return (
            <button
              key={ward._id}
              onClick={() => setSelectedWardId(ward._id)}
              style={{
                padding: '12px 18px',
                borderRadius: 'var(--radius-lg)',
                border: isSelected ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
                backgroundColor: isSelected ? 'var(--accent-teal-light)' : 'var(--bg-surface)',
                color: isSelected ? 'var(--accent-teal-dark)' : 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                minWidth: '200px',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{ward.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Floor {ward.floor}</span>
                <span className="mono" style={{ fontWeight: 700, color: pct > 80 ? 'var(--rose-danger)' : 'inherit' }}>
                  {occ}/{total} ({pct}%)
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Ward Bed Grid Map */}
      {activeWard && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Layers size={18} color="var(--accent-teal)" />
                <span>{activeWard.name} — Bed Floor Matrix</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Head Nurse: {activeWard.headNurse || 'Staff Nurse'} • Extension: {activeWard.contactExtension || '1000'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-normal">
                {activeWard.availableBeds || 0} Beds Available
              </span>
              <span className="badge badge-occupied">
                {activeWard.occupiedBeds || 0} Occupied
              </span>
            </div>
          </div>

          {/* Rooms and Beds Layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(activeWard.rooms || []).map(room => (
              <div key={room.roomNumber} style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                backgroundColor: 'var(--bg-surface-alt)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                    Room {room.roomNumber} ({room.roomType})
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {room.beds?.length || 0} Beds Capacity
                  </span>
                </div>

                {/* Bed Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  {(room.beds || []).map(bed => {
                    const isOccupied = bed.status === 'Occupied';
                    const isCleaning = bed.status === 'Cleaning';

                    return (
                      <div
                        key={bed.bedId}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: isOccupied 
                            ? '1.5px solid var(--medical-blue)' 
                            : isCleaning 
                            ? '1.5px solid var(--purple-accent)' 
                            : '1.5px dashed var(--emerald-success)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: 'var(--shadow-xs)',
                          position: 'relative'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span className="mono" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                              Bed {bed.bedNumber}
                            </span>
                            <span className={`badge ${isOccupied ? 'badge-occupied' : isCleaning ? 'badge-cleaning' : 'badge-available'}`}>
                              {bed.status}
                            </span>
                          </div>

                          {isOccupied ? (
                            <div style={{ fontSize: '0.82rem', marginBottom: '12px' }}>
                              <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                                {bed.patientName || 'Admitted Patient'}
                              </div>
                              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-teal)' }}>
                                {bed.patientId}
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                              {isCleaning ? 'Sterilization & sanitize in progress' : 'Ready for immediate patient intake'}
                            </div>
                          )}
                        </div>

                        {/* Bed Action Bar */}
                        <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                          {isOccupied ? (
                            <>
                              <Link to={`/bedside?patientId=${bed.patientId}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }} title="Open Bedside Monitor">
                                <HeartPulse size={14} color="var(--rose-danger)" />
                                <span>Monitor</span>
                              </Link>
                              <Link to={`/patient/${bed.patientId}`} className="btn btn-outline-teal btn-sm" style={{ flex: 1 }}>
                                Profile
                              </Link>
                            </>
                          ) : (
                            <>
                              <button 
                                className="btn btn-primary btn-sm"
                                style={{ flex: 1 }}
                                onClick={() => handleOpenAssign(room.roomNumber, bed)}
                              >
                                <Plus size={14} />
                                <span>Admit</span>
                              </button>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleBedStatusToggle(room.roomNumber, bed.bedId, bed.status)}
                                title="Toggle Sterilization / Available status"
                              >
                                <Sparkles size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bed Assignment & Admission Modal */}
      {showAssignModal && targetBed && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
                  Admit Patient to Bed {targetBed.bedId}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {activeWard.name} • Room {targetBed.roomNumber}
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowAssignModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Select Patient to Admit <span className="required">*</span></label>
                  <select 
                    className="form-select"
                    value={assignForm.patientId}
                    onChange={e => setAssignForm(prev => ({ ...prev, patientId: e.target.value }))}
                    required
                  >
                    {unadmittedPatients.length === 0 ? (
                      <option value="">All registered patients are already admitted</option>
                    ) : (
                      unadmittedPatients.map(p => (
                        <option key={p.patientId} value={p.patientId}>
                          {p.firstName} {p.lastName} ({p.patientId}) • Blood: {p.bloodGroup}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Attending Doctor <span className="required">*</span></label>
                  <select 
                    className="form-select"
                    value={assignForm.doctorName}
                    onChange={e => setAssignForm(prev => ({ ...prev, doctorName: e.target.value }))}
                  >
                    <option value="Dr. Anand Sharma">Dr. Anand Sharma (Emergency Medicine)</option>
                    <option value="Dr. Priya Mehta">Dr. Priya Mehta (Internal Medicine)</option>
                    <option value="Dr. Vikram Singh">Dr. Vikram Singh (Cardiology)</option>
                    <option value="Dr. Arun Patel">Dr. Arun Patel (Orthopedics)</option>
                    <option value="Dr. Ramesh Iyer">Dr. Ramesh Iyer (Pulmonology)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Admission Diagnosis / Clinical Reason <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Sepsis, Post-op hip fracture, Acute MI"
                    value={assignForm.diagnosis}
                    onChange={e => setAssignForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Triage Priority</label>
                  <select 
                    className="form-select"
                    value={assignForm.priority}
                    onChange={e => setAssignForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="Normal">Normal Admission</option>
                    <option value="Urgent">Urgent Admission</option>
                    <option value="Emergency">Emergency / Critical</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || unadmittedPatients.length === 0}>
                  {loading ? 'Admitting...' : 'Confirm Admission & Bed Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
