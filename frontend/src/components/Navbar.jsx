import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Home,
  MapPin,
  FileText,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Tricolor bar (Top bar; adjust if needed)
const TricolorBar = () => (
  <div className="w-full flex h-2">
    {/* <div className="flex-1 bg-[#138808]" /> Green */}
    <div className="flex-1 bg-white" />      {/* White */}
    {/* <div className="flex-1 bg-[#ff9933]" /> Saffron (Orange) */}
  </div>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation items based on user role
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/map', icon: MapPin, label: 'Map' },
    ...(user?.role === 'citizen'
      ? [
          { path: '/report', icon: FileText, label: 'Report Crime' },
          { path: '/my-reports', icon: BarChart3, label: 'My Reports' }
        ]
      : []),
    ...(user?.role === 'police'
      ? [{ path: '/police', icon: AlertTriangle, label: 'Police Panel' }]
      : []),
    ...(user?.role === 'admin'
      ? [{ path: '/admin', icon: Settings, label: 'Admin Panel' }]
      : [])
  ];

  return (
    <header className="shadow-lg z-50 sticky top-0">
      <TricolorBar />
      <nav className="bg-white border-b-4 border-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8 py-3">
          {/* Logo & Title */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <Shield className="text-blue-600 w-10 h-10" />
            <div>
              <span className="block text-xl font-extrabold text-blue-700 leading-5 tracking-wide">SafeReport</span>
              <span className="block text-xs uppercase tracking-wide font-semibold text-yellow-500">Official Govt. Portal</span>
            </div>
          </Link>
          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-2 ml-8">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition duration-150 ${
                    isActive
                      ? 'bg-blue-300 text-black font-bold shadow'
                      : 'text-blue-900 hover:bg-blue-50 hover:text-yellow-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          {/* User Info / Logout - Desktop */}
          <div className="hidden md:flex items-center space-x-5">
            <div className="px-4 py-2 rounded-lg bg-blue-50 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-800" />
              <div>
                <span className="block text-sm text-blue-900 font-semibold">{user?.name}</span>
                {user?.badge && (
                  <span className="block text-xs text-yellow-600">Badge: {user.badge}</span>
                )}
              </div>
              <span
                className={`ml-2 px-2 py-1 text-xs rounded font-semibold
                  ${
                    user?.role === 'admin'
                      ? 'bg-red-600 text-white'
                      : user?.role === 'police'
                      ? 'bg-yellow-500 text-blue-900'
                      : 'bg-green-500 text-white'
                  }
                `}
                aria-label={`Role: ${user?.role}`}
              >
                {user?.role ? user.role.toUpperCase() : 'GUEST'}
              </span>
            </div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-2 px-4 py-2 text-blue-900 rounded-lg hover:text-white hover:bg-blue-800 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-700"
            aria-label="Open Menu"
          >
            {isMenuOpen ? <X className="w-7 h-7 text-blue-800" /> : <Menu className="w-7 h-7 text-blue-800" />}
          </button>
        </div>
        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white px-4 border-t border-blue-50"
          >
            <div className="py-4 space-y-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg font-medium transition ${
                      isActive
                        ? 'bg-yellow-400 text-blue-800 font-bold shadow'
                        : 'text-blue-900 hover:bg-blue-50 hover:text-yellow-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
              {/* Divider */}
              <div className="border-t border-blue-100 my-2" />
              {/* User and Logout - Mobile */}
              <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-800" />
                <span className="text-blue-900 text-sm font-semibold">{user?.name}</span>
                <span
                  className={`ml-1 px-2 py-1 text-xs rounded font-semibold
                    ${
                      user?.role === 'admin'
                        ? 'bg-red-600 text-white'
                        : user?.role === 'police'
                        ? 'bg-yellow-500 text-blue-900'
                        : 'bg-green-500 text-white'
                    }
                  `}
                >
                  {user?.role?.toUpperCase() || 'GUEST'}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full gap-2 px-4 py-3 mt-1 text-blue-900 hover:text-white hover:bg-blue-800 rounded-lg font-medium transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
