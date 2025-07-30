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
  Users,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
console.log("User object in Navbar:", user); 

  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/map', icon: MapPin, label: 'Map View' },
    ...(user?.role === 'citizen' ? [
      { path: '/report', icon: FileText, label: 'Report Crime' },
      { path: '/my-reports', icon: BarChart3, label: 'My Reports' }
    ] : []),
    ...(user?.role === 'police' ? [
      { path: '/police', icon: AlertTriangle, label: 'Police Panel' }
    ] : []),
    ...(user?.role === 'admin' ? [
      { path: '/admin', icon: Settings, label: 'Admin Panel' }
    ] : [])
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-900 border-b-4 border-yellow-400 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-yellow-400" />
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight">SafeReport</span>
              <span className="text-yellow-300 text-xs font-medium">Government Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-yellow-400 text-blue-900 font-semibold' 
                      : 'text-white hover:bg-blue-700 hover:text-yellow-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-white bg-blue-700 px-3 py-2 rounded-lg">
              <User className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name}</span>
                {user?.badge && (
                  <span className="text-xs text-yellow-300">Badge: {user?.badge}</span>
                )}
              </div>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                user?.role === 'admin' ? 'bg-red-600 text-white' :
                user?.role === 'police' ? 'bg-yellow-400 text-blue-900' :
                'bg-green-600 text-white'
              }`}>
                {user?.role.toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-white hover:text-yellow-300 hover:bg-blue-700 rounded-md transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-yellow-300 p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-yellow-400 text-blue-900 font-semibold' 
                        : 'text-white hover:bg-blue-700 hover:text-yellow-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-blue-700 pt-2 mt-2">
                <div className="flex items-center space-x-2 px-3 py-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    user?.role === 'admin' ? 'bg-red-600 text-white' :
                    user?.role === 'police' ? 'bg-yellow-400 text-blue-900' :
                    'bg-green-600 text-white'
                  }`}>
                    {user?.role.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-white hover:text-yellow-300 hover:bg-blue-700 rounded-md transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;