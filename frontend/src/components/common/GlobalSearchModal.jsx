import React, { useState, useEffect, useRef } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, HeartPulse, Receipt, BedDouble, ArrowRight } from 'lucide-react';

export const GlobalSearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, patients, orders, bills } = useHospital();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingPatients = q
    ? patients.filter(
        p =>
          p.patientId?.toLowerCase().includes(q) ||
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.phone?.includes(q) ||
          p.currentBed?.toLowerCase().includes(q) ||
          p.diagnosis?.toLowerCase().includes(q)
      )
    : patients.slice(0, 5);

  const matchingBills = q
    ? bills.filter(b => b.invoiceId?.toLowerCase().includes(q) || b.patientName?.toLowerCase().includes(q))
    : [];

  const handleSelectPatient = (patientId) => {
    setIsSearchOpen(false);
    navigate(`/patient/${patientId}`);
  };

  const handleSelectBedside = (patientId) => {
    setIsSearchOpen(false);
    navigate(`/bedside?patientId=${patientId}`);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsSearchOpen(false)}>
      <div 
        className="modal-dialog modal-lg" 
        onClick={e => e.stopPropagation()}
        style={{ marginTop: '10vh' }}
      >
        {/* Search Input Bar */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-light)' }}>
          <Search size={20} color="var(--accent-teal)" />
          <input 
            ref={inputRef}
            type="text" 
            className="form-control"
            placeholder="Search Patient ID, Name, Phone, Aadhaar, Diagnosis, or Bed number..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ border: 'none', boxShadow: 'none', fontSize: '1.05rem', padding: 0 }}
          />
          <button className="btn-icon" onClick={() => setIsSearchOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Search Results */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
            {q ? `Matched Patients (${matchingPatients.length})` : 'Recent & Active Admitted Patients'}
          </div>

          {matchingPatients.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No matching records found for "{query}".
            </div>
          )}

          {matchingPatients.map(p => (
            <div 
              key={p._id}
              onClick={() => handleSelectPatient(p.patientId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'background 0.15s',
                marginBottom: 4,
                backgroundColor: 'var(--bg-surface)'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface-alt)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: p.status === 'Admitted' ? 'var(--medical-blue-light)' : 'var(--bg-surface-alt)',
                  color: p.status === 'Admitted' ? 'var(--medical-blue)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary-navy)' }}>
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 600, background: 'var(--accent-teal-light)', padding: '1px 6px', borderRadius: 4 }}>
                      {p.patientId}
                    </span>
                    <span className={`badge ${p.status === 'Admitted' ? 'badge-occupied' : 'badge-neutral'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {p.gender}, {p.age || 35}y • Blood: <strong>{p.bloodGroup}</strong> • Phone: {p.phone}
                    {p.currentBed && <span> • <strong>Bed {p.currentBed}</strong> ({p.currentWardName})</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                {p.status === 'Admitted' && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSelectBedside(p.patientId)}
                    title="Open Bedside Monitor"
                  >
                    <HeartPulse size={14} color="var(--rose-danger)" />
                    <span>Bedside</span>
                  </button>
                )}
                <button 
                  className="btn btn-outline-teal btn-sm"
                  onClick={() => handleSelectPatient(p.patientId)}
                >
                  <span>Profile</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}

          {matchingBills.length > 0 && (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '14px 0 8px', paddingLeft: '8px' }}>
                Matched Invoices ({matchingBills.length})
              </div>
              {matchingBills.map(b => (
                <div 
                  key={b._id}
                  onClick={() => { setIsSearchOpen(false); navigate('/billing'); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-surface-alt)',
                    marginBottom: 4
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Receipt size={16} color="var(--purple-accent)" />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{b.invoiceId}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.patientName}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.85rem' }}>
                    ₹{b.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer Shortcut Info */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Tip: Type <strong>MED-2026-</strong> to filter by Patient Unique Identifier</span>
          <span>Press <strong>ESC</strong> to close</span>
        </div>
      </div>
    </div>
  );
};
