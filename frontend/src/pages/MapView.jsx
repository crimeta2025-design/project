import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Filter,
  Calendar,
  BarChart3,
  AlertTriangle,
  Shield,
  Eye,
  ChevronDown,
  User
} from "lucide-react";

// Tricolor Bar for government feel
const TricolorBar = () => (
  <div className="w-full flex h-[6px]">
    <div className="flex-1 bg-white" />
  </div>
);

const GOV_BLUE = "#204080";
const ACCENT = "#00C9A7";

// Helper for marker severity color
const getSeverityColor = (sev) =>
  sev === "high"
    ? "bg-red-600"
    : sev === "medium"
    ? "bg-yellow-400"
    : sev === "low"
    ? "bg-green-600"
    : "bg-gray-400";

// Helper: incident icon
const getIncidentIcon = (type) => {
  switch (type) {
    case "theft":
      return "🏪";
    case "assault":
      return "⚠️";
    case "vandalism":
      return "🎨";
    case "drug":
      return "💊";
    default:
      return "📍";
  }
};

// Sidebar: filter, stat, controls
const FILTERS = [
  { value: "all", label: "All Incidents", count: 156 },
  { value: "theft", label: "Theft/Burglary", count: 45 },
  { value: "assault", label: "Assault", count: 23 },
  { value: "vandalism", label: "Vandalism", count: 34 },
  { value: "drug", label: "Drug Activity", count: 18 },
  { value: "other", label: "Other", count: 36 }
];

const TIME_FILTERS = [
  { value: "day", label: "Last 24 Hours" },
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
  { value: "year", label: "Last Year" }
];

// -- Sidebar Quickstat cell
const StatRow = ({ label, value, color }) => (
  <div className="flex justify-between items-center text-base">
    <span>{label}</span>
    <span className={`font-bold ${color}`}>{value}</span>
  </div>
);
// -- Activity Feed cell
const FeedItem = ({ icon, label }) => (
  <div className="flex items-center gap-2 text-base">
    {icon}
    <span>{label}</span>
  </div>
);
// -- Map incident feed cell
const IncidentRow = ({ inc }) => (
  <div className="flex justify-between items-center py-3">
    <div className="flex items-center gap-2">
      <span
        className={`w-3 h-3 rounded-full ${getSeverityColor(
          inc.severity
        )} block`}
      ></span>
      <span className="capitalize">{inc.type}</span>
      <span className="text-gray-500">({inc.location})</span>
    </div>
    <div className="flex gap-4 items-center text-sm">
      <span>{inc.time}</span>
      <MapPin className="w-4 h-4 text-gray-400" />
    </div>
  </div>
);

const MapView = () => {
  // ------------ FIXED: all state in component -----------
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("week");
  const [incidents, setIncidents] = useState([
    // Mock data; replace with API for dynamic
    {
      id: 1,
      type: "theft",
      lat: 40.7128,
      lng: -74.006,
      severity: "medium",
      time: "2 hours ago",
      location: "Downtown Mall",
    },
    {
      id: 2,
      type: "vandalism",
      lat: 40.7589,
      lng: -73.9851,
      severity: "low",
      time: "4 hours ago",
      location: "Central Park",
    },
    {
      id: 3,
      type: "assault",
      lat: 40.7505,
      lng: -73.9934,
      severity: "high",
      time: "6 hours ago",
      location: "Main Street",
    },
    {
      id: 4,
      type: "drug",
      lat: 40.7282,
      lng: -73.7949,
      severity: "high",
      time: "1 day ago",
      location: "School District",
    },
    {
      id: 5,
      type: "theft",
      lat: 40.6892,
      lng: -74.0445,
      severity: "medium",
      time: "2 days ago",
      location: "Station Road",
    },
  ]);
  const [loading] = useState(false); // No mock async
  const [error] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocationError('Location access denied')
      );
    } else {
      setLocationError("Geolocation not supported");
    }
  }, []);

  // Animation config
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-gray-900">
      <TricolorBar />
      <div className="max-w-8xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex items-center space-x-4">
            <MapPin className="w-10 h-10 text-[var(--accent-color,#00C9A7)]" />
            <div>
              <h1
                className="text-3xl font-black tracking-tight"
                style={{ color: GOV_BLUE }}
              >
                Official Community Incident Map
              </h1>
              <span className="text-gray-700">
                Real-time map view of local incident reports (desktop optimized)
              </span>
            </div>
          </div>
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-3 xl:col-span-2">
            {/* Filters card */}
            <section className="mb-8 bg-white rounded-2xl border border-blue-100 shadow-md p-5">
              <div className="flex items-center mb-4 gap-2">
                <Filter className="w-5 h-5 text-blue-800" />
                <h2 className="font-bold text-lg" style={{ color: GOV_BLUE }}>
                  Incident Type
                </h2>
              </div>
              <div className="space-y-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSelectedFilter(f.value)}
                    className={`flex justify-between items-center w-full px-3 py-2 rounded-lg transition-colors font-medium text-left
                      ${
                        selectedFilter === f.value
                          ? "bg-blue-50 border border-blue-700 text-blue-900"
                          : "hover:bg-blue-50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center
                          ${
                            f.value === "theft"
                              ? "bg-yellow-400"
                              : f.value === "assault"
                              ? "bg-red-600"
                              : f.value === "vandalism"
                              ? "bg-green-600"
                              : f.value === "drug"
                              ? "bg-purple-500"
                              : "bg-blue-200"
                          }`}
                      ></span>
                      <span className="text-base">{f.label}</span>
                    </div>
                    <span className="font-bold text-xs">{f.count}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Time filter */}
            <section className="mb-8 bg-white rounded-2xl border border-blue-100 shadow-md p-5">
              <div className="flex items-center mb-4 gap-2">
                <Calendar className="w-5 h-5 text-blue-800" />
                <h2 className="font-bold text-lg" style={{ color: GOV_BLUE }}>
                  Time Period
                </h2>
              </div>
              <div className="space-y-2">
                {TIME_FILTERS.map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer text-base transition ${
                      t.value === timeFilter
                        ? "bg-blue-50 text-blue-800 font-semibold"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeFilter"
                      checked={t.value === timeFilter}
                      value={t.value}
                      onChange={() => setTimeFilter(t.value)}
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 border-2 rounded-full shrink-0 flex items-center justify-center
                        ${t.value === timeFilter ? "bg-[var(--accent-color,#00C9A7)] border-[var(--accent-color,#00C9A7)]" : "border-gray-400"}
                      `}
                    >
                      {t.value === timeFilter && (
                        <span className="block w-2 h-2 bg-white rounded-full"></span>
                      )}
                    </span>
                    {t.label}
                  </label>
                ))}
              </div>
            </section>

            {/* Quick Stats */}
            <section className="mb-6 bg-white rounded-2xl border border-blue-100 shadow-md p-5">
              <div className="flex items-center mb-4 gap-2">
                <BarChart3 className="w-5 h-5 text-blue-800" />
                <h3
                  className="font-bold text-lg"
                  style={{ color: GOV_BLUE }}
                >
                  Quick Stats
                </h3>
              </div>
              <div className="space-y-2">
                <StatRow label="Total Reports" value={156} color="text-red-700" />
                <StatRow label="Resolved" value={143} color="text-green-700" />
                <StatRow label="Active" value={13} color="text-orange-600" />
                <StatRow label="Safety Score" value="87%" color={`text-[${ACCENT}]`} />
              </div>
            </section>
          </aside>

          {/* MAIN MAP VIEW AREA */}
          <main className="col-span-9 xl:col-span-10">
            <motion.div
              className="w-full h-[650px] bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-200 rounded-2xl shadow-lg relative overflow-hidden flex flex-col"
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              {/* Grid background pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="grid grid-cols-14 grid-rows-10 h-full">
                  {Array.from({ length: 140 }).map((_, i) => (
                    <div key={i} className="border border-white/30"></div>
                  ))}
                </div>
              </div>

              {/* Incident Markers */}
              {!loading && !error && incidents.filter(
                i => selectedFilter === "all" || i.type === selectedFilter
              ).map((incident, idx) => (
                <div
                  key={incident.id}
                  className="absolute group transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{
                    left: `${22 + idx * 14.5}%`,
                    top: `${25 + idx * 13}%`,
                  }}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-base font-black text-gray-900 ${getSeverityColor(
                      incident.severity
                    )} transition-all pointer-events-auto`}
                  >
                    {getIncidentIcon(incident.type)}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 min-w-[110px] bg-black/80 text-white p-3 rounded-lg text-xs opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap transition duration-300 z-10">
                    <div className="text-sm font-bold capitalize mb-1">
                      {incident.type}
                    </div>
                    <div className="mb-1">
                      <MapPin className="w-3 h-3 inline mb-0.5" /> {incident.location}
                    </div>
                    <div>{incident.time}</div>
                    <span
                      className={`inline-block mt-1 px-1 py-0.5 rounded text-xs ${
                        incident.severity === "high"
                          ? "bg-red-600"
                          : incident.severity === "medium"
                          ? "bg-yellow-400"
                          : "bg-green-600"
                      }`}
                    >
                      {incident.severity} severity
                    </span>
                  </div>
                </div>
              ))}

              {/* USER LIVE LOCATION MARKER */}
              {userLocation && (
                <div
                  className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{
                    left: "50%",
                    top: "50%"
                  }}
                >
                  <div className="w-9 h-9 rounded-full border-4 border-green-300 bg-white flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                    Your Live Location
                  </div>
                </div>
              )}

              {/* Loading/Error messages */}
              {loading && (
                <div className="absolute left-1/2 top-2 z-40 bg-yellow-100 text-yellow-700 px-6 py-2 rounded-xl shadow text-xs -translate-x-1/2">
                  Loading map incidents...
                </div>
              )}
              {error && (
                <div className="absolute left-1/2 top-2 z-40 bg-red-100 text-red-700 px-6 py-2 rounded-xl shadow text-xs -translate-x-1/2">
                  {error}
                </div>
              )}
              {locationError && (
                <div className="absolute left-1/2 top-10 z-40 bg-red-100 text-red-700 px-6 py-2 rounded-xl shadow text-xs -translate-x-1/2">
                  {locationError}
                </div>
              )}

              {/* Center label (optional, as before) */}
              <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                <div className="bg-black/30 rounded-xl px-10 py-10 text-center text-white shadow space-y-2">
                  <MapPin className="w-12 h-12 text-[var(--accent-color,#00C9A7)] mx-auto mb-2" />
                  <h2 className="text-2xl font-extrabold" style={{ color: "#204080" }}>
                    Interactive Map View
                  </h2>
                  <span className="text-gray-100">
                    This is a simulation; real mapping service (Google/Mapbox) comes here.
                  </span>
                  <div className="text-sm mt-4 flex justify-center gap-6 text-blue-100">
                    <span>📍 {incidents.length} displayed</span>
                    <span>🔄 Real-time updates</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Activity log */}
            <section className="mt-8 grid grid-cols-3 gap-8">
              <div className="col-span-2">
                <div className="bg-white rounded-2xl border border-blue-100 shadow p-6">
                  <h3 className="font-bold text-lg mb-2" style={{ color: GOV_BLUE }}>
                    Map Incident Feed
                  </h3>
                  <div className="divide-y divide-blue-100">
                    {incidents.slice(0, 5).map((inc) => (
                      <IncidentRow key={inc.id} inc={inc} />
                    ))}
                  </div>
                </div>
              </div>
              {/* Map legend/summary */}
              <div>
                <div className="bg-white rounded-2xl border border-blue-100 shadow p-6">
                  <h3 className="font-bold text-lg mb-2" style={{ color: GOV_BLUE }}>
                    Activity Summary
                  </h3>
                  <div className="space-y-4">
                    <FeedItem
                      icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
                      label="2 new reports in past hour"
                    />
                    <FeedItem
                      icon={<Shield className="w-4 h-4 text-green-600" />}
                      label="Safety patrolling scheduled"
                    />
                    <FeedItem
                      icon={<BarChart3 className="w-4 h-4 text-blue-700" />}
                      label="Cases resolved: +8%"
                    />
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
        {/* Page footer */}
        <footer className="mt-12 text-sm text-gray-500 text-center">
          Crimeta Portal © {new Date().getFullYear()}  |  Official Government Service
        </footer>
      </div>
    </div>
  );
};

export default MapView;
