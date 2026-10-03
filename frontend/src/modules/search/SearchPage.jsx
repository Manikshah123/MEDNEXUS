import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Search, 
  User, 
  HeartPulse, 
  Receipt, 
  Filter, 
  Calendar, 
  ArrowRight,
  Stethoscope,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SearchPage = () => {
  const { patients, orders, bills } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [bloodFilter, setBloodFilter] = useState('All');

  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm) ||
      p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.currentBed?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesBlood = bloodFilter === 'All' || p.bloodGroup === bloodFilter;

    return matchesSearch && matchesStatus && matchesBlood;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={24} color="var(--accent-teal)" />
          <h1>Patient Journey Explorer & Universal Search</h1>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Trace any patient's end-to-end clinical journey across departments by Patient ID, phone, name or admission bed.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <input 
              type="text"
              className="form-control"
              placeholder="Search Patient ID (e.g. MED-2026-000001), Name, Phone, Bed, Diagnosis..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ fontSize: '1rem', paddingLeft: '38px' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select 
              className="form-select" 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Admitted">Admitted Inpatients</option>
              <option value="Registered">Registered (OPD)</option>
              <option value="Discharged">Discharged</option>
            </select>

            <select 
              className="form-select" 
              value={bloodFilter} 
              onChange={e => setBloodFilter(e.target.value)}
              style={{ width: '140px' }}
            >
              <option value="All">All Blood</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span>Results ({filteredPatients.length} matching patients)</span>
          </div>
        </div>

        <div className="table-container">
          <table className="med-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Unique Patient ID</th>
                <th>Current Status & Location</th>
                <th>Attending Doctor</th>
                <th>Allergies & Conditions</th>
                <th>Journey Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: p.status === 'Admitted' ? 'var(--medical-blue-light)' : 'var(--bg-surface-alt)',
                        color: p.status === 'Admitted' ? 'var(--medical-blue)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{p.firstName} {p.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {p.gender}, {p.age || 35}y • Blood: <strong>{p.bloodGroup}</strong> • {p.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-teal)', backgroundColor: 'var(--accent-teal-light)', padding: '2px 8px', borderRadius: 4 }}>
                      {p.patientId}
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${p.status === 'Admitted' ? 'badge-occupied' : 'badge-neutral'}`}>
                      {p.status}
                    </span>
                    {p.currentBed && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {p.currentWardName} (Bed {p.currentBed})
                      </div>
                    )}
                  </td>

                  <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {p.assignedDoctorName || 'Dr. Anand Sharma'}
                  </td>

                  <td>
                    {p.allergies?.length > 0 ? (
                      <span className="badge badge-emergency" style={{ fontSize: '0.72rem' }}>
                        <AlertTriangle size={12} /> {p.allergies.join(', ')}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--emerald-success)' }}>None</span>
                    )}
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link to={`/patient/${p.patientId}`} className="btn btn-primary btn-sm">
                        <span>Full Journey</span>
                        <ArrowRight size={14} />
                      </Link>
                      {p.status === 'Admitted' && (
                        <Link to={`/bedside?patientId=${p.patientId}`} className="btn btn-secondary btn-sm" title="Bedside Telemetry">
                          <HeartPulse size={14} color="var(--rose-danger)" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
