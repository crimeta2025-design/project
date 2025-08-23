import React from "react";
import {
  Search,
  Bell,
  Settings,
  User,
  Home,
  FileText,
  BarChart,
  Map,
  Shield
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { name: "Police Panel", icon: <Shield className="w-5 h-5" />, to: "/policepanel" },
  { name: "Dashboard", icon: <Home className="w-5 h-5" />, to: "/policedashboard" },
  { name: "Cases", icon: <FileText className="w-5 h-5" />, to: "/policedashboard/cases" },
  { name: "Reports", icon: <BarChart className="w-5 h-5" />, to: "/policedashboard/reports" },
  { name: "Map View", icon: <Map className="w-5 h-5" />, to: "/mapview" },
];

const bottomLinks = [
  { name: "Search", icon: <Search className="w-5 h-5" />, href: "#" },
  { name: "Notifications", icon: <Bell className="w-5 h-5" />, href: "#" },
  { name: "Settings", icon: <Settings className="w-5 h-5" />, href: "#" },
  { name: "Profile", icon: <User className="w-5 h-5" />, href: "#" },
];

const PoliceSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-sm border-r transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:block flex flex-col justify-between`}
    >
      <div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-gray-900">Police Panel</span>
          </div>
          <nav className="space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.to}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition
                  ${location.pathname === link.to
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-50"}`}
                onClick={() => setSidebarOpen(false)}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="p-6 border-t flex flex-col gap-4">
        {bottomLinks.map(link => (
          <a
            key={link.name}
            href={link.href}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            {link.icon}
            <span className="hidden xl:inline">{link.name}</span>
          </a>
        ))}
      </div>
      <button
        className="absolute top-4 right-4 lg:hidden text-gray-500"
        onClick={() => setSidebarOpen(false)}
      >
        ✕
      </button>
    </div>
  );
};

export default PoliceSidebar;