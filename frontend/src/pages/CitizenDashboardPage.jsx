import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { reportAPI } from '../services/api.js';
import StatusBadge from '../components/reports/StatusBadge.jsx';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Eye,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
  Building2,
  Loader2
} from 'lucide-react';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        setLoading(true);
        const res = await reportAPI.getMyReports({ status: statusFilter, limit: 50 });
        if (res.data.success) {
          setReports(res.data.reports || []);
        }
      } catch (err) {
        console.error('Error fetching citizen reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, [statusFilter]);

  // Derive counts from reports
  const totalCount = reports.length;
  const pendingCount = reports.filter((r) =>
    ['Submitted', 'Under Review'].includes(r.status)
  ).length;
  const inProgressCount = reports.filter((r) =>
    ['Assigned', 'In Progress'].includes(r.status)
  ).length;
  const awaitingVerificationCount = reports.filter(
    (r) => r.status === 'Awaiting Verification'
  ).length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Citizen Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs text-slate-500">
            Jurisdiction: <span className="font-semibold text-slate-700">{user?.city || 'Karachi'}, Sindh</span> • Track real-time progress and verify municipal works
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition transform hover:-translate-y-0.5 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Lodge New Complaint
        </Link>
      </div>

      {/* Urgent Verification Alert Banner */}
      {awaitingVerificationCount > 0 && (
        <div className="p-4 sm:p-5 bg-teal-50 border-2 border-teal-500/40 rounded-2xl flex items-start gap-3 shadow-sm">
          <UserCheck className="w-6 h-6 text-teal-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-teal-950">
              Action Required: {awaitingVerificationCount} Complaint(s) Awaiting Your Verification
            </h3>
            <p className="text-xs text-teal-800 mt-0.5">
              Municipal authorities have submitted resolution evidence on your reported issues. Please inspect the work and confirm resolution or reopen the case.
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('Awaiting Verification')}
            className="px-3.5 py-1.5 bg-teal-700 text-white font-bold text-xs rounded-lg hover:bg-teal-800 transition shrink-0"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Lodged</span>
          <p className="text-2xl font-black text-navy-900">{totalCount}</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-blue-600 font-medium">Under Review</span>
          <p className="text-2xl font-black text-blue-700">{pendingCount}</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-amber-600 font-medium">In Progress</span>
          <p className="text-2xl font-black text-amber-700">{inProgressCount}</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-teal-600 font-medium">Awaiting Verification</span>
          <p className="text-2xl font-black text-teal-700">{awaitingVerificationCount}</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-emerald-600 font-medium">Confirmed Resolved</span>
          <p className="text-2xl font-black text-emerald-700">{resolvedCount}</p>
        </div>
      </div>

      {/* Complaint Records Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Your Lodged Complaints</h2>
            <p className="text-xs text-slate-500">Live operational records from the municipal database</p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium">
            {['all', 'Submitted', 'In Progress', 'Awaiting Verification', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition capitalize ${
                  statusFilter === st
                    ? 'bg-white font-bold text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
            <p className="text-xs">Retrieving your complaint records...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No complaints found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You have not lodged any issues under this filter. If you observe municipal or environmental issues in Karachi, report them today.
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Lodge First Complaint
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div
                key={report._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-xl transition"
              >
                <div className="flex items-start gap-4">
                  {report.imageUrl && (
                    <img
                      src={report.imageUrl}
                      alt="Evidence"
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                        {report.referenceId}
                      </span>
                      <StatusBadge status={report.status} size="sm" />
                      <span className="text-xs font-semibold text-teal-700">
                        {report.issueCategory}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-800 line-clamp-1">
                      {report.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {report.area}, {report.city}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      {report.assignedDepartment && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <Building2 className="w-3 h-3 text-indigo-500" />
                            {report.assignedDepartment.name || 'Assigned'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  <Link
                    to={`/reports/${report.referenceId}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-semibold transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
