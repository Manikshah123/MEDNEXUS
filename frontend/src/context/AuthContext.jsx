import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mednexus_current_user');
      return saved ? JSON.parse(saved) : {
        _id: 'u2',
        employeeId: 'DOC-001',
        name: 'Dr. Anand Sharma',
        email: 'anand.sharma@mednexus.in',
        role: 'doctor',
        department: 'Emergency Medicine',
        specialization: 'Emergency Medicine',
        avatar: 'AS'
      };
    } catch (e) {
      return null;
    }
  });

  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.auth.getUsers().then(users => setAvailableUsers(users));
  }, []);

  const login = async (emailOrId, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login(emailOrId, password);
      setCurrentUser(res.user);
      localStorage.setItem('mednexus_current_user', JSON.stringify(res.user));
      localStorage.setItem('mednexus_token', res.token);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const switchUserRole = (targetEmployeeId) => {
    const target = availableUsers.find(u => u.employeeId === targetEmployeeId || u.role === targetEmployeeId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('mednexus_current_user', JSON.stringify(target));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mednexus_current_user');
    localStorage.removeItem('mednexus_token');
  };

  return (
    <AuthContext.Provider value={{ currentUser, availableUsers, login, logout, switchUserRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
