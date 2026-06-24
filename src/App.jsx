import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';


// Import LoginPage
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import EmployeeLoginPage from './pages/EmployeeLoginPage';
import EmployeeDashboard from './pages/EmployeeDashboard';

import AdminDashboard from './portals/admin/AdminDashboard';
import CitizenPortal from './portals/citizen/CitizenPortal';
import TrackTicket from './portals/citizen/TrackTicket';
import CmPortal from './portals/cm/CmPortal';
import MlaPortal from './portals/mla/MlaPortal';
import MinisterPortal from './portals/minister/MinisterPortal';
import OfficerPortal from './portals/officer/OfficerPortal';
import OfficerProfile from './portals/officer/OfficerProfile';
import PublicPortal from './portals/public/PublicPortal';
import ProfilePage from './shared/components/ProfilePage';
import HowItWorks from './pages/HowItWorks';
import AboutUs from './pages/AboutUs';

// Route Guard for Protected Routes
const ProtectedRoute = ({ requiredRole, children }) => {
  const role = localStorage.getItem('jn_role');
  if (role === requiredRole) {
    return children;
  }
  return <Navigate to="/" replace />;
};

const EmployeeProtectedRoute = ({ children }) => {
  const role = localStorage.getItem('jn_role');
  if (role !== 'employee' || !localStorage.getItem('jn_emp_role')) {
    return <Navigate to="/employee-login" replace />;
  }
  return children;
};

export default function App() {
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    // 1. Mobile responsive check for toast placement
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 3. Set default title
    if (window.location.pathname === '/') {
      document.title = 'JanaNayagam | Login';
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  return (
    <>
      <Toaster 
        position={isMobile ? "top-center" : "top-right"} 
        duration={4000} 
        richColors 
      />
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/employee-login" element={<EmployeeLoginPage />} />

          {/* Employee Protected Routes */}
          <Route path="/cm/*" element={<EmployeeProtectedRoute><CmPortal /></EmployeeProtectedRoute>} />
          <Route path="/minister/*" element={<EmployeeProtectedRoute><MinisterPortal /></EmployeeProtectedRoute>} />
          <Route path="/mla/*" element={<EmployeeProtectedRoute><MlaPortal /></EmployeeProtectedRoute>} />
          <Route path="/ward-member-dashboard" element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>} />
          <Route path="/collector-dashboard" element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>} />
          <Route path="/dro-dashboard" element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>} />
          <Route path="/bdo-dashboard" element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>} />
          <Route path="/vao-dashboard" element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>} />
          <Route path="/ward-officer-dashboard" element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>} />
          <Route path="/ri-dashboard" element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>} />
          
          {/* Catch-all for all 43 departments and roles */}
          <Route path="/dept/:department/:role" element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>} />

          {/* Protected Portal Route for Citizen */}
          <Route 
            path="/citizen/*" 
            element={
              <ProtectedRoute requiredRole="citizen">
                <CitizenPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/track" element={<TrackTicket />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/officer/*" element={<OfficerPortal />} />
          <Route path="/official/:id" element={<EmployeeProtectedRoute><OfficerProfile /></EmployeeProtectedRoute>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/public/*" element={<PublicPortal />} />

          {/* Fallback to Login page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}
