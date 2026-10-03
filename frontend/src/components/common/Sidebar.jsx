import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Stethoscope,
  BedDouble,
  HeartPulse,
  Syringe,
  Pill,
  Receipt,
  Search,
  Activity,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser } = useAuth();
  const { patients, orders, medicines } = useHospital();
  const [collapsed, setCollapsed] = useState(false);

  const admittedCount = patients.filter(p => p.status === 'Admitted').length;
  const pendingMedsCount = orders.filter(o => o.category === 'Medication' && o.pharmacyStatus === 'Preparing').length;
  const lowStockCount = medicines.filter(m => m.stock <= m.minStock).length;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, section: 'Core' },
    { label: 'Patient Registration', path: '/reception', icon: UserPlus, section: 'Front Desk' },
    { label: 'Patients Directory', path: '/patients', icon: Users, badge: patients.length, section: 'Front Desk' },
    { label: 'Doctor Portal', path: '/doctor', icon: Stethoscope, section: 'Clinical' },
    { label: 'Wards & Bed Map', path: '/wards', icon: BedDouble, badge: `${admittedCount} Adm`, section: 'Clinical' },
    { label: 'Bedside Monitor', path: '/bedside', icon: HeartPulse, section: 'Clinical' },
    { label: 'Nurse Station & eMAR', path: '/nursing', icon: Syringe, section: 'Care Team' },
    { label: 'Pharmacy & Dispensing', path: '/pharmacy', icon: Pill, badge: pendingMedsCount > 0 ? pendingMedsCount : null, section: 'Pharmacy' },
    { label: 'Billing & Invoicing', path: '/billing', icon: Receipt, section: 'Finance' },
    { label: 'Journey Search', path: '/search', icon: Search, section: 'Lookup' }
  ];

  const sections = ['Core', 'Front Desk', 'Clinical', 'Care Team', 'Pharmacy', 'Finance', 'Lookup'];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} no-print`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        {!collapsed && (
          <NavLink to="/" className="brand-logo-container">
            <div className="brand-icon">
              <Activity size={20} />
            </div>
            <div>
              <div className="brand-text">MEDNEXUS</div>
              <div className="brand-subtext">HOSPITAL SYSTEM</div>
            </div>
          </NavLink>
        )}
        {collapsed && (
          <div className="brand-icon" style={{ margin: '0 auto' }}>
            <Activity size={20} />
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="btn-icon" 
          style={{ color: '#94a3b8', padding: '4px' }}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="sidebar-nav">
        {sections.map(section => {
          const items = navItems.filter(item => item.section === section);
          if (items.length === 0) return null;

          return (
            <div key={section} style={{ marginBottom: 6 }}>
              {!collapsed && <div className="nav-section-title">{section}</div>}
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Profile Mini-card */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">{currentUser?.avatar || 'DR'}</div>
            <div className="user-info-text">
              <div className="user-name">{currentUser?.name}</div>
              <div className="user-role-badge">
                <ShieldCheck size={12} style={{ display: 'inline', marginRight: 4 }} />
                {currentUser?.role}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
