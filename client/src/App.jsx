import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportCrime from './pages/ReportCrime';
import MapView from './pages/MapView';
import MyReports from './pages/MyReports';
import PolicePanel from './pages/PolicePanel';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import ForgotPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import PoliceDashboard from './pages/PoliceDashboard';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PoliceRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!['admin', 'police'].includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) {
    // send user to appropriate default page after login
    const target =
      user.role === 'citizen' ? '/my-reports' :
      user.role === 'police' ? '/policedashboard' :
      user.role === 'admin' ? '/admin' :
      '/dashboard';
    return <Navigate to={target} replace />;
  }
  return children;
};

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  // Only hide top Navbar on PoliceDashboard and its mapview routes.
  // Keep Navbar visible on PolicePanel (/policepanel).
  const path = (location.pathname || '').toLowerCase();
  const isPoliceDashboardPath =
    path === '/policedashboard' ||
    path.startsWith('/policedashboard/');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* show Navbar only when user is logged in AND not on PoliceDashboard/mapview */}
      {user && !isPoliceDashboardPath && <Navbar />}
      <main className="p-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Protected Routes for all logged-in users */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportCrime /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
          <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />

          {/* Police-specific routes */}
          {/* /police redirects to police dashboard after login */}
          <Route path="/police" element={<PoliceRoute><Navigate to="/policedashboard" replace /></PoliceRoute>} />
          <Route path="/policedashboard" element={<PoliceRoute><PoliceDashboard /></PoliceRoute>} />
          <Route path="/mapview" element={<PoliceRoute><MapView /></PoliceRoute>} />
          <Route path="/policepanel" element={<PoliceRoute><PolicePanel /></PoliceRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>} />

          {/* Catch-all: send user to role-appropriate default */}
          <Route
            path="*"
            element={
              <Navigate to={
                user
                  ? (user.role === 'citizen' ? '/my-reports'
                      : user.role === 'police' ? '/policedashboard'
                      : user.role === 'admin' ? '/admin'
                      : '/dashboard')
                  : '/'
              } replace
              />
            }
          />
        </Routes>
      </main>
      {user && <Chatbot />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;