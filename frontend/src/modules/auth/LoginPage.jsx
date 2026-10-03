import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Lock, User, CheckCircle2, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { login, availableUsers } = useAuth();
  const [identifier, setIdentifier] = useState('DOC-001');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user) => {
    setIdentifier(user.employeeId);
    setPassword('password123');
    try {
      await login(user.employeeId, 'password123');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'var(--font-main)'
    }}>
      {/* Left Brand Showcase */}
      <div style={{
        flex: '1.2',
        background: 'linear-gradient(135deg, #0a1826 0%, #0f2438 60%, #083344 100%)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background hospital glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(8, 131, 126, 0.15) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        {/* Top Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 44,
            height: 44,
            background: 'linear-gradient(135deg, #08837e, #0284c7)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 16px rgba(8, 131, 126, 0.5)'
          }}>
            <Activity size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>MEDNEXUS</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Integrated Hospital Patient Management</div>
          </div>
        </div>

        {/* Main Pitch */}
        <div style={{ maxWidth: '520px', my: 'auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: 'rgba(8, 131, 126, 0.15)',
            border: '1px solid rgba(8, 131, 126, 0.3)',
            borderRadius: '9999px',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            <span className="pulse-indicator live" style={{ width: 8, height: 8 }}></span>
            Next-Gen Hospital Operating System
          </div>

          <h1 style={{ fontSize: '2.4rem', color: 'white', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
            One Patient ID.<br />
            <span style={{ color: '#38bdf8' }}>Complete Hospital Journey.</span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Seamlessly connecting front-desk registration, doctor examinations, pharmacy orders, nursing eMAR administration, ward beds, bedside telemetry and billing in real-time.
          </p>

          {/* Key Capabilities */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[
              'Unique Patient ID Tracking',
              'Live Bedside Telemetry Monitors',
              'Real-Time Ward & Bed Mapping',
              'Doctor Clinical Order Queue',
              'Electronic eMAR Administration',
              'Integrated Itemized Billing'
            ].map((text, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <CheckCircle2 size={16} color="#08837e" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          MEDNEXUS Enterprise Hospital Platform • Compliant with NABH & Clinical EHR Protocols
        </div>
      </div>

      {/* Right Login Box */}
      <div style={{
        flex: '1',
        backgroundColor: '#ffffff',
        color: 'var(--primary-navy)',
        padding: '60px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '560px'
      }}>
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '6px' }}>
              Hospital Staff Portal
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Sign in with your Employee ID or authorized clinical credentials.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'var(--rose-light)',
              border: '1px solid rgba(225, 29, 72, 0.3)',
              color: 'var(--rose-danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '18px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Employee ID or Email</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. DOC-001 or admin@mednexus.in"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label className="form-label">Security Password</label>
              <input 
                type="password" 
                className="form-control"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-navy btn-lg" 
              style={{ width: '100%', marginTop: '20px', backgroundColor: 'var(--accent-teal)' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to MEDNEXUS'}
            </button>
          </form>

          {/* 1-Click Role Switcher Demo Bar */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              Quick Demo Access (1-Click Login):
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {availableUsers.slice(0, 6).map(u => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-surface-alt)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-teal)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-navy)' }}>{u.name.split(' ')[0]} {u.name.split(' ')[1]}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--accent-teal)', textTransform: 'capitalize' }}>{u.role}</div>
                  </div>
                  <ArrowRight size={12} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
