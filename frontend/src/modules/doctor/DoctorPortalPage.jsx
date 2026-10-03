import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Stethoscope, 
  Plus, 
  Pill, 
  Activity, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Clock, 
  X,
  HeartPulse,
  Syringe,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const DoctorPortalPage = () => {
  const { patients, medicines, orders, refreshData, showToast } = useHospital();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Order Form State
  const [orderForm, setOrderForm] = useState({
    category: 'Medication',
    medicineName: 'Ceftriaxone',
    dosage: '1g',
    route: 'IV',
    frequency: 'Every 12 hours',
    duration: '5 days',
    administrationTimes: '08:00 AM, 08:00 PM',
    instruction: 'Administer after verifying allergy status. Monitor IV site.',
    priority: 'Normal'
  });

  const admittedPatients = patients.filter(p => p.status === 'Admitted');
  const myPatients = admittedPatients.filter(
    p => !currentUser || currentUser.role !== 'doctor' || p.assignedDoctorName?.includes(currentUser.name.split(' ')[1] || '')
  );

  const handleOpenOrderModal = (patient) => {
    setSelectedPatient(patient);
    setShowOrderModal(true);
  };

  const handleMedicineSelect = (medName) => {
    const med = medicines.find(m => m.name === medName);
    if (med) {
      setOrderForm(prev => ({
        ...prev,
        medicineName: med.name,
        dosage: med.strength,
        route: med.form === 'Injection' || med.form === 'IV' ? 'IV' : med.form === 'Inhaler' ? 'Inhaled' : 'Oral'
      }));
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setLoading(true);

    try {
      const times = orderForm.administrationTimes ? orderForm.administrationTimes.split(',').map(s => s.trim()) : [];
      
      const newOrder = {
        patientId: selectedPatient.patientId,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        doctorName: currentUser?.name || 'Dr. Anand Sharma',
        category: orderForm.category,
        medicineName: orderForm.category === 'Medication' || orderForm.category === 'Injection' || orderForm.category === 'IV Fluid' ? orderForm.medicineName : '',
        dosage: orderForm.dosage,
        route: orderForm.route,
        frequency: orderForm.frequency,
        duration: orderForm.duration,
        administrationTimes: times,
        instruction: orderForm.instruction,
        priority: orderForm.priority,
        ward: selectedPatient.currentWardName || '',
        room: selectedPatient.currentRoom || '',
        bed: selectedPatient.currentBed || ''
      };

      await api.orders.create(newOrder);
      await refreshData();
      showToast(`Order created for ${selectedPatient.firstName} and dispatched to Pharmacy / Nursing schedule.`, 'success');
      setShowOrderModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to create order', 'danger');
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
            <Stethoscope size={24} color="var(--accent-teal)" />
            <h1>Doctor Portal & Clinical Command</h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Conduct inpatient ward rounds, review diagnostic vitals, place pharmacy orders & clinical instructions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-normal" style={{ padding: '6px 12px' }}>
            Attending: {currentUser?.name} ({currentUser?.department || 'Internal Medicine'})
          </span>
        </div>
      </div>

      {/* Main Patient List for Doctor */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Activity size={18} color="var(--accent-teal)" />
              <span>Assigned Inpatient Ward Rounds ({admittedPatients.length})</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time patient vitals, diagnosis and 1-click clinical order placement
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="med-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Ward / Bed</th>
                <th>Primary Diagnosis</th>
                <th>Known Allergies</th>
                <th>Active Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admittedPatients.map(p => {
                const pOrders = orders.filter(o => o.patientId === p.patientId);
                const hasAllergies = p.allergies && p.allergies.length > 0;

                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: 'var(--medical-blue-light)',
                          color: 'var(--medical-blue)',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem'
                        }}>
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div>
                          <Link to={`/patient/${p.patientId}`} style={{ fontWeight: 700, color: 'var(--primary-navy)', textDecoration: 'none' }}>
                            {p.firstName} {p.lastName}
                          </Link>
                          <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-teal)' }}>
                            {p.patientId} • {p.gender}, {p.age || 35}y
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-occupied" style={{ fontWeight: 700 }}>
                        {p.currentWardName} • Bed {p.currentBed}
                      </span>
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-navy)' }}>
                        {p.diagnosis || 'Clinical evaluation in progress'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Priority: <strong>{p.priority}</strong>
                      </div>
                    </td>

                    <td>
                      {hasAllergies ? (
                        <span className="badge badge-emergency" style={{ fontSize: '0.72rem' }}>
                          <AlertTriangle size={12} /> {p.allergies.join(', ')}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None recorded</span>
                      )}
                    </td>

                    <td>
                      <span className="badge badge-normal">
                        {pOrders.length} Orders Active
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenOrderModal(p)}
                        >
                          <Plus size={14} />
                          <span>Prescribe</span>
                        </button>
                        <Link to={`/patient/${p.patientId}`} className="btn btn-secondary btn-sm">
                          Profile
                        </Link>
                        <Link to={`/bedside?patientId=${p.patientId}`} className="btn btn-secondary btn-sm" title="Bedside Vitals">
                          <HeartPulse size={14} color="var(--rose-danger)" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Prescription / Order Modal */}
      {showOrderModal && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Pill size={20} color="var(--accent-teal)" />
                  <span>Clinical Prescription & Order Requisition</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Prescribing for: <strong>{selectedPatient.firstName} {selectedPatient.lastName} ({selectedPatient.patientId})</strong> • Bed {selectedPatient.currentBed}
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowOrderModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Allergy warning if any */}
                {selectedPatient.allergies?.length > 0 && (
                  <div style={{
                    backgroundColor: 'var(--rose-light)',
                    border: '1px solid rgba(225, 29, 72, 0.3)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--rose-danger)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <AlertTriangle size={18} />
                    <span>SAFETY ALERT: Patient is allergic to: {selectedPatient.allergies.join(', ')}. Check drug interactions carefully.</span>
                  </div>
                )}

                {/* Category & Medicine */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Order Category <span className="required">*</span></label>
                    <select 
                      className="form-select"
                      value={orderForm.category}
                      onChange={e => setOrderForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="Medication">Oral / Tablet Medication</option>
                      <option value="Injection">Injection / Syringe</option>
                      <option value="IV Fluid">IV Fluid Infusion</option>
                      <option value="Lab Test">Laboratory Investigation</option>
                      <option value="Imaging">Radiology / Imaging</option>
                      <option value="Monitoring">Nurse Bedside Monitoring</option>
                    </select>
                  </div>

                  {['Medication', 'Injection', 'IV Fluid'].includes(orderForm.category) && (
                    <div className="form-group">
                      <label className="form-label">Select Formularly Medicine <span className="required">*</span></label>
                      <select 
                        className="form-select"
                        value={orderForm.medicineName}
                        onChange={e => handleMedicineSelect(e.target.value)}
                      >
                        {medicines.map(m => (
                          <option key={m._id} value={m.name}>
                            {m.name} ({m.genericName} - {m.strength}) • Stock: {m.stock}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Dosage, Route, Frequency */}
                {['Medication', 'Injection', 'IV Fluid'].includes(orderForm.category) && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Dosage <span className="required">*</span></label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. 500mg, 1g, 2 puffs"
                        value={orderForm.dosage}
                        onChange={e => setOrderForm(prev => ({ ...prev, dosage: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Route of Administration <span className="required">*</span></label>
                      <select 
                        className="form-select"
                        value={orderForm.route}
                        onChange={e => setOrderForm(prev => ({ ...prev, route: e.target.value }))}
                      >
                        <option value="Oral">Oral (PO)</option>
                        <option value="IV">Intravenous (IV)</option>
                        <option value="IM">Intramuscular (IM)</option>
                        <option value="SC">Subcutaneous (SC)</option>
                        <option value="Inhaled">Inhaled</option>
                        <option value="Topical">Topical</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Frequency <span className="required">*</span></label>
                      <select 
                        className="form-select"
                        value={orderForm.frequency}
                        onChange={e => setOrderForm(prev => ({ ...prev, frequency: e.target.value }))}
                      >
                        <option value="Once daily">Once daily (OD)</option>
                        <option value="Twice daily">Twice daily (BD / BID)</option>
                        <option value="Three times daily">Three times daily (TDS / TID)</option>
                        <option value="Every 6 hours">Every 6 hours (QID)</option>
                        <option value="Every 8 hours">Every 8 hours</option>
                        <option value="Every 12 hours">Every 12 hours</option>
                        <option value="STAT / Immediate">STAT (Immediate Once)</option>
                        <option value="PRN / As Needed">PRN (As Needed / SOS)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Administration Times & Duration */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Administration Schedule Times (comma-separated)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. 08:00 AM, 08:00 PM"
                      value={orderForm.administrationTimes}
                      onChange={e => setOrderForm(prev => ({ ...prev, administrationTimes: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. 5 days, 7 days, 30 days"
                      value={orderForm.duration}
                      onChange={e => setOrderForm(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Order Priority</label>
                    <select 
                      className="form-select"
                      value={orderForm.priority}
                      onChange={e => setOrderForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Emergency">Emergency / STAT</option>
                    </select>
                  </div>
                </div>

                {/* Special Clinical Instructions */}
                <div className="form-group">
                  <label className="form-label">Clinical & Nursing Special Instructions</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="e.g. Administer after meals, hold if systolic BP < 100, monitor hourly urine output..."
                    value={orderForm.instruction}
                    onChange={e => setOrderForm(prev => ({ ...prev, instruction: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Dispatching...' : 'Authorize & Dispatch Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
