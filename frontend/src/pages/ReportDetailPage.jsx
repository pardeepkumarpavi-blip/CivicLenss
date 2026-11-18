import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reportAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/reports/StatusBadge.jsx';
import Timeline from '../components/reports/Timeline.jsx';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import {
  FileText,
  MapPin,
  Calendar,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Clock,
  RotateCcw,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  Loader2
} from 'lucide-react';

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function ReportDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated, isAuthority } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verification state
  const [verifyFeedback, setVerifyFeedback] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getById(id);
      if (res.data.success) {
        setReport(res.data.report);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find the requested complaint record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleVerify = async (confirmed) => {
    setVerifying(true);
    setVerifySuccess(null);
    try {
      const res = await reportAPI.verifyResolution(report._id, {
        confirmed,
        feedback: verifyFeedback
      });
      if (res.data.success) {
        setVerifySuccess(res.data.message);
        await fetchReport();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit verification');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto" />
        <p className="text-xs text-slate-500">Retrieving official municipal record...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-navy-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested complaint does not exist or has restricted visibility.'}</p>
        <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </Link>
      </div>
    );
  }

  const isOwner = user && (String(user._id || user.id) === String(report.citizenId?._id || report.citizenId));
  const hasCoordinates = report.location?.coordinates?.length === 2;
  const lat = hasCoordinates ? report.location.coordinates[1] : 24.8607;
  const lng = hasCoordinates ? report.location.coordinates[0] : 67.0011;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation & Ref ID Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <Link
            to={isAuthenticated ? (isAuthority ? '/authority' : '/dashboard') : '/map'}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-navy-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Overview
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-navy-900 font-mono">
              {report.referenceId}
            </h1>
            <StatusBadge status={report.status} />
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <span>Lodged on {new Date(report.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>•</span>
            <span>{report.area}, {report.city}</span>
          </p>
        </div>

        {isAuthority && (
          <Link
            to="/authority"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition shrink-0"
          >
            <Building2 className="w-4 h-4 text-teal-400" />
            Manage in Authority Workspace
          </Link>
        )}
      </div>

      {/* Citizen Verification Prompt (Action Card) */}
      {isOwner && report.status === 'Awaiting Verification' && (
        <div className="p-6 bg-teal-50 border-2 border-teal-500 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-teal-950">
                Action Required: Verify Municipal Resolution
              </h3>
              <p className="text-xs text-teal-800 mt-1 leading-relaxed">
                Municipal officers have submitted resolution evidence on this complaint. Please inspect the uploaded photo below and confirm whether the problem has been satisfactorily solved on the ground.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <textarea
              rows={2}
              value={verifyFeedback}
              onChange={(e) => setVerifyFeedback(e.target.value)}
              placeholder="Optional ground truth feedback for the municipal administration..."
              className="w-full p-2.5 bg-white border border-teal-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleVerify(true)}
                disabled={verifying}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Confirm Issue Resolved
              </button>

              <button
                type="button"
                onClick={() => handleVerify(false)}
                disabled={verifying}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Issue Still Exists (Reopen)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Resolution Confirmation Display */}
      {report.citizenVerification?.status === 'Confirmed Resolved' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="block font-bold text-sm">Citizen-Verified Resolution</strong>
            <span>Verified by citizen on {new Date(report.citizenVerification.verifiedAt).toLocaleDateString()}</span>
            {report.citizenVerification.citizenFeedback && (
              <p className="italic text-emerald-800 mt-0.5">"{report.citizenVerification.citizenFeedback}"</p>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Left Column Details & Evidence, Right Column Map & Assigned Dept */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Evidence, Description, Resolution, Progress Notes, History */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Evidence Photograph */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Reported Photographic Evidence
            </h2>
            <div className="h-80 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={report.imageUrl}
                alt="Complaint evidence"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen Description</span>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {report.description}
              </p>
            </div>
          </div>

          {/* 2. Official Resolution Evidence (if present) */}
          {report.resolutionEvidence?.resolvedAt && (
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Official Resolution Proof
                </h2>
                <span className="text-xs font-semibold text-emerald-700">
                  {new Date(report.resolutionEvidence.resolvedAt).toLocaleDateString()}
                </span>
              </div>

              {report.resolutionEvidence.imageUrl && (
                <div className="h-72 w-full rounded-xl overflow-hidden bg-slate-100 border border-emerald-200">
                  <img
                    src={report.resolutionEvidence.imageUrl}
                    alt="Resolution evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Completion Report</span>
                <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                  {report.resolutionEvidence.description || 'Resolution work completed by municipal dispatch team.'}
                </p>
                <p className="text-xs text-emerald-700 pt-1">
                  Submitted by: <strong className="font-semibold">{report.resolutionEvidence.resolvedByName || 'Authorized Officer'}</strong>
                </p>
              </div>
            </div>
          )}

          {/* 3. Gemini AI Analysis Advisory Card */}
          {report.aiAnalysis?.analyzedAt && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Multimodal AI Analysis
                </h3>
                <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  Confidence: {report.aiAnalysis.confidence}%
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {report.aiAnalysis.issueDescription || 'Visual analysis completed.'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Severity Suggestion</span>
                  <span className="font-semibold text-amber-700">{report.aiAnalysis.severitySuggestion || 'Unknown'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Recommended Department</span>
                  <span className="font-semibold text-slate-800">{report.aiAnalysis.recommendedDepartment || 'Unspecified'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Suggested Action</span>
                  <span className="font-semibold text-slate-800 truncate">{report.aiAnalysis.suggestedAction || 'Inspection'}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Safety disclaimer: Gemini visual analysis does not constitute legal culpability or binding municipal confirmation.
              </p>
            </div>
          )}

          {/* 4. Progress Notes & Updates */}
          {report.progressNotes?.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                Official Notes & Field Updates
              </h3>
              <div className="space-y-3">
                {report.progressNotes.map((note, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="font-semibold text-slate-700">{note.authorName} ({note.role})</span>
                      <span>{new Date(note.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-800 font-medium">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Complete Lifecycle Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Complete Status History & Lifecycle Audit
            </h3>
            <Timeline history={report.statusHistory} />
          </div>
        </div>

        {/* Right 1 Col: Location, Assigned Dept, Metadata */}
        <div className="space-y-6">
          {/* Location Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              Location Coordinates
            </h3>

            <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-200 relative">
              <MapContainer
                center={[lat, lng]}
                zoom={14}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={customMarkerIcon} />
              </MapContainer>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-semibold text-slate-800">{report.locationAddress}</p>
              <p className="text-slate-500">{report.area}, {report.city}</p>
              <p className="font-mono text-[11px] text-slate-400">
                GPS: {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            </div>
          </div>

          {/* Assigned Department Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              Department Routing
            </h3>

            {report.assignedDepartment ? (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                  <span className="font-bold text-indigo-950 block text-sm">
                    {report.assignedDepartment.name}
                  </span>
                  <span className="text-indigo-700 font-mono text-[11px]">
                    Code: {report.assignedDepartment.code}
                  </span>
                  {report.assignedDepartment.jurisdiction && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      {report.assignedDepartment.jurisdiction}
                    </p>
                  )}
                </div>
                {report.assignedAuthorityId && (
                  <p className="text-slate-600">
                    Assigned Officer: <strong className="text-slate-800">{report.assignedAuthorityId.name}</strong>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Awaiting administrative routing to relevant municipal department.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
