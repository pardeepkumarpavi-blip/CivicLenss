import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api.js';
import PublicMap from '../components/map/PublicMap.jsx';
import StatusBadge from '../components/reports/StatusBadge.jsx';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Filter,
  Search,
  Eye,
  ShieldCheck,
  Calendar,
  Layers,
  Loader2,
  RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  'all',
  'Waste Management',
  'Drainage and Flooding',
  'Water Leakage',
  'Road Damage',
  'Streetlight',
  'Air Pollution',
  'Environmental Hazard',
  'Other Municipal Issue'
];

const STATUSES = ['all', 'Submitted', 'Assigned', 'In Progress', 'Awaiting Verification', 'Resolved'];

export default function PublicMapPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getPublicReports({
        category: selectedCategory,
        status: selectedStatus,
        search: searchQuery,
        limit: 150
      });
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      console.error('Error fetching public reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Public Geospatial Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Karachi Civic & Environmental Incident Map
          </h1>
          <p className="text-xs text-slate-500">
            Real-time verified civic issues reported across Karachi Metropolitan Area
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <Link
            to="/report"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            Report Incident
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference ID (e.g. CL-2026-00001), road name, or description..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              {STATUSES.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-semibold hover:bg-navy-800 transition"
            >
              Filter
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>Displaying <strong>{reports.length}</strong> active complaint records</span>
          <span className="flex items-center gap-1 text-teal-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Citizen identity protected by data privacy controls
          </span>
        </div>
      </div>

      {/* Map & Side List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="h-[600px] rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 space-y-2 flex-col">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-xs">Loading map markers...</p>
            </div>
          ) : (
            <PublicMap reports={reports} height="600px" />
          )}
        </div>

        {/* Side List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 h-[600px] flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
              Report Index
            </h3>
            <span className="text-[10px] text-slate-400">{reports.length} items</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 space-y-2">
            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10 italic">
                No reports matching the selected filters.
              </p>
            ) : (
              reports.map((report) => (
                <Link
                  key={report._id || report.referenceId}
                  to={`/reports/${report.referenceId}`}
                  className="block p-2.5 rounded-xl hover:bg-slate-50 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-navy-900">
                      {report.referenceId}
                    </span>
                    <StatusBadge status={report.status} size="sm" />
                  </div>
                  <p className="text-xs font-semibold text-teal-800 line-clamp-1">
                    {report.issueCategory}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-300" />
                      {report.area}
                    </span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
