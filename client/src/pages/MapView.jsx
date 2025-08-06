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
  Navigation,
  Target,
  Layers
} from "lucide-react";

// Fix for default Leaflet marker icons
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

// Enhanced user location marker with pulsing effect
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

// Component to handle map view changes
const MapViewController = ({ mapView }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && map.eachLayer) {
      // Remove all tile layers
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      // Add the appropriate layer based on mapView
      let tileLayer;
      switch (mapView) {
        case "satellite":
          tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          });
          break;
        case "hybrid": {
          // Add satellite layer
          tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          });
          tileLayer.addTo(map);
          // Add labels layer on top
          const labelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            opacity: 0.8
          });
          labelsLayer.addTo(map);
          return; // Don't add tileLayer again below
        }
        case "terrain":
          tileLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          });
          break;
        default: // street
          tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          });
          break;
      }
      
      if (tileLayer) {
        tileLayer.addTo(map);
      }
    }
  }, [map, mapView]);

  return null;
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Government color scheme
const GOV_BLUE = "#1e3a8a";
const ACCENT_COLOR = "#00C9A7";

// Filters configuration
const FILTERS = [
  { value: "all", label: "All Incidents", count: 2 },
  { value: "theft", label: "Theft", count: 1 },
  { value: "assault", label: "Assault", count: 1 },
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

export default function MapView() {
  // ------------ Enhanced state management -----------
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("week");
  const [mapView, setMapView] = useState("street"); // Add map view state
  const mapRef = useRef();

  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  // Enhanced incidents data with more details
  const [incidents] = useState([
    { 
      id: 1, 
      type: "theft", 
      lat: 21.1458, 
      lng: 79.0882, 
      severity: "medium",
      time: "2 hours ago",
      location: "Vidhya Nagar",
      description: "Bike theft reported near residential complex"
    },
    { 
      id: 2, 
      type: "assault", 
      lat: 21.1434, 
      lng: 79.0855, 
      severity: "high",
      time: "6 hours ago",
      location: "Main Road",
      description: "Physical altercation reported"
    }
  ]);

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
      timeout: 20000, // Longer timeout for better GPS lock
      maximumAge: 0 // Force fresh location, no cache
    };

    console.log('Starting location tracking with high accuracy...');

    // Get initial position with better error handling and multiple attempts
    let initialAttempts = 0;
    const maxInitialAttempts = 2;

    const getInitialPosition = () => {
      initialAttempts++;
      console.log(`Initial position attempt ${initialAttempts}/${maxInitialAttempts}`);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Initial position obtained:', position.coords);
          console.log(`GPS Accuracy: ±${Math.round(position.coords.accuracy)}m`);
          
          // Log detailed location info for debugging
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log(`Precise coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          
          // Check if we're in expected Nagpur area
          const isInNagpur = lat > 21.0 && lat < 21.3 && lng > 79.0 && lng < 79.3;
          console.log(`Location appears to be in Nagpur area: ${isInNagpur}`);
          
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setLocationAccuracy(position.coords.accuracy);
          setMapReady(true);
          
          // Fly to user location with higher zoom for precise view
          if (mapRef.current) {
            mapRef.current.flyTo([position.coords.latitude, position.coords.longitude], 17, {
              duration: 2,
            });
          }
        },
        (error) => {
          console.error(`Location error on attempt ${initialAttempts}:`, error);
          if (initialAttempts < maxInitialAttempts) {
            console.log('Retrying location in 3 seconds...');
            setTimeout(getInitialPosition, 3000);
          } else {
            let errorMessage = 'Unable to get location';
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location services and refresh the page.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location unavailable. Move to an open area with good GPS signal.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location timeout. Check GPS/network and try the refresh button.';
                break;
            }
            setLocationError(errorMessage);
            setIsTracking(false);
            setMapReady(true);
          }
        },
        options
      );
    };

    getInitialPosition();

    // Start watching position for real-time updates
    const id = navigator.geolocation.watchPosition(
      (position) => {
        console.log('Position update:', position.coords);
        console.log(`Updated accuracy: ±${Math.round(position.coords.accuracy)}m`);
        
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newLocation);
        setLocationAccuracy(position.coords.accuracy);
      },
      (error) => {
        console.error('Tracking error:', error);
        setLocationError(`Location tracking error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000
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
    setLocationError(null);
    console.log('Location tracking stopped');
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      console.log('Centering map on user location:', userLocation);
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 17, {
        duration: 1.5,
      });
    } else if (!userLocation) {
      setLocationError('No location data available. Please enable location tracking first.');
    }
  };

  // Filter incidents
  const filteredIncidents = incidents.filter(
    i => selectedFilter === "all" || i.type === selectedFilter
  );

  // Get marker color based on incident type and severity
  const getMarkerColor = (type, severity) => {
    const colors = {
      theft: severity === "high" ? "#dc2626" : "#f59e0b",
      assault: "#dc2626",
    };
    return colors[type] || "#6b7280";
  };

  // Get type abbreviation for marker
  const getTypeAbbrev = (type) => {
    const abbrevs = {
      theft: "T",
      assault: "A",
    };
    return abbrevs[type] || "?";
  };

  // Get user location on mount
  useEffect(() => {
    let mounted = true;
    
    // Auto-start location tracking
    const timer = setTimeout(() => {
      if (mounted && !isTracking && !locationError) {
        startLocationTracking();
      }
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      mounted = false;
      clearTimeout(timer);
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-screen bg-[#ffffff] text-gray-900 flex flex-col">
      <TricolorBar />
      
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4">
        <motion.div
          className="mb-4"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <MapPin className="w-8 h-8 lg:w-10 lg:h-10 text-[var(--accent-color,#00C9A7)]" />
              <div>
                <h1
                  className="text-xl lg:text-2xl xl:text-3xl font-black tracking-tight"
                  style={{ color: GOV_BLUE }}
                >
                  Official Community Incident Map
                </h1>
                <span className="text-xs lg:text-sm text-gray-700">
                  Real-time map view of local incident reports
                </span>
              </div>
            </div>

            {/* Location Controls - Responsive with consistent button sizes */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Location Status Indicator */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg">
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

              {/* Location Actions - Consistent button sizes */}
              <div className="flex gap-2">
                {!isTracking ? (
                  <button
                    onClick={startLocationTracking}
                    disabled={isTracking}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Start Tracking</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={centerOnUserLocation}
                      disabled={!userLocation}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors font-medium"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Center Map</span>
                    </button>
                    <button
                      onClick={stopLocationTracking}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <span>Stop</span>
                    </button>
                  </>
                )}
              </div>

              {/* Location Error Display */}
              {locationError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-100 border border-red-300 rounded-lg max-w-md">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700">{locationError}</span>
                </div>
              )}

              {/* Location Accuracy Tips */}
              {isTracking && locationAccuracy && locationAccuracy > 50 && (
                <div className="flex items-center gap-2 px-4 py-3 bg-yellow-100 border border-yellow-300 rounded-lg max-w-md">
                  <Target className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <span className="text-sm text-yellow-700">
                    GPS accuracy: ±{Math.round(locationAccuracy)}m. Move outdoors for better precision.
                  </span>
                </div>
              )}

              {/* Location Info Panel */}
              {userLocation && (
                <div className="hidden xl:flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600">
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
      </div>

      {/* Main Content - Takes remaining height */}
      <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-4">
        <div className="h-full flex gap-4">
          {/* Sidebar - Collapsible on mobile */}
          <aside className="hidden lg:flex lg:w-80 xl:w-96 flex-col gap-4 overflow-y-auto">
            {/* Filters card */}
            <section className="bg-white rounded-2xl border border-blue-100 shadow-md p-4">
              <div className="flex items-center mb-4 gap-2">
                <Filter className="w-5 h-5 text-blue-800" />
                <h2 className="font-bold text-lg" style={{ color: GOV_BLUE }}>
                  Incident Type
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSelectedFilter(f.value)}
                    className={`flex justify-between items-center w-full px-4 py-3 rounded-lg transition-colors font-medium text-left
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
            <section className="bg-white rounded-2xl border border-blue-100 shadow-md p-4">
              <div className="flex items-center mb-4 gap-2">
                <Calendar className="w-5 h-5 text-blue-800" />
                <h2 className="font-bold text-lg" style={{ color: GOV_BLUE }}>
                  Time Range
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {TIME_FILTERS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTimeFilter(t.value)}
                    className={`w-full px-4 py-3 rounded-lg transition-colors font-medium text-left
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
            <section className="bg-white rounded-2xl border border-blue-100 shadow-md p-4">
              <div className="flex items-center mb-4 gap-2">
                <BarChart3 className="w-5 h-5 text-blue-800" />
                <h2 className="font-bold text-lg" style={{ color: GOV_BLUE }}>
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
                  <span className="font-bold text-orange-600">2</span>
                </div>
              </div>
            </section>
          </aside>

          {/* Main Map Area - Takes remaining space */}
          <main className="flex-1 flex flex-col">
            {/* Map container - Full height */}
            <motion.section
              className="flex-1 bg-white rounded-2xl border border-blue-100 shadow-md overflow-hidden flex flex-col"
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <div className="flex-shrink-0 p-4 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-800" />
                    <h2 className="font-bold text-lg" style={{ color: GOV_BLUE }}>
                      Live Incident Map
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live Updates</span>
                    </div>
                    
                    {/* Map View Switcher */}
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-800" />
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setMapView("street")}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            mapView === "street"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Street
                        </button>
                        <button
                          onClick={() => setMapView("satellite")}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            mapView === "satellite"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Satellite
                        </button>
                        <button
                          onClick={() => setMapView("hybrid")}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            mapView === "hybrid"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Hybrid
                        </button>
                        <button
                          onClick={() => setMapView("terrain")}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            mapView === "terrain"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Terrain
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map takes all remaining space */}
              <div className="flex-1 relative">
                {!mapReady ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-4">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                      <p className="text-gray-600 text-lg">Loading Map...</p>
                    </div>
                  </div>
                ) : (
                  <MapContainer
                    center={userLocation ? [userLocation.lat, userLocation.lng] : [21.1458, 79.0882]}
                    zoom={17}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                    whenCreated={(map) => (mapRef.current = map)}
                  >
                    {/* Map View Controller - Handles programmatic layer switching */}
                    <MapViewController mapView={mapView} />

                    {/* Location updater component */}
                    <LocationUpdater userLocation={userLocation} mapRef={mapRef} />

                    {/* User Location Marker */}
                    {userLocation && (
                      <>
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                          <Popup>
                            <div className="text-center">
                              <strong>Your Location</strong>
                              <br />
                              <small>
                                Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                                {locationAccuracy && (
                                  <><br />Accuracy: ±{Math.round(locationAccuracy)}m</>
                                )}
                              </small>
                            </div>
                          </Popup>
                        </Marker>
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
                    {filteredIncidents.map((incident) => (
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
                )}
              </div>

              {/* Map footer with controls */}
              <div className="flex-shrink-0 p-3 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-600">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>High Priority</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Medium Priority</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Your Location</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {filteredIncidents.length} incidents shown • Last updated: just now
                  </div>
                </div>
              </div>
            </motion.section>
          </main>
        </div>
      </div>

      {/* Mobile Filters - Floating overlay */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSelectedFilter(f.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      selectedFilter === f.value
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-900 hover:bg-blue-100"
                    }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
