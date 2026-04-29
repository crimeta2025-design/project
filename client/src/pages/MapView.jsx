import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import {
  MapPin,
  BarChart3,
  AlertTriangle,
  Navigation,
  Target,
  Layers,
  Shield
} from "lucide-react";

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Heatmap Layer component
const HeatmapLayer = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || points.length === 0) return;
    
    let heatLayer = null;
    
    try {
      // Remove any existing heatmap layers
      map.eachLayer((layer) => {
        if (layer._heat || (layer.options && layer.options.renderer === 'heatmap')) {
          map.removeLayer(layer);
        }
      });
      
      // Check if L.heatLayer is available
      if (typeof L.heatLayer === 'function' && points.length > 0) {
        console.log('Creating heatmap with points:', points);
        heatLayer = L.heatLayer(points, {
          radius: 50,
          blur: 35,
          maxZoom: 18,
          minOpacity: 0.4,
          maxOpacity: 0.9,
          gradient: {
            0.0: '#00ff00',  // Green for low intensity
            0.2: '#80ff00',
            0.4: '#ffff00',  // Yellow 
            0.6: '#ff8000',  // Orange
            0.8: '#ff4000',  // Red-orange
            1.0: '#ff0000',  // Red for high intensity
          },
        });
        heatLayer.addTo(map);
        console.log('Heatmap layer added successfully');
      } else {
        console.error('L.heatLayer is not available. Make sure leaflet.heat is properly loaded.');
      }
    } catch (error) {
      console.error('Error creating heatmap:', error);
    }
    
    // Cleanup function
    return () => {
      if (heatLayer && map.hasLayer && map.hasLayer(heatLayer)) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points]);
  
  return null;
};

// Component for category symbols overlay on heatmap
const CategorySymbolsLayer = ({ incidents }) => {
  const getCategorySymbol = (type) => {
    const symbols = {
      theft: '🔓',
      assault: '👊',
      burglary: '🏠',
      vandalism: '🔨',
      fraud: '💳',
      robbery: '💰',
      harassment: '⚠️',
      'drug-related': '💊',
      violence: '⚡',
      cybercrime: '💻'
    };
    return symbols[type] || '📍';
  };

  const getCategoryColor = (type) => {
    const colors = {
      theft: '#FF6B6B',
      assault: '#FF8E53',
      burglary: '#FF6B9D',
      vandalism: '#845EC2',
      fraud: '#4E8397',
      robbery: '#B39BC8',
      harassment: '#F9CA24',
      'drug-related': '#6C5CE7',
      violence: '#A0E7E5',
      cybercrime: '#FD79A8'
    };
    return colors[type] || '#747d8c';
  };

  return (
    <>
      {incidents.map((incident) => {
        const symbol = getCategorySymbol(incident.type);
        const color = getCategoryColor(incident.type);
        
        const customIcon = L.divIcon({
          html: `
            <div style="
              background: ${color};
              color: white;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${symbol}
            </div>
          `,
          className: 'custom-category-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        return (
          <Marker
            key={`symbol-${incident.id}`}
            position={[incident.lat, incident.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: incident.severity === 'high' ? '#ef4444' :
                                     incident.severity === 'medium' ? '#eab308' : '#22c55e'
                  }}></span>
                  <strong className="capitalize">{incident.type}</strong>
                  <span>{symbol}</span>
                </div>
                <p className="text-sm mb-1">{incident.description}</p>
                <div className="text-xs text-gray-600">
                  <div>📍 {incident.location}</div>
                  <div>🕒 {incident.time}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
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

// (Animations removed)

// Government color scheme
const GOV_BLUE = "#1e3a8a";
const ACCENT_COLOR = "#00C9A7";

// (Removed filters/time filters per user request)



export default function MapView() {
  // ------------ Enhanced state management -----------
  // Removed Incident Type & Time Range filters per user request
  const [mapView, setMapView] = useState("street"); // Add map view state
  const [showHeatmap, setShowHeatmap] = useState(true); // Add heatmap toggle state
  const mapRef = useRef();

  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  // Enhanced incidents data with more details for better heatmap visualization
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
    },
    { 
      id: 3, 
      type: "theft", 
      lat: 21.1465, 
      lng: 79.0875, 
      severity: "medium",
      time: "4 hours ago",
      location: "Central Avenue",
      description: "Phone snatching incident"
    },
    { 
      id: 4, 
      type: "vandalism", 
      lat: 21.1445, 
      lng: 79.0890, 
      severity: "low",
      time: "8 hours ago",
      location: "Park Area",
      description: "Property damage reported"
    },
    { 
      id: 5, 
      type: "theft", 
      lat: 21.1470, 
      lng: 79.0865, 
      severity: "high",
      time: "1 hour ago",
      location: "Shopping Complex",
      description: "Vehicle theft reported"
    },
    { 
      id: 6, 
      type: "assault", 
      lat: 21.1440, 
      lng: 79.0870, 
      severity: "high",
      time: "3 hours ago",
      location: "Residential Area",
      description: "Domestic violence incident"
    },
    { 
      id: 7, 
      type: "robbery", 
      lat: 21.1450, 
      lng: 79.0885, 
      severity: "high",
      time: "5 hours ago",
      location: "Market Street",
      description: "Armed robbery at local shop"
    },
    { 
      id: 8, 
      type: "theft", 
      lat: 21.1460, 
      lng: 79.0878, 
      severity: "medium",
      time: "7 hours ago",
      location: "Bus Stop",
      description: "Purse snatching incident"
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
  // Without filters all incidents are shown
  const filteredIncidents = incidents;

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
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pb-4 pt-6">
      
      {/* Header - Fixed height */}
  <div className="hidden md:block flex-shrink-0 px-4 sm:px-6 mb-4">
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-[1.5rem] bg-indigo-50 text-indigo-600 border border-indigo-100">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Live Incident Map
                </h1>
                <p className="font-bold text-[11px] tracking-wider uppercase text-slate-500 mt-1">
                  Real-time map view of local incident reports
                </p>
              </div>
            </div>

            {/* Location Controls - Responsive with consistent button sizes */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Location Status Indicator */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                <MapPin className={`w-4 h-4 ${isTracking ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  {isTracking ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
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
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl transition-all shadow-sm hover:shadow font-bold text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Start Tracking</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={centerOnUserLocation}
                      disabled={!userLocation}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl transition-all shadow-sm hover:shadow font-bold text-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Center Map</span>
                    </button>
                    <button
                      onClick={stopLocationTracking}
                      className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow-sm hover:shadow font-bold text-sm"
                    >
                      <span>Stop</span>
                    </button>
                  </>
                )}
              </div>

              {/* Location Error Display */}
              {locationError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl max-w-md shadow-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="text-[11px] font-bold text-rose-700">{locationError}</span>
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
  </div>
      </div>

      {/* Main Content - Takes remaining height */}
      <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-4">
        <div className="h-full flex gap-4">
          {/* Sidebar - Collapsible on mobile (filters removed) */}
          <aside className="hidden lg:flex lg:w-80 xl:w-96 flex-col gap-6 overflow-y-auto pb-4">
            {/* Statistics (kept) */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80"></div>
              <div className="flex items-center mb-6 gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h2 className="font-black tracking-tight text-xl text-slate-900">
                  Quick Stats
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Total Incidents</span>
                  <span className="font-black text-xl text-indigo-600">
                    {filteredIncidents.length}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">High Priority</span>
                  <span className="font-black text-xl text-rose-500">
                    {filteredIncidents.filter((i) => i.severity === "high").length}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Last 24hrs</span>
                  <span className="font-black text-xl text-amber-500">8</span>
                </div>
              </div>
            </section>

            {/* Category Legend - Show always */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden flex-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80"></div>
              <div className="flex items-center mb-6 gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="font-black tracking-tight text-xl text-slate-900">
                  Legend
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span>🔓</span><span>Theft</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👊</span><span>Assault</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏠</span><span>Burglary</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔨</span><span>Vandalism</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💳</span><span>Fraud</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💰</span><span>Robbery</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚠️</span><span>Harassment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💊</span><span>Drug-related</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚡</span><span>Violence</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💻</span><span>Cybercrime</span>
                </div>
              </div>
            </section>
          </aside>

          {/* Main Map Area - Takes remaining space */}
          <main className="flex-1 flex flex-col">
            {/* Map container - Full height */}
            <section
              className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 z-10"></div>
              <div className="flex-shrink-0 p-5 border-b border-slate-100 z-10 bg-white/80 backdrop-blur-md">
                {/* Desktop Header */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-black text-lg text-slate-900 tracking-tight leading-tight">
                        Map View
                      </h2>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Live Connection</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <Layers className="w-4 h-4 text-slate-400 ml-1.5" />
                      <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        {['street','satellite','hybrid','terrain'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => setMapView(opt)}
                            className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg flex-shrink-0 transition-all whitespace-nowrap ${mapView === opt ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowHeatmap(h=>!h)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap shadow-sm border ${showHeatmap ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${showHeatmap ? 'bg-rose-500' : 'bg-slate-300'}`}></div>
                      {showHeatmap ? 'Heatmap ON' : 'Heatmap OFF'}
                    </button>
                  </div>
                </div>
                {/* Mobile Header */}
                <div className="sm:hidden flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow">
                        <Shield className="w-3.5 h-3.5 text-white" />
                      </div>
                      <h2 className="font-bold text-sm" style={{ color: GOV_BLUE }}>
                        Live Map
                      </h2>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={mapView}
                      onChange={e=>setMapView(e.target.value)}
                      className="flex-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="street">Street</option>
                      <option value="satellite">Satellite</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="terrain">Terrain</option>
                    </select>
                    <button
                      onClick={()=>setShowHeatmap(h=>!h)}
                      className={`px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap ${showHeatmap ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {showHeatmap ? 'Heatmap ON' : 'Heatmap OFF'}
                    </button>
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
                    {/* Heatmap overlay for incidents - Conditional rendering */}
                    {showHeatmap && (
                      <>
                        <HeatmapLayer
                          points={filteredIncidents.map((incident) => {
                            let intensity;
                            switch (incident.severity) {
                              case 'high':
                                intensity = 1.0;
                                break;
                              case 'medium':
                                intensity = 0.6;
                                break;
                              case 'low':
                                intensity = 0.3;
                                break;
                              default:
                                intensity = 0.5;
                            }
                            return [incident.lat, incident.lng, intensity];
                          })}
                        />
                        {/* Category symbols overlay on heatmap */}
                        <CategorySymbolsLayer incidents={filteredIncidents} />
                      </>
                    )}
                    
                    {/* Individual incident markers - Show when heatmap is off */}
                    {!showHeatmap && filteredIncidents.map((incident) => {
                      const getCategorySymbol = (type) => {
                        const symbols = {
                          theft: '🔓',
                          assault: '👊',
                          burglary: '🏠',
                          vandalism: '🔨',
                          fraud: '💳',
                          robbery: '💰',
                          harassment: '⚠️',
                          'drug-related': '💊',
                          violence: '⚡',
                          cybercrime: '💻'
                        };
                        return symbols[type] || '📍';
                      };

                      const getCategoryColor = (type) => {
                        const colors = {
                          theft: '#FF6B6B',
                          assault: '#FF8E53',
                          burglary: '#FF6B9D',
                          vandalism: '#845EC2',
                          fraud: '#4E8397',
                          robbery: '#B39BC8',
                          harassment: '#F9CA24',
                          'drug-related': '#6C5CE7',
                          violence: '#A0E7E5',
                          cybercrime: '#FD79A8'
                        };
                        return colors[type] || '#747d8c';
                      };

                      const symbol = getCategorySymbol(incident.type);
                      const color = getCategoryColor(incident.type);
                      
                      const customIcon = L.divIcon({
                        html: `
                          <div style="
                            background: ${color};
                            color: white;
                            border-radius: 50%;
                            width: 35px;
                            height: 35px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 16px;
                            border: 3px solid white;
                            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
                          ">
                            ${symbol}
                          </div>
                        `,
                        className: 'custom-category-icon',
                        iconSize: [35, 35],
                        iconAnchor: [17.5, 17.5]
                      });

                      return (
                        <Marker
                          key={incident.id}
                          position={[incident.lat, incident.lng]}
                          icon={customIcon}
                        >
                          <Popup>
                            <div className="p-2">
                              <div className="flex items-center gap-2 mb-2">
                                <span style={{
                                  display: 'inline-block',
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: incident.severity === 'high' ? '#ef4444' :
                                                   incident.severity === 'medium' ? '#eab308' : '#22c55e'
                                }}></span>
                                <strong className="capitalize">{incident.type}</strong>
                                <span>{symbol}</span>
                              </div>
                              <p className="text-sm mb-1">{incident.description}</p>
                              <div className="text-xs text-gray-600">
                                <div>📍 {incident.location}</div>
                                <div>🕒 {incident.time}</div>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                )}
                {/* Mobile floating controls */}
                <div className="sm:hidden absolute bottom-24 right-4 flex flex-col gap-3 z-[9500]">
                  {isTracking && userLocation && (
                    <button
                      onClick={centerOnUserLocation}
                      aria-label="Center on my location"
                      className="p-4 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)] ring-2 ring-white/70 active:scale-95 transition-all"
                    >
                      <Navigation className="w-5 h-5 drop-shadow" />
                    </button>
                  )}
                  {!isTracking && (
                    <button
                      onClick={startLocationTracking}
                      aria-label="Start location tracking"
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 text-white text-xs font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.35)] ring-2 ring-white/70 active:scale-95 tracking-wide"
                    >
                      Start GPS
                    </button>
                  )}
                </div>
              </div>

              {/* Map footer with controls */}
              <div className="flex-shrink-0 p-4 bg-slate-50 border-t border-slate-100 z-10 rounded-b-[2.5rem]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                      <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                      <span>High Priority</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span>Medium Priority</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span>Your Location</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-indigo-600">{filteredIncidents.length} incidents</span>
                    <span>•</span>
                    <span>Last updated: just now</span>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

  {/* Removed mobile filters overlay per user request */}
    </div>
  );
}
