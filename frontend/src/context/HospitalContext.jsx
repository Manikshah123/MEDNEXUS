import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const HospitalContext = createContext(null);

export const HospitalProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [wards, setWards] = useState([]);
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [bills, setBills] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Refresh all state
  const refreshData = useCallback(async () => {
    try {
      const [pts, wds, ords, meds, bls, notifs] = await Promise.all([
        api.patients.getAll(),
        api.wards.getAll(),
        api.orders.getAll(),
        api.pharmacy.getMedicines(),
        api.billing.getAll(),
        api.notifications.getAll()
      ]);
      setPatients(pts);
      setWards(wds);
      setOrders(ords);
      setMedicines(meds);
      setBills(bls);
      setNotifications(notifs);
    } catch (e) {
      console.error('Error refreshing hospital data', e);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Toast Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const markNotificationRead = async (id) => {
    await api.notifications.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  // Keyboard shortcut Ctrl+K / Cmd+K for Universal Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <HospitalContext.Provider value={{
      patients,
      wards,
      orders,
      medicines,
      bills,
      notifications,
      toasts,
      isSearchOpen,
      setIsSearchOpen,
      selectedPatientId,
      setSelectedPatientId,
      refreshData,
      showToast,
      markNotificationRead
    }}>
      {children}
      {/* Toast Render Overlay */}
      <div className="toast-container no-print">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="pulse-indicator live" style={{ width: 10, height: 10 }}></span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </HospitalContext.Provider>
  );
};

export const useHospital = () => useContext(HospitalContext);
