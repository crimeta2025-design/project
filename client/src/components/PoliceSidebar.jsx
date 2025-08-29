import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Settings,
  User,
  Home,
  FileText,
  BarChart,
  Map,
  Shield,
  LogOut,
  Menu
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const navLinks = [
  { name: "Police Panel", icon: <Shield />, to: "/policepanel" },
  { name: "Dashboard", icon: <Home />, to: "/policedashboard" },
  { name: "Cases", icon: <FileText />, to: "/policedashboard/cases" },
  { name: "Reports", icon: <BarChart />, to: "/policedashboard/reports" },
  { name: "Map View", icon: <Map />, to: "/map" },
];

const bottomLinks = [
  { name: "Search", icon: <Search />, href: "#" },
  { name: "Notifications", icon: <Bell />, href: "#" },
  { name: "Settings", icon: <Settings />, href: "#" },
  { name: "Profile", icon: <User />, href: "#" },
];

const PoliceSidebar = ({ sidebarOpen, setSidebarOpen, logoUrl = "/logo.png" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout?.();
    } catch (err) {
      // ignore
    } finally {
      navigate("/login");
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-sm border-r transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:block flex flex-col justify-between`}
      aria-label="Sidebar"
    >
      <div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            {/* logo + text sequence matching provided design */}
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="Crimeta logo"
                className="w-12 h-12 object-contain rounded-md"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  {/* increased shield size */}
                  <Shield className="w-10 h-10 text-blue-600" />
                  <span className="text-blue-600 font-extrabold text-2xl">Crimeta</span>
                </div>
                <div className="text-xs text-yellow-500 font-semibold uppercase tracking-wide">OFFICIAL GOVT. PORTAL</div>
              </div>
            </div>
          </div>

          <nav className="space-y-2" aria-label="Main navigation">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              const icon = React.cloneElement(link.icon, { className: isActive ? "w-5 h-5 text-white" : "w-5 h-5 text-blue-600" });
              return (
                <Link
                  key={link.name}
                  to={link.to}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition
                    ${isActive ? "bg-blue-600 text-white font-bold" : "text-gray-700 hover:bg-blue-50 font-medium"}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {icon}
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-6 border-t flex flex-col gap-3">
        {bottomLinks.map(link => {
          const isActive = false;
          const icon = React.cloneElement(link.icon, { className: isActive ? "w-5 h-5 text-white" : "w-5 h-5 text-gray-600" });
          return (
            <a
              key={link.name}
              href={link.href}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              {icon}
              <span className="hidden xl:inline">{link.name}</span>
            </a>
          );
        })}

        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span>Logout</span>
        </button>
      </div>

      <button
        className="absolute top-4 right-4 lg:hidden text-gray-500"
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
      >
        ✕
      </button>
    </aside>
  );
};

export default PoliceSidebar;