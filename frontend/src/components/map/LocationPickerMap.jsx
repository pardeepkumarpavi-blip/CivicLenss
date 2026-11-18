import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin, Loader2 } from 'lucide-react';

// Custom SVG Leaflet Icon for reliable display in Vite
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks and sync position
function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Component to recenter map view programmatically
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function LocationPickerMap({
  initialLat = 24.8607,
  initialLng = 67.0011,
  onLocationChange
}) {
  const [position, setPosition] = useState([initialLat, initialLng]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const markerRef = useRef(null);

  const handleSelect = (lat, lng) => {
    setPosition([lat, lng]);
    if (onLocationChange) {
      onLocationChange({ lat, lng });
    }
  };

  const handleDragEnd = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const latlng = marker.getLatLng();
      handleSelect(latlng.lat, latlng.lng);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        handleSelect(latitude, longitude);
        setGeoLoading(false);
      },
      (err) => {
        console.warn('Geolocation permission denied or timed out:', err);
        setGeoError('Could not acquire your current location. Please tap directly on the map.');
        setGeoLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          Click on map or drag pin to pinpoint exact location
        </span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold border border-teal-200 transition"
        >
          {geoLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5" />
          )}
          Use Current GPS Location
        </button>
      </div>

      {geoError && (
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
          {geoError}
        </p>
      )}

      <div className="h-64 sm:h-80 w-full rounded-xl overflow-hidden border border-slate-300 relative shadow-inner">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={position} />
          <ClickHandler onSelect={handleSelect} />
          <Marker
            draggable={true}
            eventHandlers={{ dragend: handleDragEnd }}
            position={position}
            ref={markerRef}
            icon={customMarkerIcon}
          />
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg font-mono">
        <span>Latitude: {position[0].toFixed(5)}</span>
        <span>Longitude: {position[1].toFixed(5)}</span>
      </div>
    </div>
  );
}
