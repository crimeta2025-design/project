import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Build nav items with citizen users seeing 'My Reports' instead of 'Dashboard'
  const navItems = [
    ...(user?.role === 'citizen'
      ? [{ path: '/dashboard', icon: BarChart3, label: 'Dashboard' }]
      : [{ path: '/policedashboard', icon: Home, label: 'Dashboard' }]
    ),
    ...(user?.role === 'citizen' ? [{ path: '/my-reports', icon: BarChart3, label: 'My Reports' }] : []),
    { path: '/map', icon: MapPin, label: 'Map View' },
    ...(user?.role === 'citizen' ? [
      { path: '/report', icon: FileText, label: 'Report Crime' }
    ] : []),
    ...(user?.role === 'police' ? [
      { path: '/policepanel', icon: AlertTriangle, label: 'Police Panel' }
    ] : []),
    ...(user?.role === 'admin' ? [
      { path: '/admin', icon: Settings, label: 'Admin Panel' }
    ] : [])
  ];

  // Mobile drawer simple CSS animation handled via utility classes

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
          {/* Logo & Title */}
          <Link to={user?.role === 'citizen' ? '/my-reports' : '/dashboard'} className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 leading-tight tracking-tight">Crimeta</span>
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Official Govt Portal</span>
            </div>
          </Link>
          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-2 ml-auto mr-8">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-black shadow-sm ring-1 ring-indigo-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600 font-bold'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="text-[11px] uppercase tracking-wider">{item.label}</span>
                </Link>
              );
            })}
          </div>
          {/* User Info / Logout - Desktop */}
          <div className="hidden md:flex items-center space-x-4 pl-8 border-l border-slate-200">
            <div className="px-4 py-2.5 rounded-[1.25rem] bg-slate-50 flex items-center gap-3 border border-slate-200 shadow-sm">
              <div className="p-1.5 bg-white rounded-full shadow-sm">
                <User className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <span className="block text-xs text-slate-900 font-black uppercase tracking-wide">{user?.name}</span>
                {user?.badge && (
                  <span className="block text-[10px] font-bold text-slate-500 tracking-wider">Badge: {user.badge}</span>
                )}
              </div>
              <span
                className={`ml-2 px-2.5 py-1 text-[10px] rounded-lg font-black tracking-wider border
                  ${
                    user?.role === 'admin'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : user?.role === 'police'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
              className="flex items-center justify-center p-3 text-slate-500 rounded-xl hover:text-rose-600 hover:bg-rose-50 hover:shadow-sm border border-transparent hover:border-rose-100 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-slate-100 transition-colors"
            aria-label="Open Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div
            className="md:hidden bg-white px-4 border-t border-slate-100 shadow-xl animate-fade-slide-down"
          >
            <div className="py-6 space-y-2">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center px-4 py-3.5 rounded-[1.25rem] transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-black shadow-sm ring-1 ring-indigo-100'
                        : 'text-slate-600 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="text-xs uppercase tracking-wider">{item.label}</span>
                  </Link>
                );
              })}
              {/* Divider */}
              <div className="border-t border-slate-100 my-4" />
              {/* User and Logout - Mobile */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-[1.25rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <User className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-900 font-black uppercase tracking-wide">{user?.name}</span>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 text-[9px] rounded-lg font-black tracking-wider border
                        ${
                          user?.role === 'admin'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : user?.role === 'police'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }
                      `}
                    >
                      {user?.role?.toUpperCase() || 'GUEST'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="p-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
  );
};

export default Navbar;