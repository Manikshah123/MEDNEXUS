import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Syringe,
  Pill,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HeartPulse,
  X,
  FileText,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NursingPage = () => {
  const { patients, orders, refreshData, showToast } = useHospital();
  const { currentUser } = useAuth();

  const [activeWardFilter, setActiveWardFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAdministerModal, setShowAdministerModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [targetPatient, setTargetPatient] = useState(null);
  const [administerNotes, setAdministerNotes] = useState('Administered as prescribed. Vitals monitored.');

  // Vitals form state
  const [vitalsForm, setVitalsForm] = useState({
    heartRate: 78,
    systolicBP: 120,
    diastolicBP: 80,
    spO2: 98,
    temperature: 36.8,
    respiratoryRate: 16
  });

  const admittedPatients = patients.filter(p => p.status === 'Admitted');
  const medOrders = orders.filter(o => ['Medication', 'Injection', 'IV Fluid'].includes(o.category));

  const handleOpenAdminister = (order) => {
    setSelectedOrder(order);
    setShowAdministerModal(true);
  };

  const handleConfirmAdminister = async () => {
    if (!selectedOrder) return;
    try {
      await api.nursing.recordAdministration({
        orderId: selectedOrder.orderId,
        patientId: selectedOrder.patientId,
        medicineName: selectedOrder.medicineName,
        dosage: selectedOrder.dosage,
        nurseName: currentUser?.name || 'Anita Verma',
        notes: administerNotes
      });

      await refreshData();
      showToast(`Medication ${selectedOrder.medicineName} recorded as administered for ${selectedOrder.patientName}`, 'success');
      setShowAdministerModal(false);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const handleOpenVitals = (patient) => {
    setTargetPatient(patient);
    setShowVitalsModal(true);
  };

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    if (!targetPatient) return;
    try {
      await api.nursing.recordVitals(targetPatient.patientId, vitalsForm, currentUser?.name);
      await refreshData();
      showToast(`Vitals logged for ${targetPatient.firstName} ${targetPatient.lastName}`, 'success');
      setShowVitalsModal(false);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Syringe size={24} color="var(--accent-teal)" />
            <h1>Nurse Station & eMAR Administration</h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Electronic Medication Administration Record, scheduled dose dispatch, and clinical bedside charting.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-normal" style={{ padding: '6px 12px' }}>
            Shift Nurse: {currentUser?.name} (Emergency & Ward RN)
          </span>
        </div>
      </div>

      {/* Main Grid: Scheduled Medication Administration Queue */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Pill size={18} color="var(--accent-teal)" />
              <span>eMAR Scheduled Medication Administration Queue</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Verify dosage, check patient allergy alerts and record immediate clinical administration
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="med-table">
            <thead>
              <tr>
                <th>Patient & Bed</th>
                <th>Prescribed Medication</th>
                <th>Dose & Route</th>
                <th>Schedule Frequency</th>
                <th>Pharmacy Status</th>
                <th>Safety & Action</th>
              </tr>
            </thead>
            <tbody>
              {medOrders.map(order => {
                const p = patients.find(pat => pat.patientId === order.patientId);
                const hasAllergies = p?.allergies && p.allergies.length > 0;

                return (
                  <tr key={order._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div>
                          <Link to={`/patient/${order.patientId}`} style={{ fontWeight: 700, color: 'var(--primary-navy)', textDecoration: 'none' }}>
                            {order.patientName}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span className="mono" style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>{order.patientId}</span>
                            {order.bed && <span> • <strong>Bed {order.bed}</strong></span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{order.medicineName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>By: {order.doctorName}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{order.dosage}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Route: {order.route}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{order.frequency}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-teal)' }}>
                        Times: {order.administrationTimes?.join(', ') || '08:00 AM'}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${order.pharmacyStatus === 'Dispensed' ? 'badge-dispensed' : 'badge-preparing'}`}>
                        {order.pharmacyStatus || 'Ready'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {hasAllergies && (
                          <span title={`Allergic to: ${p.allergies.join(', ')}`} style={{ color: 'var(--rose-danger)' }}>
                            <AlertTriangle size={16} />
                          </span>
                        )}
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenAdminister(order)}
                        >
                          <CheckCircle2 size={14} />
                          <span>Administer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inpatient Vitals Logging Roster */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <HeartPulse size={18} color="var(--rose-danger)" />
              <span>Ward Inpatient Vitals & Observations Charting</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Log routine vitals checks directly into the permanent patient timeline
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="med-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Current Bed Location</th>
                <th>Primary Diagnosis</th>
                <th>Last Vitals Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admittedPatients.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{p.firstName} {p.lastName}</div>
                    <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-teal)' }}>{p.patientId}</div>
                  </td>
                  <td>
                    <span className="badge badge-occupied">
                      {p.currentWardName} • Bed {p.currentBed}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {p.diagnosis || 'Observation'}
                  </td>
                  <td>
                    <span className="badge badge-normal">
                      HR: 78 • BP: 122/80 • SpO2: 98%
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenVitals(p)}
                      >
                        <Activity size={14} color="var(--accent-teal)" />
                        <span>Log Vitals</span>
                      </button>
                      <Link to={`/bedside?patientId=${p.patientId}`} className="btn btn-secondary btn-sm" title="Bedside Monitor">
                        <HeartPulse size={14} color="var(--rose-danger)" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Administer Medication Verification Modal */}
      {showAdministerModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowAdministerModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
                Verify & Administer Medication
              </div>
              <button className="btn-icon" onClick={() => setShowAdministerModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: 'var(--accent-teal-light)',
                border: '1px solid rgba(8, 131, 126, 0.3)',
                padding: '16px',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-teal-dark)' }}>
                  {selectedOrder.medicineName} ({selectedOrder.dosage})
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Route: <strong>{selectedOrder.route}</strong> • Patient: <strong>{selectedOrder.patientName} ({selectedOrder.patientId})</strong>
                </div>
                {selectedOrder.instruction && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-navy)', marginTop: 8, fontStyle: 'italic' }}>
                    Doctor Instruction: "{selectedOrder.instruction}"
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Nurse Observation & Administration Notes</label>
                <textarea 
                  className="form-textarea"
                  value={administerNotes}
                  onChange={e => setAdministerNotes(e.target.value)}
                />
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Authenticated Nurse Signature: <strong>{currentUser?.name || 'Anita Verma'} (RN)</strong>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAdministerModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmAdminister}>
                Confirm Administration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Vitals Modal */}
      {showVitalsModal && targetPatient && (
        <div className="modal-overlay" onClick={() => setShowVitalsModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
                Record Bedside Vitals: {targetPatient.firstName} {targetPatient.lastName}
              </div>
              <button className="btn-icon" onClick={() => setShowVitalsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVitals}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Heart Rate (BPM)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={vitalsForm.heartRate}
                      onChange={e => setVitalsForm(prev => ({ ...prev, heartRate: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SpO2 (%)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={vitalsForm.spO2}
                      onChange={e => setVitalsForm(prev => ({ ...prev, spO2: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Systolic BP (mmHg)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={vitalsForm.systolicBP}
                      onChange={e => setVitalsForm(prev => ({ ...prev, systolicBP: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Diastolic BP (mmHg)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={vitalsForm.diastolicBP}
                      onChange={e => setVitalsForm(prev => ({ ...prev, diastolicBP: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Body Temperature (°C)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control"
                      value={vitalsForm.temperature}
                      onChange={e => setVitalsForm(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Respiration Rate (/min)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={vitalsForm.respiratoryRate}
                      onChange={e => setVitalsForm(prev => ({ ...prev, respiratoryRate: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowVitalsModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Vitals to Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
