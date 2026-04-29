import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MapPin,
  AlertTriangle,
  Shield,
  Users,
  Clock,
  Home,
  FileText,
  Settings,
  User,
  LogOut,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Star,
  BadgePercent,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Pie, Line } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);
import { useNavigate } from 'react-router-dom';

// ====== Tricolor Header Bar ======
const TricolorBar = ({ show }) =>
  show ? (
    <div className="w-full flex h-[6px]">
      {/* <div className="flex-1 bg-[#138808]" /> Green */}
      <div className="flex-1 bg-white" />
      {/* <div className="flex-1 bg-[#ff9933]" /> */}
    </div>
  ) : null;

TricolorBar.propTypes = { show: PropTypes.bool };

// ====== Utility Color Helpers ======
const getStatusColor = (status) => {
  switch (status) {
    case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'investigating': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high': return 'bg-rose-500';
    case 'medium': return 'bg-amber-400';
    case 'low': return 'bg-emerald-500';
    default: return 'bg-slate-500';
  }
};

const getRoleClass = (role, light = false) => {
  if (role === 'citizen') return light ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500 text-white';
  if (role === 'police') return light ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-indigo-500 text-white';
  if (role === 'admin') return light ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-500 text-white';
  return 'bg-slate-50 border-slate-200 text-slate-800';
};

const FAKE_DEPARTMENT_STATS = [
  { dept: 'Central Police', members: 138, openCases: 9, resolved: 121, satisfaction: 88 },
  { dept: 'Metro Security', members: 37, openCases: 2, resolved: 34, satisfaction: 95 },
  { dept: 'Civic Watch', members: 34, openCases: 4, resolved: 90, satisfaction: 80 },
  { dept: 'Cyber Cell', members: 23, openCases: 1, resolved: 41, satisfaction: 92 }
];



// More mock users for activity
const usersMock = [
  { name: 'Radhika Sharma', role: 'police', activity: 'Marked case #293 as resolved', minAgo: 11 },
  { name: 'Anupam S.', role: 'citizen', activity: 'Filed report in Market Sq.', minAgo: 26 },
  { name: 'Admin', role: 'admin', activity: 'Granted badge to Officer Sunil', minAgo: 40 }
];

// ====== Stats Widget ======
const StatCard = ({ stat, alt }) => {
  const Icon = stat.icon;
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
      }}
      className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white group"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-sm ${stat.iconBg || 'bg-indigo-600 text-white'}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center space-x-1 text-sm font-semibold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{stat.change}</span>
        </div>
      </div>
      <h3 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h3>
      <p className="text-slate-500 text-[11px] font-black uppercase tracking-wider">{stat.title}</p>
    </motion.div>
  );
};

StatCard.propTypes = {
  stat: PropTypes.object,
  alt: PropTypes.bool,
};

// ====== Department Overview Section ======
const DepartmentOverview = ({ stats }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-0 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-indigo-100"></div>
      {/* Mobile accordion header */}
      <button
        type="button"
        className="w-full flex sm:hidden items-center justify-between px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-t-[2.5rem]"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="flex items-center font-black uppercase text-slate-800 text-sm tracking-wider"><BadgePercent className="w-5 h-5 mr-2 text-indigo-500" />Department Overview</span>
        {open ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </button>
      <h2 className="hidden sm:flex items-center text-sm font-black uppercase tracking-wider text-slate-800 mb-6"><BadgePercent className="w-5 h-5 mr-2 text-indigo-500" />Department Overview</h2>
      <div className={`sm:block ${open ? 'block' : 'hidden'} sm:!block`}> 
        {/* DepartmentOverview table wrapper */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-slate-700 min-w-[320px] sm:min-w-[520px]">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Open</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 text-sm font-bold text-slate-800">{s.dept}</td>
                  <td className="py-4 px-4 text-sm font-medium">{s.members}</td>
                  <td className="py-4 px-4 text-sm font-medium">
                    <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded-full text-xs font-bold">{s.openCases}</span>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">{s.resolved}</span>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{s.satisfaction}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.satisfaction}%` }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile card view (for very narrow screens) */}
        <div className="sm:hidden divide-y divide-slate-100 mt-2 px-2 pb-4">
          {stats.map((s, i) => (
            <div key={i} className="p-4 flex flex-col gap-2 text-sm bg-slate-50/50 rounded-2xl mb-2">
              <div className="font-bold text-slate-800 text-base">{s.dept}</div>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 mt-1">
                <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Members</span> <span className="font-semibold text-sm">{s.members}</span></div>
                <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Open</span> <span className="font-semibold text-rose-600 text-sm">{s.openCases}</span></div>
                <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Resolved</span> <span className="font-semibold text-emerald-600 text-sm">{s.resolved}</span></div>
                <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Satisfaction</span> <span className="font-semibold text-indigo-600 text-sm">{s.satisfaction}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

DepartmentOverview.propTypes = { stats: PropTypes.array };

// ====== Reports By Type Section (with icons) ======
const ReportsByType = ({ data }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 mb-6 w-full min-w-[220px] relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-100 to-purple-100"></div>
    <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-6 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-indigo-500" />Reports by Type</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {data.map((r, i) => {
        const Icon = r.icon;
        return (
          <div key={i} className="flex flex-col space-y-2 p-5 rounded-[1.5rem] bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-slate-100">
            <div className="flex items-center justify-between w-full">
              <div className={`p-2 rounded-xl bg-white shadow-sm text-indigo-500`}>
                <Icon className={`w-5 h-5`} />
              </div>
              <span className="font-black text-xl text-slate-800">{r.count}</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{r.type}</span>
          </div>
        );
      })}
    </div>
  </div>
);

ReportsByType.propTypes = { data: PropTypes.array };

// ====== Citizen-only Summary Panel (small charts, quick actions, map) ======
const CitizenPanel = ({ recentReports = [], activity = [], user }) => {
  const navigate = useNavigate();

  const statusData = [
    { label: 'Resolved', value: 90, color: '#10b981' },
    { label: 'Active', value: 45, color: '#3b82f6' },
    { label: 'New', value: 21, color: '#9ca3af' }
  ];

  const statusPieData = {
    labels: statusData.map(s => s.label),
    datasets: [
      {
        data: statusData.map(s => s.value),
        backgroundColor: statusData.map(s => s.color),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8,
      }
    ]
  };

  const statusPieOptions = {
    responsive: true,
    animation: {
      animateRotate: true,
      animateScale: true
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed} reports`;
          }
        }
      }
    }
  };

  const trendLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Reports',
        data: [22, 38, 45, 62, 54],
        fill: false,
        borderColor: '#7c3aed',        // <-- purple line
        backgroundColor: '#c4b5fd',    // <-- light purple points
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      }
    ]
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Reports: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false }, beginAtZero: true }
    },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reports by Status (pie) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/10 to-transparent"></div>
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-4 w-full text-left">Reports by Status</h3>
          <div className="w-full flex flex-col items-center">
            <div className="w-36 h-36">
              <Pie data={statusPieData} options={statusPieOptions} />
            </div>
            <div className="flex flex-col gap-2 mt-4 w-full">
              {statusData.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }}></span>
                  <span className="font-semibold text-slate-800">{s.label}</span>
                  <span className="text-xs text-gray-500 ml-auto">{s.value} reports</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-700 text-center w-full">
              <strong>Summary:</strong> Most reports are resolved, showing strong community response. Active cases are being investigated, and new reports are monitored daily.
            </div>
          </div>
        </div>

        {/* Reports Trend (mini line) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/10 to-transparent"></div>
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-4 w-full text-left">Reports Trend</h3>
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-[420px] h-[220px]">
              <Line data={trendData} options={{
                ...trendOptions,
                plugins: {
                  ...trendOptions.plugins,
                  legend: { display: true, position: 'top' },
                  tooltip: {
                    ...trendOptions.plugins.tooltip,
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      label: function(context) {
                        return `Reports: ${context.parsed.y}`;
                      }
                    }
                  }
                },
                animation: {
                  duration: 1200,
                  easing: 'easeOutQuart'
                },
                scales: {
                  x: { grid: { display: true, color: "#e5edfa" }, title: { display: true, text: "Month" } },
                  y: { grid: { display: true, color: "#e5edfa" }, title: { display: true, text: "Reports" }, beginAtZero: true }
                }
              }} />
            </div>
            <div className="mt-4 text-sm text-gray-700 text-center w-full">
              <strong>Summary:</strong> Reports increased steadily from January to April, peaking at 62. May saw a slight decrease, indicating improved safety measures and community awareness.
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center w-full">
              <span>Hover over points for details. Trend helps track safety improvements and incident frequency.</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/10 to-transparent"></div>
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-4 w-full text-left">Quick Actions</h2>
          <div className="space-y-3">
            {user?.role === 'citizen' && (
              <>
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  onClick={() => navigate('/report')}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Report Incident</span>
                </button>
                <button
                  className="w-full bg-[#204080]/10 hover:bg-[#204080]/20 text-[#204080] p-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  onClick={() => navigate('/my-reports')}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View My Reports</span>
                </button>
              </>
            )}
            <button
              className="w-full bg-[#204080]/10 hover:bg-[#204080]/20 text-[#204080] p-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              onClick={() => navigate('/map')}
            >
              <MapPin className="w-4 h-4" />
              <span>View Safety Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* ...rest of CitizenPanel... */}
    </div>
  );
};

// Helper to fit map to all markers
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [30, 30] });
    }
  }, [positions, map]);
  return null;
}; 

// ====== Main Dashboard Component ======
const Dashboard = () => {
  const { user } = useAuth();

  // ----- Stats Data -----
  const stats = useMemo(() => ([
    {
      title: 'Total Reports',
      value: '156',
      change: '+12%',
      trend: 'up',
      icon: BarChart3,
      iconBg: 'bg-indigo-500'
    },
    {
      title: 'Resolved Cases',
      value: '143',
      change: '+8%',
      trend: 'up',
      icon: Shield,
      iconBg: 'bg-emerald-500'
    },
    {
      title: 'Active Cases',
      value: '13',
      change: '-2%',
      trend: 'down',
      icon: AlertTriangle,
      iconBg: 'bg-amber-500'
    },
    {
      title: 'Community Score',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: Users,
      iconBg: 'bg-purple-500'
    }
  ]), []);

  // ----- Reports Data -----
  const recentReports = useMemo(() => [
    { id: 1, type: 'Theft', location: 'Downtown Mall', time: '2 hours ago', status: 'investigating', severity: 'medium', lat: 19.0760, lng: 72.8777 },
    { id: 2, type: 'Vandalism', location: 'Central Park', time: '4 hours ago', status: 'resolved', severity: 'low', lat: 19.0800, lng: 72.8800 },
    { id: 3, type: 'Assault', location: 'Main Street', time: '6 hours ago', status: 'pending', severity: 'high', lat: 19.0700, lng: 72.8700 },
    { id: 4, type: 'Drug Activity', location: 'School District', time: '8 hours ago', status: 'investigating', severity: 'high', lat: 19.0780, lng: 72.8750 },
    { id: 5, type: 'Theft', location: 'Station Road', time: '1 day ago', status: 'resolved', severity: 'medium', lat: 19.0740, lng: 72.8790 },
    { id: 6, type: 'Other', location: 'Sector 9', time: '2 days ago', status: 'pending', severity: 'low', lat: 19.0720, lng: 72.8760 }
  ], []);

  // ----- Activity Feed -----
  const activity = [
    { text: "New report filed in Downtown area", minutes: 5, color: 'bg-indigo-500' },
    { text: "Case #456 marked as resolved", minutes: 15, color: 'bg-emerald-500' },
    { text: "Safety alert issued for Park area", minutes: 60, color: 'bg-amber-500' },
    { text: "Community patrol scheduled", minutes: 120, color: 'bg-purple-500' }
  ];

  // ----- Animation -----
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  // ================ RENDER ================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Main content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header User Card */}
        <motion.div className="mb-8 mt-4" initial="initial" animate="animate" variants={fadeInUp}>
          <div className={`bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6 relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
            <div className={`p-4 rounded-[1.5rem] ${getRoleClass(user?.role, true)}`}>
              <Shield className={`w-8 h-8`} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-black mb-1 text-slate-900 tracking-tight">{`Welcome, ${user?.name || 'Guest'}`}</h1>
              <p className={`font-bold text-[11px] tracking-wider uppercase ${user?.role === 'citizen' ? 'text-emerald-600'
                : user?.role === 'police' ? 'text-indigo-600'
                  : 'text-rose-600'
                }`}>
                {user?.role === 'citizen'
                  ? 'Community Safety Dashboard'
                  : user?.role === 'police'
                    ? 'Law Enforcement Portal'
                    : 'System Administration Center'}
              </p>
            </div>
            {user?.badge && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Badge Number</span>
                <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full mt-1">{user?.badge}</span>
                <span className="text-xs text-slate-500 mt-2 font-medium">{user?.department}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats widgets grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial="initial" animate="animate" variants={staggerContainer}
        >
          {stats.map((stat, idx) => (
            <StatCard key={idx} stat={stat} alt={idx % 2 === 1} />
          ))}
        </motion.div>

        {/* "Reports by Type" and "Department Overview" row */}
        <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-2 mb-8">
          
         
        </div>

        {/* Insert citizen panel: */}
        {user?.role === 'citizen' && (
          <motion.div initial="initial" animate="animate" variants={staggerContainer} className="mb-8">
            <CitizenPanel recentReports={recentReports} activity={activity} user={user} />
          </motion.div>
        )}

       
        {/* Main content row (Reports, Quick Actions, Activity) */}
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Recent Reports */}
          <motion.div className="lg:col-span-2" initial="initial" animate="animate" variants={fadeInUp}>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/10 to-transparent"></div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-800">Recent Reports</h2>
                <button className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-4 py-2 rounded-full">View All</button>
              </div>

              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id}
                    className="group bg-slate-50 rounded-[1.5rem] p-5 border border-slate-100 hover:border-indigo-100 hover:bg-white hover:shadow-sm transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${getSeverityColor(report.severity)} ring-4 ring-white shadow-sm`}></div>
                        <h3 className="text-slate-900 font-bold text-base">{report.type}</h3>
                      </div>
                      <span className={`inline-block w-fit px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 ml-6">
                      <div className="flex items-center space-x-1.5 bg-slate-100/50 px-2 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[140px] sm:max-w-none">{report.location}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-slate-100/50 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{report.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions & Activity Feed */}
          <motion.div className="space-y-6 lg:space-y-8" initial="initial" animate="animate" variants={fadeInUp}>
            <div
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden"
              style={{ minHeight: "480px" }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-indigo-100"></div>
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-6 flex items-center"><MapPin className="w-4 h-4 mr-2 text-indigo-500" />Incident Map</h3>
              <div className="w-full h-[380px] rounded-[1.5rem] bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                <MapContainer
                  center={[19.0760, 72.8777]}
                  zoom={13}
                  scrollWheelZoom={true}
                  dragging={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />
                  {/* Auto-fit all markers */}
                  <FitBounds positions={[
                    ...recentReports.map(r => [r.lat, r.lng]),
                    ...policeStations.map(s => [s.lat, s.lng])
                  ]} />
                  {/* Incident markers */}
                  {recentReports.map((report) => (
                    <Marker key={report.id} position={[report.lat, report.lng]}>
                      <Popup className="rounded-xl overflow-hidden shadow-sm border-0">
                        <div className="p-1">
                          <strong className="text-slate-900 block mb-1">{report.type}</strong>
                          <span className="text-slate-600 text-xs block">{report.location}</span>
                          <span className="text-slate-500 text-[10px] block mb-2">{report.time}</span>
                          <span className={`inline-block px-2 py-1 rounded text-[9px] font-black uppercase ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {/* Police station markers */}
                  {policeStations.map((station) => (
                    <Marker key={station.id} position={[station.lat, station.lng]}>
                      <Popup className="rounded-xl overflow-hidden shadow-sm border-0">
                        <div className="p-1">
                          <strong className="text-indigo-900 block mb-1">{station.name}</strong>
                          <span className="text-indigo-600 text-xs font-bold bg-indigo-50 px-2 py-0.5 rounded-full">Police Station</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
           
            {/* Recent Activity */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-100 to-transparent"></div>
              <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-6 flex items-center"><Activity className="w-4 h-4 mr-2 text-indigo-500" />Recent Activity</h2>
              <div className="space-y-5">
                {activity.map((act, idx) => (
                  <div className="flex items-start space-x-4" key={idx}>
                    <div className="mt-1">
                      <div className={`w-3 h-3 rounded-full ${act.color} ring-4 ring-slate-50 shadow-sm`}></div>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <p className="text-slate-800 text-sm font-semibold">{act.text}</p>
                      <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-wider">{act.minutes < 60 ? `${act.minutes} minutes ago` : `${act.minutes / 60} hour(s) ago`}</p>
                    </div>
                  </div>
                ))}
                {usersMock.map((u, i) => (
                  <div className="flex items-start space-x-4" key={i + 4}>
                    <div className="mt-1">
                      <div className={`w-3 h-3 rounded-full ${getRoleClass(u.role).split(' ')[0]} ring-4 ring-slate-50 shadow-sm`}></div>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <p className="text-slate-800 text-sm font-semibold"><span className="text-indigo-600">{u.name}</span>: {u.activity}</p>
                      <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-wider">{u.minAgo} minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>

        {/* Footer note */}
        <div className="text-center text-gray-200 py-8">
          SafeReport &copy; {new Date().getFullYear()} – Official Government Safety Portal
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

const policeStations = [
  { id: 1, name: 'Central Police Station', lat: 19.0765, lng: 72.8779 },
  { id: 2, name: 'Metro Security HQ', lat: 19.0790, lng: 72.8810 },
  { id: 3, name: 'Civic Watch Post', lat: 19.0730, lng: 72.8740 },
  { id: 4, name: 'Cyber Cell Office', lat: 19.0750, lng: 72.8780 }
];


