import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  UserPlus, 
  Search, 
  CreditCard, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Stethoscope, 
  BedDouble, 
  X,
  FileText,
  Calendar,
  Phone,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ReceptionPage = () => {
  const { patients, refreshData, showToast } = useHospital();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '',
    email: '',
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    emergencyContactName: '',
    emergencyContactRel: 'Spouse',
    emergencyContactPhone: '',
    govIdType: 'Aadhaar',
    govIdNumber: '',
    existingConditions: '',
    allergies: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    triagePriority: 'Normal',
    initialChiefComplaint: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [createdPatient, setCreatedPatient] = useState(null);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto calculate age helper
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const age = calculateAge(formData.dateOfBirth);
      const conditions = formData.existingConditions ? formData.existingConditions.split(',').map(s => s.trim()).filter(Boolean) : [];
      const allergiesList = formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [];

      const newPatientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        age: age || 30,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        email: formData.email,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRel,
          phone: formData.emergencyContactPhone
        },
        govIdType: formData.govIdType,
        govIdNumber: formData.govIdNumber,
        existingConditions: conditions,
        allergies: allergiesList,
        insuranceProvider: formData.insuranceProvider,
        insurancePolicyNumber: formData.insurancePolicyNumber,
        priority: formData.triagePriority,
        diagnosis: formData.initialChiefComplaint,
        registeredBy: currentUser?.name || 'Pooja Sharma'
      };

      const result = await api.patients.create(newPatientData);
      await refreshData();
      setCreatedPatient(result);
      setShowIdCardModal(true);
      showToast(`Patient ${result.firstName} ${result.lastName} registered successfully with ID: ${result.patientId}`, 'success');

      // Reset Form
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'Male',
        bloodGroup: 'B+',
        phone: '',
        email: '',
        street: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        emergencyContactName: '',
        emergencyContactRel: 'Spouse',
        emergencyContactPhone: '',
        govIdType: 'Aadhaar',
        govIdNumber: '',
        existingConditions: '',
        allergies: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        triagePriority: 'Normal',
        initialChiefComplaint: ''
      });
    } catch (err) {
      showToast(err.message || 'Registration failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={24} color="var(--accent-teal)" />
            <h1>Reception & Patient Registration</h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Register new hospital entries, assign permanent unique Patient ID & issue digital health smart cards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              if (patients.length > 0) {
                setCreatedPatient(patients[0]);
                setShowIdCardModal(true);
              }
            }}
          >
            <CreditCard size={16} />
            <span>Sample Patient ID Card</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Registration Form Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FileText size={18} color="var(--accent-teal)" />
              <span>New Patient Admission & Intake Form</span>
            </div>
            <span className="badge badge-normal">Auto ID Generator Active</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 1. Basic Demographics */}
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
              1. Patient Demographics & Identity
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="firstName" 
                  className="form-control" 
                  placeholder="e.g. Rahul" 
                  value={formData.firstName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="lastName" 
                  className="form-control" 
                  placeholder="e.g. Sharma" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth <span className="required">*</span></label>
                <input 
                  type="date" 
                  name="dateOfBirth" 
                  className="form-control" 
                  value={formData.dateOfBirth} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender <span className="required">*</span></label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleInputChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group <span className="required">*</span></label>
                <select name="bloodGroup" className="form-select" value={formData.bloodGroup} onChange={handleInputChange}>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* 2. Contact & Address */}
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '20px 0 12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
              2. Contact & Address Information
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Primary Mobile Phone <span className="required">*</span></label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="form-control" 
                  placeholder="e.g. 9812345001" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-control" 
                  placeholder="e.g. patient@email.com" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <input 
                  type="text" 
                  name="street" 
                  className="form-control" 
                  placeholder="Street / Flat / Locality" 
                  value={formData.street} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">City / State</label>
                <input 
                  type="text" 
                  name="city" 
                  className="form-control" 
                  placeholder="City" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            {/* 3. Emergency & Clinical Triage */}
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '20px 0 12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
              3. Emergency Contact & Clinical Triage
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Emergency Contact Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="emergencyContactName" 
                  className="form-control" 
                  placeholder="Next of Kin Name" 
                  value={formData.emergencyContactName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Phone <span className="required">*</span></label>
                <input 
                  type="tel" 
                  name="emergencyContactPhone" 
                  className="form-control" 
                  placeholder="Emergency Phone" 
                  value={formData.emergencyContactPhone} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Triage Priority</label>
                <select name="triagePriority" className="form-select" value={formData.triagePriority} onChange={handleInputChange}>
                  <option value="Normal">Normal (Routine)</option>
                  <option value="Urgent">Urgent (Priority Care)</option>
                  <option value="Emergency">Emergency (Immediate)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Chief Complaint / Initial Reason for Visit</label>
              <textarea 
                name="initialChiefComplaint" 
                className="form-textarea" 
                placeholder="e.g. High fever for 3 days, acute chest congestion, post-trauma evaluation..."
                value={formData.initialChiefComplaint}
                onChange={handleInputChange}
              />
            </div>

            {/* 4. Allergies & Medical History (Critical Highlight) */}
            <div style={{
              backgroundColor: 'var(--rose-light)',
              border: '1px solid rgba(225, 29, 72, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              margin: '16px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose-danger)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                <ShieldAlert size={18} />
                <span>Known Drug Allergies & Medical Alerts (Safety Critical)</span>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: 'var(--rose-danger)' }}>Drug / Substance Allergies (comma-separated)</label>
                  <input 
                    type="text" 
                    name="allergies" 
                    className="form-control" 
                    placeholder="e.g. Penicillin, Sulfa, NSAIDs, Latex" 
                    value={formData.allergies} 
                    onChange={handleInputChange} 
                    style={{ borderColor: 'rgba(225, 29, 72, 0.4)' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Existing Chronic Conditions</label>
                  <input 
                    type="text" 
                    name="existingConditions" 
                    className="form-control" 
                    placeholder="e.g. Diabetes, Hypertension, Asthma" 
                    value={formData.existingConditions} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Processing Registration...' : 'Complete Patient Registration & Generate ID'}
            </button>
          </form>
        </div>

        {/* Right Side: Quick Patient Directory & ID Lookup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Search size={18} color="var(--accent-teal)" />
                <span>Recent Registrations ({patients.length})</span>
              </div>
            </div>

            {/* Filter Search */}
            <div style={{ marginBottom: '14px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Filter by ID, name, or phone..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '580px', overflowY: 'auto' }}>
              {filteredPatients.slice(0, 8).map(p => (
                <div 
                  key={p._id}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-alt)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>
                      {p.firstName} {p.lastName}
                    </div>
                    <span className="mono" style={{ fontSize: '0.72rem', background: 'var(--accent-teal-light)', color: 'var(--accent-teal)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                      {p.patientId}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {p.gender}, {p.age || 35}y • Blood: <strong>{p.bloodGroup}</strong> • Phone: {p.phone}
                  </div>

                  {p.allergies?.length > 0 && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--rose-danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} /> Allergies: {p.allergies.join(', ')}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setCreatedPatient(p);
                        setShowIdCardModal(true);
                      }}
                    >
                      <CreditCard size={14} />
                      <span>Card</span>
                    </button>
                    <Link to={`/patient/${p.patientId}`} className="btn btn-outline-teal btn-sm" style={{ marginLeft: 'auto' }}>
                      Master Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Smart ID Card Modal */}
      {showIdCardModal && createdPatient && (
        <div className="modal-overlay" onClick={() => setShowIdCardModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={20} color="var(--accent-teal)" />
                <span>Patient Digital Health Card</span>
              </div>
              <button className="btn-icon" onClick={() => setShowIdCardModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {/* The Card Render */}
              <div style={{
                width: '100%',
                maxWidth: '460px',
                background: 'linear-gradient(135deg, #0f2438 0%, #1e3a5f 100%)',
                color: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 12px 30px rgba(15, 36, 56, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Subtle header chip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <Activity size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em' }}>MEDNEXUS</div>
                      <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>INTEGRATED PATIENT CARD</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 9999, fontWeight: 700 }}>
                    NABH CERTIFIED
                  </span>
                </div>

                {/* Patient Main Line */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'white',
                    border: '2px solid white'
                  }}>
                    {createdPatient.firstName[0]}{createdPatient.lastName[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                      {createdPatient.firstName} {createdPatient.lastName}
                    </div>
                    <div className="mono" style={{ fontSize: '0.95rem', color: '#38bdf8', fontWeight: 700 }}>
                      {createdPatient.patientId}
                    </div>
                  </div>
                </div>

                {/* Grid details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: 8, marginBottom: '14px' }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>BLOOD GROUP</div>
                    <div style={{ fontWeight: 800, color: '#f87171' }}>{createdPatient.bloodGroup}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>GENDER / AGE</div>
                    <div style={{ fontWeight: 700 }}>{createdPatient.gender} / {createdPatient.age || 35}y</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>STATUS</div>
                    <div style={{ fontWeight: 700, color: '#34d399' }}>{createdPatient.status}</div>
                  </div>
                </div>

                {/* Allergies on card */}
                {createdPatient.allergies?.length > 0 && (
                  <div style={{ fontSize: '0.72rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    <AlertTriangle size={12} /> ALLERGY ALERT: {createdPatient.allergies.join(', ')}
                  </div>
                )}

                {/* Emergency contact */}
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Emergency: {createdPatient.emergencyContact?.name} ({createdPatient.emergencyContact?.phone})</span>
                  <span className="mono">MEDNEXUS-2026</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                >
                  <Printer size={16} />
                  <span>Print ID Card</span>
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowIdCardModal(false);
                    navigate(`/patient/${createdPatient.patientId}`);
                  }}
                >
                  <span>Open Full Patient Journey</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
