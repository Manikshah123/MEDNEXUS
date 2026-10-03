import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Users, UserPlus, Search, ArrowRight, HeartPulse, CreditCard, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const PatientsDirectoryPage = () => {
  const { patients } = useHospital();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = patients.filter(p =>
    p.patientId?.toLowerCase().includes(query.toLowerCase()) ||
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
    p.phone?.includes(query)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} color="var(--accent-teal)" />
            <h1>Patients Directory & Master Index</h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Centralized registry of all {patients.length} active and historical patients with single-click journey access.
          </p>
        </div>

        <Link to="/reception" className="btn btn-primary">
          <UserPlus size={16} />
          <span>Register New Patient</span>
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ width: '300px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by ID, name or phone..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <span className="badge badge-normal">{filtered.length} Patients Listed</span>
        </div>

        <div className="table-container">
          <table className="med-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Unique Patient ID</th>
                <th>Demographics & Blood</th>
                <th>Emergency Contact</th>
                <th>Location / Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                      {p.firstName} {p.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {p.phone}
                    </div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-teal)', backgroundColor: 'var(--accent-teal-light)', padding: '2px 8px', borderRadius: 4 }}>
                      {p.patientId}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{p.gender}, {p.age || 35}y</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rose-danger)' }}>Blood: {p.bloodGroup}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.emergencyContact?.name || 'N/A'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.emergencyContact?.phone}</div>
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
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link to={`/patient/${p.patientId}`} className="btn btn-outline-teal btn-sm">
                        <span>Profile</span>
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
