import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Filter,
  Calendar,
  BarChart3,
  AlertTriangle,
  Shield,
  Eye,
  ChevronDown,
  User,
  Navigation,
  Target,
  Crosshair
} from "lucide-react";

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color, type) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: white;
      font-weight: bold;
    ">${type}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// User location marker with pulsing effect
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="
    position: relative;
    width: 20px;
    height: 20px;
  ">
    <div style="
      position: absolute;
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(59,130,246,0.4);
      z-index: 10;
    "></div>
    <div style="
      position: absolute;
      width: 40px;
      height: 40px;
      background: rgba(59,130,246,0.2);
      border-radius: 50%;
      top: -10px;
      left: -10px;
      animation: pulse 2s infinite;
    "></div>
  </div>
  <style>
    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; }
    }
  </style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Component to handle map updates smoothly
const LocationUpdater = ({ userLocation, mapRef }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation && map) {
      // Update map reference
      if (mapRef) {
        mapRef.current = map;
      }
    }
  }, [userLocation, map, mapRef]);

  return null;
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

// Government color scheme
const GOV_BLUE = "#1e3a8a";
const ACCENT_COLOR = "#00C9A7";

// Filters configuration
const FILTERS = [
  { value: "all", label: "All Incidents", count: 5 },
  { value: "theft", label: "Theft", count: 2 },
  { value: "vandalism", label: "Vandalism", count: 1 },
  { value: "assault", label: "Assault", count: 1 },
  { value: "drug", label: "Drug Activity", count: 1 },
];

const TIME_FILTERS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

// Tricolor bar component
const TricolorBar = () => (
  <div className="w-full h-1 flex">
    <div className="flex-1 bg-orange-500"></div>
    <div className="flex-1 bg-white"></div>
    <div className="flex-1 bg-green-600"></div>
  </div>
);

const MapView = () => {
  // ------------ Enhanced state management -----------
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("week");
  const [incidents] = useState([
    // Updated coordinates for better demonstration (Mumbai area)
    {
      id: 1,
      type: "theft",
      lat: 19.0760,
      lng: 72.8777,
      severity: "medium",
      time: "2 hours ago",
      location: "Downtown Mall",
      description: "Bike theft reported near shopping complex"
    },
    {
      id: 2,
      type: "vandalism",
      lat: 19.0896,
      lng: 72.8656,
      severity: "low",
      time: "4 hours ago",
      location: "Central Park",
      description: "Graffiti on public property"
    },
    {
      id: 3,
      type: "assault",
      lat: 19.0728,
      lng: 72.8826,
      severity: "high",
      time: "6 hours ago",
      location: "Main Street",
      description: "Physical altercation reported"
    },
    {
      id: 4,
      type: "drug",
      lat: 19.0596,
      lng: 72.8295,
      severity: "high",
      time: "1 day ago",
      location: "School District",
      description: "Suspicious drug activity near school"
    },
    {
      id: 5,
      type: "theft",
      lat: 19.0330,
      lng: 72.8570,
      severity: "medium",
      time: "2 days ago",
      location: "Station Road",
      description: "Wallet stolen from railway station"
    },
  ]);

  // Enhanced location tracking states
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const mapRef = useRef();

  // Enhanced location tracking with high accuracy and smooth updates
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsTracking(true);
    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for better GPS lock
      maximumAge: 1000 // Allow 1 second cache for smooth updates
    };

    // Get initial position with better error handling
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Initial position obtained:', position.coords);
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date()
        };
        setUserLocation(newLocation);
        setLocationAccuracy(position.coords.accuracy);
        setLastUpdate(new Date());
        
        // Fly to user location on first load
        if (mapRef.current) {
          mapRef.current.flyTo([position.coords.latitude, position.coords.longitude], 15, {
            duration: 2,
            easeLinearity: 0.25
          });
        }
      },
      (error) => {
        console.error('Location error:', error);
        let errorMessage = 'Unable to get location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout. Please try again.';
            break;
        }
        setLocationError(errorMessage);
        setIsTracking(false);
      },
      options
    );

    // Start watching position for real-time smooth updates
    const id = navigator.geolocation.watchPosition(
      (position) => {
        console.log('Position update:', position.coords);
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date()
        };
        setUserLocation(newLocation);
        setLocationAccuracy(position.coords.accuracy);
        setLastUpdate(new Date());
      },
      (error) => {
        console.error('Tracking error:', error);
        setLocationError(`Location tracking error: ${error.message}`);
      },
      {
        ...options,
        timeout: 10000 // Shorter timeout for updates
      }
    );

    setWatchId(id);
  };

  const stopLocationTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setLastUpdate(null);
    setLocationError(null);
    console.log('Location tracking stopped');
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      console.log('Centering map on user location:', userLocation);
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    } else if (!userLocation) {
      setLocationError('No location data available. Please enable location tracking first.');
    }
  };

  // Auto-start location tracking on component mount (but don't auto-restart)
  useEffect(() => {
    let mounted = true;
    
    // Only auto-start if not already tracking and no error
    const timer = setTimeout(() => {
      if (mounted && !isTracking && !locationError) {
        startLocationTracking();
      }
    }, 1000); // Delay to ensure component is fully mounted
    
    // Cleanup on unmount
    return () => {
      mounted = false;
      clearTimeout(timer);
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter incidents
  const filteredIncidents = incidents.filter(
    i => selectedFilter === "all" || i.type === selectedFilter
  );

  // Loading and error states for UI
  const [loading] = useState(false);
  const [error] = useState(null);

  // Get marker color based on incident type and severity
  const getMarkerColor = (type, severity) => {
    const colors = {
      theft: severity === "high" ? "#dc2626" : "#f59e0b",
      vandalism: "#10b981",
      assault: "#dc2626",
      drug: "#7c3aed",
    };
    return colors[type] || "#6b7280";
  };

  // Get type abbreviation for marker
  const getTypeAbbrev = (type) => {
    const abbrevs = {
      theft: "T",
      vandalism: "V", 
      assault: "A",
      drug: "D",
    };
    return abbrevs[type] || "?";
  };

  // Map center - will use user location if available, otherwise default
  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : [19.0760, 72.8777];

  return (
    <div className="min-h-screen bg-[#ffffff] text-gray-900">
      <TricolorBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <style>{`
          /* Ensure map doesn't interfere with navbar */
          .leaflet-container {
            z-index: 1 !important;
          }
          .leaflet-control-container {
            z-index: 2 !important;
          }
          .leaflet-popup {
            z-index: 3 !important;
          }
          /* Prevent map from blocking other interactions */
          .leaflet-container a {
            pointer-events: auto;
          }
        `}</style>
        {/* Header */}
        <motion.div
          className="mb-8"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <MapPin className="w-10 h-10 text-[var(--accent-color,#00C9A7)]" />
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-black tracking-tight"
                  style={{ color: GOV_BLUE }}
                >
                  Official Community Incident Map
                </h1>
                <span className="text-sm lg:text-base text-gray-700">
                  Real-time map view of local incident reports
                </span>
              </div>
            </div>

            {/* Location Controls - Responsive */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              {/* Location Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">
                  {isTracking ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live Tracking
                    </span>
                  ) : (
                    "Location Off"
                  )}
                </span>
              </div>

              {/* Location Actions */}
              <div className="flex gap-2">
                {!isTracking ? (
                  <button
                    onClick={startLocationTracking}
                    disabled={isTracking}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:inline">Start Tracking</span>
                    <span className="sm:hidden">Track</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={centerOnUserLocation}
                      disabled={!userLocation}
                      className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      <span className="hidden lg:inline">Center Map</span>
                      <span className="lg:hidden">Center</span>
                    </button>
                    <button
                      onClick={stopLocationTracking}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <span>Stop</span>
                    </button>
                  </>
                )}
              </div>

              {/* Location Error Display */}
              {locationError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-100 border border-red-300 rounded-lg max-w-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-xs lg:text-sm text-red-700">{locationError}</span>
                </div>
              )}

              {/* Location Info Panel */}
              {userLocation && (
                <div className="hidden xl:flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-600">
                  <span>Lat: {userLocation.lat.toFixed(4)}</span>
                  <span>•</span>
                  <span>Lng: {userLocation.lng.toFixed(4)}</span>
                  {locationAccuracy && (
                    <>
                      <span>•</span>
                      <span>±{Math.round(locationAccuracy)}m</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* MAIN GRID - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
          {/* Sidebar - Mobile: full width, Desktop: sidebar */}
          <aside className="lg:col-span-3 xl:col-span-2">
            {/* Filters card */}
            <section className="mb-4 lg:mb-8 bg-white rounded-2xl border border-blue-100 shadow-md p-4 lg:p-5">
              <div className="flex items-center mb-4 gap-2">
                <Filter className="w-5 h-5 text-blue-800" />
                <h2 className="font-bold text-base lg:text-lg" style={{ color: GOV_BLUE }}>
                  Incident Type
                </h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSelectedFilter(f.value)}
                    className={`flex justify-between items-center w-full px-3 py-2 rounded-lg transition-colors font-medium text-left text-sm lg:text-base
                      ${
                        selectedFilter === f.value
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-900 hover:bg-blue-100"
                      }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full 
                        ${
                          selectedFilter === f.value
                            ? "bg-blue-500"
                            : "bg-blue-200 text-blue-800"
                        }`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Time filters */}
            <section className="mb-4 lg:mb-8 bg-white rounded-2xl border border-blue-100 shadow-md p-4 lg:p-5">
              <div className="flex items-center mb-4 gap-2">
                <Calendar className="w-5 h-5 text-blue-800" />
                <h2 className="font-bold text-base lg:text-lg" style={{ color: GOV_BLUE }}>
                  Time Range
                </h2>
              </div>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                {TIME_FILTERS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTimeFilter(t.value)}
                    className={`w-full px-3 py-2 rounded-lg transition-colors font-medium text-left text-sm lg:text-base
                      ${
                        timeFilter === t.value
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-900 hover:bg-blue-100"
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Statistics */}
            <section className="bg-white rounded-2xl border border-blue-100 shadow-md p-4 lg:p-5">
              <div className="flex items-center mb-4 gap-2">
                <BarChart3 className="w-5 h-5 text-blue-800" />
                <h2 className="font-bold text-base lg:text-lg" style={{ color: GOV_BLUE }}>
                  Quick Stats
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Incidents</span>
                  <span className="font-bold text-blue-900">
                    {filteredIncidents.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">High Priority</span>
                  <span className="font-bold text-red-600">
                    {filteredIncidents.filter((i) => i.severity === "high").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last 24hrs</span>
                  <span className="font-bold text-orange-600">3</span>
                </div>
              </div>
            </section>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 xl:col-span-10">
            {/* Map container */}
            <motion.section
              className="bg-white rounded-2xl border border-blue-100 shadow-md overflow-hidden"
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <div className="p-5 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-800" />
                    <h2 className="font-bold text-lg" style={{ color: GOV_BLUE }}>
                      Live Incident Map
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live Updates</span>
                  </div>
                </div>
              </div>

              {/* Real Interactive Map - Responsive */}
              <div className="relative" style={{ height: "400px", width: "100%" }} data-map-container>
                <style>{`
                  @media (min-width: 640px) {
                    [data-map-container] {
                      height: 500px !important;
                    }
                  }
                  @media (min-width: 1024px) {
                    [data-map-container] {
                      height: 600px !important;
                    }
                  }
                  .leaflet-container {
                    z-index: 1;
                  }
                  .leaflet-control-container {
                    z-index: 2;
                  }
                `}</style>
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                  zoomControl={true}
                  attributionControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Location updater component */}
                  <LocationUpdater userLocation={userLocation} mapRef={mapRef} />
                  
                  {/* User location marker */}
                  {userLocation && (
                    <>
                      <Marker 
                        position={[userLocation.lat, userLocation.lng]} 
                        icon={userLocationIcon}
                      >
                        <Popup>
                          <div className="text-center">
                            <strong>Your Location</strong>
                            <br />
                            <small>
                              Lat: {userLocation.lat.toFixed(4)}<br />
                              Lng: {userLocation.lng.toFixed(4)}
                              {locationAccuracy && (
                                <><br />Accuracy: ±{Math.round(locationAccuracy)}m</>
                              )}
                            </small>
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Accuracy circle */}
                      {locationAccuracy && (
                        <Circle
                          center={[userLocation.lat, userLocation.lng]}
                          radius={locationAccuracy}
                          pathOptions={{
                            color: '#3b82f6',
                            fillColor: '#3b82f6',
                            fillOpacity: 0.1,
                            weight: 1
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* Incident markers */}
                  {!loading && !error && incidents.filter(
                    i => selectedFilter === "all" || i.type === selectedFilter
                  ).map((incident) => (
                    <Marker
                      key={incident.id}
                      position={[incident.lat, incident.lng]}
                      icon={createCustomIcon(
                        getMarkerColor(incident.type, incident.severity),
                        getTypeAbbrev(incident.type)
                      )}
                    >
                      <Popup>
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-3 h-3 rounded-full ${
                              incident.severity === 'high' ? 'bg-red-500' :
                              incident.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></span>
                            <strong className="capitalize">{incident.type}</strong>
                          </div>
                          <p className="text-sm mb-1">{incident.description}</p>
                          <div className="text-xs text-gray-600">
                            <div>📍 {incident.location}</div>
                            <div>🕒 {incident.time}</div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Map footer with controls */}
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>High Priority</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Medium Priority</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Low Priority</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Your Location</span>
                    </div>
                  </div>
                  <div>
                    {filteredIncidents.length} incidents shown • Last updated: just now
                  </div>
                </div>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading incidents...</p>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="p-8 text-center text-red-600">
                  {error}
                </div>
              )}
            </motion.section>

            {/* Incident list */}
            <motion.section
              className="mt-8 bg-white rounded-2xl border border-blue-100 shadow-md p-6"
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-800" />
                  <h2 className="font-bold text-lg" style={{ color: GOV_BLUE }}>
                    Recent Incidents ({filteredIncidents.length})
                  </h2>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg transition-colors">
                  <span>View All</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                animate="animate"
              >
                {filteredIncidents.slice(0, 5).map((incident) => (
                  <motion.div
                    key={incident.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    variants={staggerItem}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          incident.severity === "high"
                            ? "bg-red-500"
                            : incident.severity === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {incident.type} - {incident.location}
                        </div>
                        <div className="text-sm text-gray-600">
                          {incident.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{incident.time}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {incident.severity} priority
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          </main>
        </div>

        {/* Page footer */}
        <footer className="mt-12 text-sm text-gray-500 text-center">
          Crimeta Portal © {new Date().getFullYear()} | Official Government Service
        </footer>
      </div>
    </div>
  );
};

export default MapView;
