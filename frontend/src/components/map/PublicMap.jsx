import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from '../reports/StatusBadge.jsx';
import { Eye, MapPin } from 'lucide-react';

const createCategoryIcon = (category) => {
  let color = '#008DDA';
  if (category === 'Waste Management') color = '#F59E0B';
  if (category === 'Drainage and Flooding') color = '#0284C7';
  if (category === 'Water Leakage') color = '#06B6D4';
  if (category === 'Road Damage') color = '#EF4444';
  if (category === 'Streetlight') color = '#EAB308';
  if (category === 'Air Pollution') color = '#64748B';
  if (category === 'Environmental Hazard') color = '#10B981';

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

export default function PublicMap({ reports = [], height = '550px' }) {
  // Center on Karachi
  const defaultCenter = [24.8607, 67.0011];

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md relative">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((report) => {
          if (!report.location || !report.location.coordinates || report.location.coordinates.length < 2) {
            return null;
          }
          // Coordinates in GeoJSON are [longitude, latitude]
          const lat = report.location.coordinates[1];
          const lng = report.location.coordinates[0];

          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={report._id || report.referenceId}
              position={[lat, lng]}
              icon={createCategoryIcon(report.issueCategory)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="w-64 p-3 font-sans">
                  {report.imageUrl && (
                    <div className="h-28 w-full mb-2 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={report.imageUrl}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-navy-900">
                      {report.referenceId}
                    </span>
                    <StatusBadge status={report.status} size="sm" />
                  </div>

                  <p className="text-xs font-semibold text-teal-800 mb-1">
                    {report.issueCategory}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                    {report.description}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-3">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{report.area}, {report.city}</span>
                  </div>

                  <Link
                    to={`/reports/${report.referenceId}`}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-medium transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Complaint Record
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
