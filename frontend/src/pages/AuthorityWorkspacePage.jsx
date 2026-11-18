import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authorityAPI, departmentAPI } from '../services/api.js';
import StatusBadge from '../components/reports/StatusBadge.jsx';
import { Link } from 'react-router-dom';
import {
  Building2,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  FileText,
  AlertCircle,
  PlusCircle,
  Camera,
  MessageSquare,
  ShieldAlert,
  Loader2,
  X,
  Eye,
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

const STATUS_OPTIONS = [
  'all',
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Awaiting Verification',
  'Resolved',
  'Reopened',
  'Rejected'
];

export default function AuthorityWorkspacePage() {
  const { user, isAuthority } = useAuth();

  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [activeReport, setActiveReport] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  // Form inputs for modals
  const [newStatus, setNewStatus] = useState('');
  const [statusExplanation, setStatusExplanation] = useState('');
  const [targetDeptId, setTargetDeptId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteIsInternal, setNoteIsInternal] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceDesc, setEvidenceDesc] = useState('');

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, reportsRes, deptRes] = await Promise.all([
        authorityAPI.getDashboard(),
        authorityAPI.getReports({
          status: statusFilter,
          category: categoryFilter,
          search: searchQuery,
          page,
          limit: 15
        }),
        departmentAPI.getAll()
      ]);

      if (dashRes.data.success) {
        setStats(dashRes.data.stats);
      }
      if (reportsRes.data.success) {
        setReports(reportsRes.data.reports || []);
      }
      if (deptRes.data.success) {
        setDepartments(deptRes.data.departments || []);
      }
    } catch (err) {
      console.error('Error fetching authority workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter, categoryFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDashboardData();
  };

  // Status Update Submit
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      const res = await authorityAPI.updateStatus(activeReport._id, {
        status: newStatus,
        explanation: statusExplanation
      });
      if (res.data.success) {
        setSuccessMessage(`Status updated to "${newStatus}"`);
        setStatusModalOpen(false);
        setStatusExplanation('');
        fetchDashboardData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setModalLoading(false);
    }
  };

  // Assign Submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      const res = await authorityAPI.assignReport(activeReport._id, {
        departmentId: targetDeptId,
        notes: assignNotes
      });
      if (res.data.success) {
        setSuccessMessage('Complaint successfully assigned to department');
        setAssignModalOpen(false);
        setAssignNotes('');
        fetchDashboardData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to assign complaint');
    } finally {
      setModalLoading(false);
    }
  };

  // Note Submit
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      const res = await authorityAPI.addNote(activeReport._id, {
        note: noteContent,
        isInternal: noteIsInternal
      });
      if (res.data.success) {
        setSuccessMessage('Progress note saved');
        setNoteModalOpen(false);
        setNoteContent('');
        fetchDashboardData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to add note');
    } finally {
      setModalLoading(false);
    }
  };

  // Evidence Submit
  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      const formData = new FormData();
      if (evidenceFile) formData.append('image', evidenceFile);
      formData.append('description', evidenceDesc);

      const res = await authorityAPI.uploadEvidence(activeReport._id, formData);
      if (res.data.success) {
        setSuccessMessage('Resolution proof uploaded! Complaint is now awaiting citizen verification.');
        setEvidenceModalOpen(false);
        setEvidenceFile(null);
        setEvidenceDesc('');
        fetchDashboardData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to upload resolution proof');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-navy-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700">
              Official Municipal Workspace
            </span>
            <span className="text-xs text-slate-400">
              Department: <strong className="text-slate-200">{user?.department?.name || 'General Municipal Administration'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.name} — {user?.designation || 'Municipal Officer'}
          </h1>
          <p className="text-xs text-slate-400">
            Assigned Operational Jurisdiction: Karachi Metropolitan Area • Role: <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-800 hover:bg-navy-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Dashboard
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium block">Total Queue</span>
          <p className="text-xl font-black text-navy-900">{stats?.total ?? 0}</p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-blue-600 font-medium block">Submitted</span>
          <p className="text-xl font-black text-blue-700">{stats?.submitted ?? 0}</p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-purple-600 font-medium block">Under Review</span>
          <p className="text-xl font-black text-purple-700">{stats?.underReview ?? 0}</p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-indigo-600 font-medium block">Assigned</span>
          <p className="text-xl font-black text-indigo-700">{stats?.assigned ?? 0}</p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-amber-600 font-medium block">In Progress</span>
          <p className="text-xl font-black text-amber-700">{stats?.inProgress ?? 0}</p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-teal-600 font-medium block">Awaiting Verification</span>
          <p className="text-xl font-black text-teal-700">{stats?.awaitingVerification ?? 0}</p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-emerald-600 font-medium block">Resolved</span>
          <p className="text-xl font-black text-emerald-700">{stats?.resolved ?? 0}</p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-rose-600 font-medium block">Reopened</span>
          <p className="text-xl font-black text-rose-700">{stats?.reopened ?? 0}</p>
        </div>
      </div>

      {/* Main Complaint Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Department Complaint Queue</h2>
            <p className="text-xs text-slate-500">Live operational records from MongoDB</p>
          </div>

          {/* Filters */}
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference or area..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>Status: {st}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>
          </form>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <div className="py-20 text-center space-y-2 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
            <p className="text-xs">Loading operational records...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs italic">
            No complaints found matching the current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Category & Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Lodged Date</th>
                  <th className="py-3 px-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-navy-900">
                      <Link to={`/reports/${report.referenceId}`} className="hover:underline text-teal-700">
                        {report.referenceId}
                      </Link>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <span className="font-semibold text-slate-800 block">{report.issueCategory}</span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-xs">{report.locationAddress} ({report.area})</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={report.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {report.assignedDepartment?.name || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {/* Action buttons */}
                      <button
                        onClick={() => {
                          setActiveReport(report);
                          setNewStatus(report.status);
                          setStatusModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px]"
                      >
                        Status
                      </button>

                      <button
                        onClick={() => {
                          setActiveReport(report);
                          setTargetDeptId(report.assignedDepartment?._id || '');
                          setAssignModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[11px]"
                      >
                        Assign
                      </button>

                      <button
                        onClick={() => {
                          setActiveReport(report);
                          setNoteModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded text-[11px]"
                      >
                        Note
                      </button>

                      <button
                        onClick={() => {
                          setActiveReport(report);
                          setEvidenceModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded text-[11px]"
                      >
                        Resolve
                      </button>

                      <Link
                        to={`/reports/${report.referenceId}`}
                        className="inline-flex items-center px-2 py-1 bg-navy-900 text-white rounded hover:bg-navy-800 transition"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. Modal: Status Transition */}
      {statusModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-navy-900 text-sm">
                Transition Status: {activeReport.referenceId}
              </h3>
              <button onClick={() => setStatusModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {modalError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{modalError}</p>
            )}

            <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Awaiting Verification">Awaiting Verification</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mandatory Transition Explanation <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusExplanation}
                  onChange={(e) => setStatusExplanation(e.target.value)}
                  placeholder="Official reason for status change (required for municipal audit trail)..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-1.5 bg-navy-900 text-white rounded-lg font-bold"
                >
                  {modalLoading ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Assign Department */}
      {assignModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-navy-900 text-sm">
                Assign Department: {activeReport.referenceId}
              </h3>
              <button onClick={() => setAssignModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {modalError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{modalError}</p>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Department</label>
                <select
                  required
                  value={targetDeptId}
                  onChange={(e) => setTargetDeptId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="">Select Municipal Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assignment Routing Notes</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Instructions for the assigned departmental unit..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-1.5 bg-indigo-700 text-white rounded-lg font-bold"
                >
                  {modalLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Add Note */}
      {noteModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-navy-900 text-sm">
                Add Field Note: {activeReport.referenceId}
              </h3>
              <button onClick={() => setNoteModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {modalError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{modalError}</p>
            )}

            <form onSubmit={handleNoteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Progress Note</label>
                <textarea
                  required
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="e.g. Field inspection completed. Crew scheduled for tomorrow 9 AM..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="internalToggle"
                  checked={noteIsInternal}
                  onChange={(e) => setNoteIsInternal(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600"
                />
                <label htmlFor="internalToggle" className="text-slate-600">
                  Internal only (hidden from citizen public view)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-1.5 bg-teal-600 text-white rounded-lg font-bold"
                >
                  {modalLoading ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Upload Resolution Evidence */}
      {evidenceModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-navy-900 text-sm">
                Submit Resolution Proof: {activeReport.referenceId}
              </h3>
              <button onClick={() => setEvidenceModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {modalError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{modalError}</p>
            )}

            <form onSubmit={handleEvidenceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Resolution Photograph (Required)
                </label>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setEvidenceFile(e.target.files[0])}
                  className="w-full text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Resolution Work Summary
                </label>
                <textarea
                  required
                  rows={3}
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder="Details of remedial works executed on the ground..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="p-2.5 bg-teal-50 rounded-lg text-teal-800 text-[11px] leading-relaxed">
                <strong>Notice:</strong> Submitting resolution evidence transitions this complaint to <em>Awaiting Verification</em> and automatically notifies the citizen to inspect the outcome.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEvidenceModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  {modalLoading ? 'Uploading...' : 'Submit Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
