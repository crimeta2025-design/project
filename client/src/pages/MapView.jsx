import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, AlertTriangle } from "lucide-react";

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker for user location
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="
      width: 20px; height: 20px; 
      background: #3b82f6; 
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(59,130,246,0.5);
    ">
    </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export default function MapView() {
  const mapRef = useRef();

  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Dummy incidents (replace with API)
  const [incidents, setIncidents] = useState([
    { id: 1, type: "theft", lat: 19.0760, lng: 72.8777, description: "Bike theft" },
    { id: 2, type: "assault", lat: 19.0740, lng: 72.8730, description: "Fight reported" }
  ]);

  // Get user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      setMapReady(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newLocation);
        setMapReady(true);

        // Auto-center to user location
        if (mapRef.current) {
          mapRef.current.flyTo([newLocation.lat, newLocation.lng], 17, {
            duration: 1.5,
          });
        }
      },
      (error) => {
        console.error("Location error:", error);
        setLocationError("Unable to fetch location");
        setMapReady(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <motion.div className="p-4 font-bold text-xl flex items-center gap-2">
        <MapPin className="w-6 h-6 text-blue-600" /> Live Crime Map
      </motion.div>

      {!mapReady ? (
        <div className="flex items-center justify-center h-64">Loading Map...</div>
      ) : (
        <div style={{ height: "500px", width: "100%" }}>
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : [19.0760, 72.8777]}
            zoom={17}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(map) => (mapRef.current = map)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location Marker */}
            {userLocation && (
              <>
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                  <Popup>
                    <strong>Your Location</strong>
                    <br />
                    Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                  </Popup>
                </Marker>
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={50}
                  pathOptions={{ color: '#3b82f6', fillOpacity: 0.1 }}
                />
              </>
            )}

            {/* Incident markers */}
            {incidents.map((incident) => (
              <Marker key={incident.id} position={[incident.lat, incident.lng]}>
                <Popup>
                  <strong>{incident.type.toUpperCase()}</strong>
                  <br />
                  {incident.description}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {locationError && (
        <div className="text-red-600 text-center mt-2">{locationError}</div>
      )}
    </div>
  );
}
