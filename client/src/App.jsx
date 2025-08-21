import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const PoliceRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!['admin', 'police'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (user) {
    const target = user.role === 'citizen' ? '/my-reports' : '/dashboard';
    return <Navigate to={target} replace />;
  }
  return children;
};

function AppContent() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100">
      {user && <Navbar />}
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
          {/* Role-specific Routes */}
          <Route path="/police" element={<PoliceRoute><PolicePanel /></PoliceRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>} />
          {/* Add PoliceDashboard, MapView, PolicePanel routes for sidebar navigation */}
          <Route path="/policedashboard" element={<PoliceDashboard />} />
          <Route path="/mapview" element={<MapView />} />
          <Route path="/policepanel" element={<PolicePanel />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to={user ? (user.role === 'citizen' ? '/my-reports' : '/dashboard') : '/'} replace />} />
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