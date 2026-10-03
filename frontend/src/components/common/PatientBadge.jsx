import React from 'react';
import { User, AlertTriangle, ShieldAlert, Heart, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientBadge = ({ patient, showDetails = false, compact = false }) => {
  if (!patient) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: compact ? '4px 8px' : '8px 12px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xs)'
    }}>
      {/* Avatar */}
      <div style={{
        width: compact ? 30 : 40,
        height: compact ? 30 : 40,
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--primary-navy-subtle)',
        color: 'var(--primary-navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: compact ? '0.75rem' : '0.9rem',
        flexShrink: 0
      }}>
        {patient.firstName ? patient.firstName[0] : 'P'}{patient.lastName ? patient.lastName[0] : ''}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link 
            to={`/patient/${patient.patientId}`}
            style={{ 
              fontWeight: 700, 
              fontSize: compact ? '0.82rem' : '0.92rem', 
              color: 'var(--primary-navy)', 
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {patient.firstName} {patient.lastName}
          </Link>
          <span className="mono" style={{ 
            fontSize: '0.72rem', 
            background: 'var(--accent-teal-light)', 
            color: 'var(--accent-teal)', 
            padding: '1px 5px', 
            borderRadius: 3, 
            fontWeight: 600 
          }}>
            {patient.patientId}
          </span>
          <span className={`badge ${patient.status === 'Admitted' ? 'badge-occupied' : 'badge-neutral'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
            {patient.status}
          </span>
        </div>

        {showDetails && (
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span>{patient.gender}, {patient.age || 35}y</span>
            <span>• Blood: <strong>{patient.bloodGroup}</strong></span>
            {patient.currentBed && (
              <span>• Ward: <strong>{patient.currentWardName} (Bed {patient.currentBed})</strong></span>
            )}
            {patient.allergies?.length > 0 && (
              <span style={{ color: 'var(--rose-danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                <AlertTriangle size={12} /> Allergy: {patient.allergies.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
