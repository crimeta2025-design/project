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
  BadgePercent
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
    case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
    case 'investigating': return 'bg-[#e0e7f7] text-[#204080] border-[#b3c1ec]';
    case 'pending': return 'bg-orange-100 text-orange-800 border-orange-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-400';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getRoleClass = (role, light = false) => {
  if (role === 'citizen') return light ? 'bg-green-50 border-green-600 text-[#204080]' : 'bg-green-600';
  if (role === 'police') return light ? 'bg-yellow-50 border-yellow-500 text-[#204080]' : 'bg-yellow-400';
  if (role === 'admin') return light ? 'bg-red-50 border-red-500 text-[#204080]' : 'bg-red-500';
  return 'bg-gray-50 border-gray-300 text-[#204080]';
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
      className={`rounded-lg border-2 shadow-md p-6 hover:bg-[#2953a7]/10 transition-all duration-300
        ${alt ? 'bg-white border-yellow-700' : 'bg-white border-blue-800'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow ${stat.iconBg || 'bg-blue-700'}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${stat.trend === 'up' ? 'text-green-700' : 'text-red-600'}`}>
          {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{stat.change}</span>
        </div>
      </div>
      <h3 className="text-2xl font-extrabold text-[#204080] mb-1">{stat.value}</h3>
      <p className="text-gray-700 text-sm">{stat.title}</p>
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
    <div className="bg-white rounded-lg border-2 border-blue-800 shadow p-0 sm:p-6">
      {/* Mobile accordion header */}
      <button
        type="button"
        className="w-full flex sm:hidden items-center justify-between px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-t-lg"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="flex items-center font-semibold text-[#204080] text-base"><BadgePercent className="w-5 h-5 mr-2" />Department Overview</span>
        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      <h2 className="hidden sm:flex items-center text-lg font-bold text-[#204080] mb-2"><BadgePercent className="w-5 h-5 mr-2" />Department Overview</h2>
      <div className={`sm:block ${open ? 'block' : 'hidden'} sm:!block`}> 
        {/* DepartmentOverview table wrapper */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-[#204080] min-w-[320px] sm:min-w-[520px]">
            <thead>
              <tr className="text-xs uppercase bg-blue-100">
                <th className="py-2 px-2">Department</th>
                <th className="py-2 px-2">Members</th>
                <th className="py-2 px-2">Open</th>
                <th className="py-2 px-2">Resolved</th>
                <th className="py-2 px-2">Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-2 px-2 text-sm font-medium">{s.dept}</td>
                  <td className="py-2 px-2 text-sm">{s.members}</td>
                  <td className="py-2 px-2 text-sm">{s.openCases}</td>
                  <td className="py-2 px-2 text-sm">{s.resolved}</td>
                  <td className="py-2 px-2 text-sm">{s.satisfaction}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile card view (for very narrow screens) */}
        <div className="sm:hidden divide-y border-t mt-2">
          {stats.map((s, i) => (
            <div key={i} className="p-4 flex flex-col gap-1 text-sm">
              <div className="font-semibold text-[#204080]">{s.dept}</div>
              <div className="flex flex-wrap gap-3 text-xs text-[#204080]/80">
                <span><span className="font-medium">Members:</span> {s.members}</span>
                <span><span className="font-medium">Open:</span> {s.openCases}</span>
                <span><span className="font-medium">Resolved:</span> {s.resolved}</span>
                <span><span className="font-medium">Satisfaction:</span> {s.satisfaction}%</span>
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
  <div className="bg-white rounded-lg border-2 border-yellow-700 shadow p-6 mb-6 w-full min-w-[220px]">
    <h2 className="text-lg font-bold text-[#204080] mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2" />Reports by Type</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {data.map((r, i) => {
        const Icon = r.icon;
        return (
          <div key={i} className="flex items-center space-x-3 p-4 rounded-lg bg-[#e5edfa]">
            <Icon className={`w-7 h-7 ${r.color}`} />
            <span className="font-bold text-lg text-[#204080]">{r.count}</span>
            <span className="text-sm">{r.type}</span>
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
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
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
        <div className="bg-white rounded-lg border-2 border-blue-800 shadow p-4 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-[#204080] mb-4">Reports by Status</h3>
          <div className="w-full flex flex-col items-center">
            <div className="w-36 h-36">
              <Pie data={statusPieData} options={statusPieOptions} />
            </div>
            <div className="flex flex-col gap-2 mt-4 w-full">
              {statusData.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }}></span>
                  <span className="font-semibold text-[#204080]">{s.label}</span>
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
        <div className="bg-white rounded-lg border-2 border-blue-800 shadow p-4">
          <h3 className="text-sm font-semibold text-[#204080] mb-4">Reports Trend</h3>
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
        <div className={`bg-white rounded-lg border-2 border-yellow-700 shadow p-5 sm:p-6`}>
          <h2 className="text-xl font-bold text-[#204080] mb-4">Quick Actions</h2>
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
      iconBg: 'bg-blue-700'
    },
    {
      title: 'Resolved Cases',
      value: '143',
      change: '+8%',
      trend: 'up',
      icon: Shield,
      iconBg: 'bg-green-700'
    },
    {
      title: 'Active Cases',
      value: '13',
      change: '-2%',
      trend: 'down',
      icon: AlertTriangle,
      iconBg: 'bg-yellow-600'
    },
    {
      title: 'Community Score',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: Users,
      iconBg: 'bg-purple-700'
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
    { text: "New report filed in Downtown area", minutes: 5, color: 'bg-green-600' },
    { text: "Case #456 marked as resolved", minutes: 15, color: 'bg-yellow-600' },
    { text: "Safety alert issued for Park area", minutes: 60, color: 'bg-[#204080]' },
    { text: "Community patrol scheduled", minutes: 120, color: 'bg-orange-500' }
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
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Main content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header User Card */}
        <motion.div className="mb-8" initial="initial" animate="animate" variants={fadeInUp}>
          <div className={`rounded-lg p-5 sm:p-6 border-2 shadow flex flex-col sm:flex-row sm:items-center gap-6 ${getRoleClass(user?.role, true)}`}>
            <div className={`p-4 rounded-full ${getRoleClass(user?.role)}`}>
              <Shield className={`w-10 h-10 ${user?.role === 'police' ? 'text-[#204080]' : 'text-white'}`} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 leading-tight">{`Welcome,  ${user?.name || 'Guest'}`}</h1>
              <p className={`font-medium ${user?.role === 'citizen' ? 'text-green-700'
                : user?.role === 'police' ? 'text-yellow-700'
                  : 'text-red-700'
                }`}>
                {user?.role === 'citizen'
                  ? 'Community Safety Dashboard'
                  : user?.role === 'police'
                    ? 'Law Enforcement Portal'
                    : 'System Administration Center'}
              </p>
              {user?.badge && (
                <div className="text-gray-700 text-sm">Badge: {user?.badge} • {user?.department}</div>
              )}
            </div>
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
            <div className="bg-white rounded-lg border-2 border-blue-800 shadow p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-[#204080]">Recent Reports</h2>
                <button className="self-start sm:self-auto text-sm font-semibold transition-colors text-blue-800 hover:text-yellow-700">View All</button>
              </div>

              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id}
                    className="bg-[#e5edfa] rounded-lg p-4 border border-[#c4d2ee] hover:bg-[#eef4fb] transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(report.severity)}`}></div>
                        <h3 className="text-[#204080] font-semibold text-sm sm:text-base">{report.type}</h3>
                      </div>
                      <span className={`inline-block w-fit px-2 py-1 rounded-full text-[10px] sm:text-xs border font-semibold capitalize ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#204080]/75">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[140px] sm:max-w-none">{report.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{report.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions & Activity Feed */}
          <motion.div className="space-y-6" initial="initial" animate="animate" variants={fadeInUp}>
            <div
              className="bg-white rounded-lg border-2 border-blue-800 shadow p-4 flex flex-col"
              style={{ minHeight: "480px" }}
            >
              <h3 className="text-lg font-bold text-[#204080] mb-4">Incident Map</h3>
              <div className="w-full h-[400px] rounded-md bg-gray-100 overflow-hidden">
                <MapContainer
                  center={[19.0760, 72.8777]}
                  zoom={13}
                  scrollWheelZoom={true}
                  dragging={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Auto-fit all markers */}
                  <FitBounds positions={[
                    ...recentReports.map(r => [r.lat, r.lng]),
                    ...policeStations.map(s => [s.lat, s.lng])
                  ]} />
                  {/* Incident markers */}
                  {recentReports.map((report) => (
                    <Marker key={report.id} position={[report.lat, report.lng]}>
                      <Popup>
                        <strong>{report.type}</strong><br />
                        {report.location}<br />
                        {report.time}<br />
                        Status: {report.status}
                      </Popup>
                    </Marker>
                  ))}
                  {/* Police station markers */}
                  {policeStations.map((station) => (
                    <Marker key={station.id} position={[station.lat, station.lng]}>
                      <Popup>
                        <strong>{station.name}</strong><br />
                        Police Station
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div className="mt-4 text-xs text-gray-700 text-center w-full">
                <strong>Tip:</strong> You can zoom, pan, and click markers for details. Blue markers show police stations, others show incidents.
              </div>
            </div>
           
            {/* Recent Activity */}
            <div className="bg-white rounded-lg border-2 border-blue-800 shadow p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#204080] mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {activity.map((act, idx) => (
                  <div className="flex items-start space-x-3" key={idx}>
                    <div className={`w-2 h-2 rounded-full mt-2 ${act.color}`}></div>
                    <div>
                      <p className="text-[#204080] text-sm">{act.text}</p>
                      <p className="text-gray-500 text-xs">{act.minutes < 60 ? `${act.minutes} minutes ago` : `${act.minutes / 60} hour(s) ago`}</p>
                    </div>
                  </div>
                ))}
                {usersMock.map((u, i) => (
                  <div className="flex items-start space-x-3" key={i + 4}>
                    <div className={`w-2 h-2 rounded-full mt-2 ${getRoleClass(u.role)}`}></div>
                    <div>
                      <p className="text-[#204080] text-sm">{u.name}: {u.activity}</p>
                      <p className="text-gray-500 text-xs">{u.minAgo} minutes ago</p>
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


