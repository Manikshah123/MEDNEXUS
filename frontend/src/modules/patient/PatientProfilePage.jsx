import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { TimelineWidget } from '../../components/common/TimelineWidget';
import { VitalsWidget } from '../../components/common/VitalsWidget';
import { api } from '../../services/api';
import {
  User,
  Activity,
  FileText,
  Clock,
  HeartPulse,
  Receipt,
  Stethoscope,
  BedDouble,
  Pill,
  Syringe,
  AlertTriangle,
  Printer,
  Calendar,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Plus,
  CreditCard
} from 'lucide-react';

export const PatientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, orders, bills, wards, refreshData, showToast } = useHospital();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const found = patients.find(p => p.patientId === id || p._id === id);
    if (found) {
      setPatient(found);
    } else if (patients.length > 0) {
      // If not found, fall back to first patient
      setPatient(patients[0]);
    }
  }, [id, patients]);

  if (!patient) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="pulse-indicator live" style={{ width: 16, height: 16, marginBottom: 12 }}></div>
        <div style={{ color: 'var(--text-secondary)' }}>Loading patient journey profile...</div>
      </div>
    );
  }

  const patientOrders = orders.filter(o => o.patientId === patient.patientId);
  const patientBills = bills.filter(b => b.patientId === patient.patientId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Master Patient Header Banner */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          {/* Patient Core Summary */}
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--medical-blue-light)',
              color: 'var(--medical-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800,
              flexShrink: 0
            }}>
              {patient.firstName[0]}{patient.lastName[0]}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  {patient.firstName} {patient.lastName}
                </h1>
                <span className="mono" style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--accent-teal-light)',
                  color: 'var(--accent-teal)',
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  {patient.patientId}
                </span>
                <span className={`badge ${patient.status === 'Admitted' ? 'badge-occupied' : 'badge-neutral'}`} style={{ fontSize: '0.78rem' }}>
                  {patient.status}
                </span>
                {patient.priority === 'Emergency' && (
                  <span className="badge badge-emergency">Emergency Priority</span>
                )}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span>{patient.gender} • {patient.age || 35} Years</span>
                <span>• Blood: <strong style={{ color: 'var(--rose-danger)' }}>{patient.bloodGroup}</strong></span>
                <span>• Contact: {patient.phone}</span>
                {patient.govIdNumber && <span>• {patient.govIdType}: {patient.govIdNumber}</span>}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {patient.status === 'Admitted' && (
              <Link to={`/bedside?patientId=${patient.patientId}`} className="btn btn-navy btn-sm">
                <HeartPulse size={16} />
                <span>Bedside Monitor</span>
              </Link>
            )}
            <Link to="/doctor" className="btn btn-primary btn-sm">
              <Stethoscope size={16} />
              <span>Doctor Examination</span>
            </Link>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={16} />
              <span>Print Clinical Summary</span>
            </button>
          </div>
        </div>

        {/* Clinical Location & Allergy Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface-alt)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Location: </span>
              <strong>{patient.currentWardName || 'Outpatient'}</strong>
              {patient.currentBed && <span> • <strong>Bed {patient.currentBed}</strong> (Room {patient.currentRoom})</span>}
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Attending Doctor: </span>
              <strong>{patient.assignedDoctorName || 'Dr. Anand Sharma'}</strong>
            </div>
            {patient.diagnosis && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Diagnosis: </span>
                <strong>{patient.diagnosis}</strong>
              </div>
            )}
          </div>

          {/* Allergy Alert Tag */}
          {patient.allergies?.length > 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--rose-danger)',
              backgroundColor: 'var(--rose-light)',
              border: '1px solid rgba(225, 29, 72, 0.3)',
              padding: '3px 10px',
              borderRadius: 6,
              fontWeight: 700
            }}>
              <AlertTriangle size={14} />
              <span>KNOWN ALLERGIES: {patient.allergies.join(', ')}</span>
            </div>
          ) : (
            <div style={{ color: 'var(--emerald-success)', fontWeight: 600 }}>
              ✓ No known drug allergies recorded
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-header no-print">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <User size={16} />
          <span>Patient Overview</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <Clock size={16} />
          <span>Complete Hospital Journey ({(patient.timeline || []).length})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Pill size={16} />
          <span>Doctor Orders & Meds ({patientOrders.length})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'vitals' ? 'active' : ''}`}
          onClick={() => setActiveTab('vitals')}
        >
          <Activity size={16} />
          <span>Live Telemetry & Vitals</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <Receipt size={16} />
          <span>Hospital Invoicing & Bills ({patientBills.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          {/* Demographics & Chronic Details */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={18} color="var(--accent-teal)" />
                <span>Demographics & Medical Record</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '0.88rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Full Legal Name</div>
                <div style={{ fontWeight: 600, color: 'var(--primary-navy)' }}>{patient.firstName} {patient.lastName}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Unique Patient Identifier (PID)</div>
                <div className="mono" style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{patient.patientId}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Date of Birth</div>
                <div style={{ fontWeight: 600 }}>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'} ({patient.age || 35} Years)</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Blood Group & Rh Type</div>
                <div style={{ fontWeight: 700, color: 'var(--rose-danger)' }}>{patient.bloodGroup}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Residential Address</div>
                <div style={{ fontWeight: 500 }}>{patient.address?.street}, {patient.address?.city}, {patient.address?.state} {patient.address?.zipCode}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Insurance Provider / Policy</div>
                <div style={{ fontWeight: 600 }}>{patient.insuranceProvider || 'Direct Hospital Settlement'} ({patient.insurancePolicyNumber || 'N/A'})</div>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Documented Chronic Medical Conditions
              </div>
              {patient.existingConditions?.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {patient.existingConditions.map((cond, i) => (
                    <span key={i} className="badge badge-urgent" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                      {cond}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No chronic conditions reported on file.</div>
              )}
            </div>
          </div>

          {/* Emergency Contact & Admission Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Phone size={18} color="var(--rose-danger)" />
                  <span>Emergency Next-of-Kin Contact</span>
                </div>
              </div>
              <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Contact Person</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{patient.emergencyContact?.name || 'Not Provided'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Relationship</div>
                  <div style={{ fontWeight: 600 }}>{patient.emergencyContact?.relationship || 'Family'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Direct Contact Phone</div>
                  <div className="mono" style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{patient.emergencyContact?.phone || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <BedDouble size={18} color="var(--medical-blue)" />
                  <span>Ward Bed Status</span>
                </div>
              </div>
              {patient.status === 'Admitted' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{patient.currentWardName}</span>
                    <span className="badge badge-occupied">Bed {patient.currentBed}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Admitted: {patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString() : 'Recent'}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Link to={`/bedside?patientId=${patient.patientId}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                      Open Bedside Monitor Console
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Patient is currently outpatient / discharged.
                  <div style={{ marginTop: 10 }}>
                    <Link to="/wards" className="btn btn-outline-teal btn-sm">
                      Assign to Inpatient Bed
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLETE JOURNEY TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Clock size={18} color="var(--accent-teal)" />
                <span>Complete Integrated Hospital Journey</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Immutable sequential event audit linked to Patient ID {patient.patientId}
              </div>
            </div>
          </div>

          <TimelineWidget events={patient.timeline || []} />
        </div>
      )}

      {/* TAB 3: DOCTOR ORDERS & MEDICATIONS */}
      {activeTab === 'orders' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Pill size={18} color="var(--accent-teal)" />
                <span>Doctor Prescriptions & Clinical Orders ({patientOrders.length})</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Active medication schedules, routes, doses and pharmacy verification status
              </div>
            </div>

            <Link to="/doctor" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Add New Prescription Order</span>
            </Link>
          </div>

          {patientOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No clinical orders placed yet for this patient.
            </div>
          ) : (
            <div className="table-container">
              <table className="med-table">
                <thead>
                  <tr>
                    <th>Order Identifier</th>
                    <th>Category & Medicine</th>
                    <th>Dosage & Route</th>
                    <th>Frequency & Times</th>
                    <th>Prescribing Doctor</th>
                    <th>Pharmacy Queue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientOrders.map(o => (
                    <tr key={o._id}>
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>
                        {o.orderId}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{o.medicineName || o.instruction}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.category}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.dosage || '—'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Route: {o.route || 'Oral'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.frequency || 'Once daily'}</div>
                        {o.administrationTimes?.length > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-teal)' }}>
                            {o.administrationTimes.join(', ')}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                        {o.doctorName}
                      </td>
                      <td>
                        <span className={`badge ${o.pharmacyStatus === 'Dispensed' ? 'badge-dispensed' : o.pharmacyStatus === 'Ready' ? 'badge-urgent' : 'badge-preparing'}`}>
                          {o.pharmacyStatus || 'Preparing'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${o.status === 'Completed' ? 'badge-completed' : 'badge-active'}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LIVE TELEMETRY & VITALS */}
      {activeTab === 'vitals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <HeartPulse size={18} color="var(--rose-danger)" />
                <span>Live Continuous Bedside Telemetry</span>
              </div>
              <span className="badge badge-normal">Live Signal Connected</span>
            </div>

            <VitalsWidget baseVitals={{ heartRate: 82, systolicBP: 126, diastolicBP: 82, spO2: 97, temperature: 37.0, respiratoryRate: 16 }} />
          </div>
        </div>
      )}

      {/* TAB 5: BILLING & INVOICING */}
      {activeTab === 'billing' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Receipt size={18} color="var(--purple-accent)" />
                <span>Hospital Invoices & Billing History</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Itemized bed charges, pharmacy dispensations, doctor consultation & laboratory charges
              </div>
            </div>

            <Link to="/billing" className="btn btn-secondary btn-sm">
              Open Billing Ledger
            </Link>
          </div>

          {patientBills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No billing invoices generated yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {patientBills.map(bill => (
                <div key={bill._id} style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  backgroundColor: 'var(--bg-surface-alt)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="mono" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                          {bill.invoiceId}
                        </span>
                        <span className={`badge ${bill.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-partially-paid'}`}>
                          {bill.paymentStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Generated: {new Date(bill.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', fontFamily: 'var(--font-mono)' }}>
                        Total: ₹{bill.total.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--emerald-success)', fontWeight: 600 }}>
                        Paid: ₹{bill.paidAmount.toLocaleString()} • Balance: ₹{bill.balance.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="table-container" style={{ backgroundColor: 'white' }}>
                    <table className="med-table">
                      <thead>
                        <tr>
                          <th>Item Description</th>
                          <th>Category</th>
                          <th>Qty</th>
                          <th>Unit Price (₹)</th>
                          <th>Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(bill.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{item.description}</td>
                            <td><span className="badge badge-neutral">{item.category}</span></td>
                            <td>{item.quantity}</td>
                            <td>₹{item.unitPrice.toLocaleString()}</td>
                            <td style={{ fontWeight: 700 }}>₹{item.totalPrice.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
