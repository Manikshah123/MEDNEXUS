import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HospitalProvider } from './context/HospitalContext';

import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

import { LoginPage } from './modules/auth/LoginPage';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { ReceptionPage } from './modules/reception/ReceptionPage';
import { PatientsDirectoryPage } from './modules/patients/PatientsDirectoryPage';
import { PatientProfilePage } from './modules/patient/PatientProfilePage';
import { DoctorPortalPage } from './modules/doctor/DoctorPortalPage';
import { WardsPage } from './modules/wards/WardsPage';
import { BedsideMonitorPage } from './modules/bedside/BedsideMonitorPage';
import { NursingPage } from './modules/nursing/NursingPage';
import { PharmacyPage } from './modules/pharmacy/PharmacyPage';
import { BillingPage } from './modules/billing/BillingPage';
import { SearchPage } from './modules/search/SearchPage';

const ProtectedLayout = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Bedside Monitor has its own full-screen clinical telemetry layout
  const isBedsideView = location.pathname === '/bedside';

  if (isBedsideView) {
    return (
      <div className="bedside-layout">
        <GlobalSearchModal />
        <BedsideMonitorPage />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="content-body">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/reception" element={<ReceptionPage />} />
            <Route path="/patients" element={<PatientsDirectoryPage />} />
            <Route path="/patient/:id" element={<PatientProfilePage />} />
            <Route path="/doctor" element={<DoctorPortalPage />} />
            <Route path="/wards" element={<WardsPage />} />
            <Route path="/nursing" element={<NursingPage />} />
            <Route path="/pharmacy" element={<PharmacyPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HospitalProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </Router>
      </HospitalProvider>
    </AuthProvider>
  );
}
