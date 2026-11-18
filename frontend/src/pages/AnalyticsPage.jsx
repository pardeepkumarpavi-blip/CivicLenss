import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';

const COLORS = ['#008DDA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B', '#0B192C'];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [trends, setTrends] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overRes, catRes, statRes, deptRes, trendRes, areaRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getCategories(),
        analyticsAPI.getStatus(),
        analyticsAPI.getDepartments(),
        analyticsAPI.getTrends(),
        analyticsAPI.getAreas()
      ]);

      if (overRes.data.success) setOverview(overRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data || []);
      if (statRes.data.success) setStatuses(statRes.data.data || []);
      if (deptRes.data.success) setDepartments(deptRes.data.data || []);
      if (trendRes.data.success) setTrends(trendRes.data.data || []);
      if (areaRes.data.success) setAreas(areaRes.data.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Municipal Operational Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Karachi Civic Data & Environmental Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Real metrics computed from actual MongoDB complaint records and status history
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto" />
          <p className="text-xs">Computing municipal intelligence metrics...</p>
        </div>
      ) : (
        <>
          {/* Key KPI Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Lodged Complaints</span>
              <p className="text-3xl font-black text-navy-900">{overview?.totalReports ?? 0}</p>
              <span className="text-[11px] text-slate-400">Database verified</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-emerald-600 font-medium">Verified Resolution Rate</span>
              <p className="text-3xl font-black text-emerald-700">{overview?.resolutionRate ?? 0}%</p>
              <span className="text-[11px] text-slate-400">Confirmed by citizens</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-amber-600 font-medium">Active Municipal Workload</span>
              <p className="text-3xl font-black text-amber-700">{overview?.pendingReports ?? 0}</p>
              <span className="text-[11px] text-slate-400">Under review / in progress</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-teal-600 font-medium">Avg. Resolution Duration</span>
              <p className="text-3xl font-black text-teal-700">
                {overview?.avgResolutionHours ? `${overview.avgResolutionHours} hrs` : 'N/A'}
              </p>
              <span className="text-[11px] text-slate-400">Calculated from event timestamps</span>
            </div>
          </div>

          {/* Charts Row 1: Categories Bar Chart & Status Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  Complaints by Category (Total vs Resolved)
                </h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="category"
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                    <Bar dataKey="total" name="Total Lodged" fill="#008DDA" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-teal-600" />
                Status Distribution
              </h3>
              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statuses.filter((s) => s.count > 0)}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {statuses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Inflow Trend & Department Workload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                Monthly Complaint Inflow & Resolution Trend
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                    <Area type="monotone" dataKey="total" name="Complaints Lodged" stroke="#008DDA" fill="#008DDA" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="resolved" name="Complaints Resolved" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                Departmental Caseload & Resolution
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departments} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                    <Bar dataKey="total" name="Total Assigned" fill="#2C4E80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Reported Areas Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              Frequently Reported Municipal Areas in Karachi
            </h3>
            {areas.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No area-specific complaints logged yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {areas.map((area, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-xs truncate">{area.area}</span>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {area.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
