import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import { 
  Search, 
  Bell, 
  UserCircle, 
  Activity, 
  Check, 
  ChevronDown, 
  LogOut,
  Hospital,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { currentUser, availableUsers, switchUserRole, logout } = useAuth();
  const { notifications, setIsSearchOpen, markNotificationRead } = useHospital();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="topbar no-print">
      {/* Left: Quick Search */}
      <div className="topbar-left">
        <button 
          className="search-trigger"
          onClick={() => setIsSearchOpen(true)}
          title="Search Patient ID, Name or Bed"
        >
          <Search size={16} color="var(--text-muted)" />
          <span>Search patient (e.g. MED-2026-000001)...</span>
          <span className="search-shortcut">⌘K / Ctrl+K</span>
        </button>

        {/* Live System Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
          <span className="pulse-indicator live"></span>
          <span style={{ fontWeight: 600 }}>Emergency Triage: Active</span>
        </div>
      </div>

      {/* Right: Quick Role Switcher, Notifications, Profile */}
      <div className="topbar-right">
        {/* Role Switcher Demo Tool */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface-alt)', padding: '4px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Role:</span>
          <select 
            value={currentUser?.employeeId || ''} 
            onChange={(e) => switchUserRole(e.target.value)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              fontSize: '0.82rem', 
              fontWeight: 600, 
              color: 'var(--primary-navy)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {availableUsers.map(u => (
              <option key={u._id} value={u.employeeId}>
                {u.name} ({u.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn-icon" 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            style={{ position: 'relative' }}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                backgroundColor: 'var(--rose-danger)',
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            )}
          </button>

          {showNotifMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '120%',
              width: 360,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 100,
              padding: '12px 0'
            }}>
              <div style={{ padding: '0 16px 10px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>Notifications</span>
                <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>{unreadCount} New</span>
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.slice(0, 6).map(n => (
                  <div 
                    key={n._id}
                    onClick={() => {
                      markNotificationRead(n._id);
                      if (n.patientId) navigate(`/patient/${n.patientId}`);
                      setShowNotifMenu(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: n.isRead ? 'transparent' : 'var(--bg-surface-alt)',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem', color: n.priority === 'Critical' ? 'var(--rose-danger)' : 'var(--primary-navy)' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <div className="user-avatar" style={{ width: 34, height: 34, fontSize: '0.85rem' }}>
              {currentUser?.avatar || 'MN'}
            </div>
            <div style={{ textAlign: 'left', display: 'none', md: 'block' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-navy)', lineHeight: 1.1 }}>{currentUser?.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', textTransform: 'capitalize' }}>{currentUser?.role}</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '120%',
              width: 220,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 100,
              padding: '8px 0'
            }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentUser?.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{currentUser?.department}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{currentUser?.employeeId}</div>
              </div>
              <button 
                onClick={() => { logout(); setShowUserMenu(false); navigate('/login'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--rose-danger)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
