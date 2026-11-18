import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reportAPI, aiAPI } from '../services/api.js';
import LocationPickerMap from '../components/map/LocationPickerMap.jsx';
import {
  Camera,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  FileText,
  Info,
  X,
  Eye
} from 'lucide-react';

const CATEGORIES = [
  'Waste Management',
  'Drainage and Flooding',
  'Water Leakage',
  'Road Damage',
  'Streetlight',
  'Air Pollution',
  'Environmental Hazard',
  'Other Municipal Issue'
];

const KARACHI_AREAS = [
  'Clifton',
  'Defence (DHA)',
  'Gulshan-e-Iqbal',
  'PECHS',
  'Saddar',
  'North Nazimabad',
  'Federal B Area',
  'Korangi',
  'Landhi',
  'Malir',
  'Jamshed Town',
  'Gulberg',
  'Liaquatabad',
  'SITE Area',
  'Keamari',
  'Orangi Town',
  'Baldia Town',
  'Shah Faisal Colony'
];

export default function ReportIssuePage() {
  const navigate = useNavigate();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('');
  const [issueCategory, setIssueCategory] = useState('Waste Management');
  const [locationAddress, setLocationAddress] = useState('');
  const [area, setArea] = useState('PECHS');
  const [city] = useState('Karachi');
  const [latitude, setLatitude] = useState(24.8607);
  const [longitude, setLongitude] = useState(67.0011);

  // AI Analysis State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiNotice, setAiNotice] = useState(null);

  // Review & Submit State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [createdReport, setCreatedReport] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setAiResult(null);
      setAiNotice(null);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!imageFile && !description) {
      setAiNotice('Please select a photo or enter a preliminary description before requesting AI analysis.');
      return;
    }

    setAiLoading(true);
    setAiNotice(null);

    try {
      const formData = new FormData();
      if (imageFile) formData.append('image', imageFile);
      if (description) formData.append('description', description);
      formData.append('category', issueCategory);

      const res = await aiAPI.analyzeReport(formData);

      if (res.data.available && res.data.analysis) {
        setAiResult(res.data.analysis);
        if (res.data.analysis.issueCategory) {
          setIssueCategory(res.data.analysis.issueCategory);
        }
        if (res.data.analysis.issueDescription && !description) {
          setDescription(res.data.analysis.issueDescription);
        }
      } else {
        setAiNotice(res.data.message || 'AI analysis is currently unavailable. You can continue with manual complaint submission.');
      }
    } catch (err) {
      setAiNotice('AI analysis service is currently unavailable. You may continue with manual complaint submission.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleLocationChange = ({ lat, lng }) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleOpenReview = (e) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!imageFile) {
      setSubmissionError('Photographic evidence is required to lodge a verifiable municipal complaint.');
      return;
    }
    if (!description.trim()) {
      setSubmissionError('Please provide a descriptive account of the observed municipal problem.');
      return;
    }
    if (!locationAddress.trim()) {
      setSubmissionError('Please provide a specific street address or landmark.');
      return;
    }

    setReviewModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmissionError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('description', description);
      formData.append('issueCategory', issueCategory);
      formData.append('locationAddress', locationAddress);
      formData.append('area', area);
      formData.append('city', city);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      if (aiResult?.severitySuggestion) {
        formData.append('severitySuggestion', aiResult.severitySuggestion);
      }
      if (aiResult) {
        formData.append('aiAnalysis', JSON.stringify(aiResult));
      }

      const res = await reportAPI.create(formData);
      if (res.data.success) {
        setCreatedReport(res.data.report);
        if (res.data.potentialDuplicates?.length > 0) {
          setDuplicateWarning(res.data.potentialDuplicates);
        }
        setReviewModalOpen(false);
      }
    } catch (err) {
      setSubmissionError(err.response?.data?.message || 'Failed to submit complaint. Please check your connection and inputs.');
      setReviewModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Heading */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
          Citizen Reporting System
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          Lodge a Civic or Environmental Complaint
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Capture evidence, pinpoint the incident coordinates on the map, and submit to authorized municipal services in Karachi.
        </p>
      </div>

      {submissionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleOpenReview} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Step 1: Evidence Photograph */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-teal-600" />
              1. Photographic Evidence
            </h2>
            <span className="text-xs text-rose-600 font-semibold">* Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-teal-500 transition cursor-pointer relative bg-slate-50">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  {imageFile ? imageFile.name : 'Click or tap to upload photo'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Supports JPEG, PNG, WebP up to 5MB
                </p>
              </div>
            </div>

            {/* Preview Box */}
            <div className="h-44 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Evidence preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-400 italic">No image selected</span>
              )}
            </div>
          </div>

          {/* AI Multimodal Analysis Trigger */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleRunAiAnalysis}
              disabled={aiLoading || !imageFile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-navy-800 hover:from-teal-700 hover:to-navy-900 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-40"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-teal-300" />}
              Analyze Evidence with Gemini AI
            </button>
          </div>

          {/* AI Analysis Feedback Notice */}
          {aiNotice && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>{aiNotice}</span>
            </div>
          )}

          {/* AI Result Card */}
          {aiResult && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-teal-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Preliminary Gemini AI Assessment (Confidence: {aiResult.confidence}%)
                </span>
                <span className="text-[10px] bg-teal-200 text-teal-800 px-2 py-0.5 rounded font-bold uppercase">
                  Editable Before Submission
                </span>
              </div>
              <p className="text-xs text-teal-900 leading-relaxed font-medium">
                {aiResult.issueDescription}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2">
                <div className="bg-white p-2 rounded-lg border border-teal-100">
                  <span className="text-[10px] text-slate-400 block font-bold">Suggested Category</span>
                  <span className="font-semibold text-slate-800">{aiResult.issueCategory}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-teal-100">
                  <span className="text-[10px] text-slate-400 block font-bold">Recommended Department</span>
                  <span className="font-semibold text-slate-800">{aiResult.recommendedDepartment}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-teal-100">
                  <span className="text-[10px] text-slate-400 block font-bold">Severity Assessment</span>
                  <span className="font-semibold text-amber-700">{aiResult.severitySuggestion}</span>
                </div>
              </div>
              <p className="text-[11px] text-teal-700 italic pt-1">
                Note: AI suggestions are advisory and subject to official municipal review.
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Issue Details */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            2. Issue Classification & Description
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Karachi Town / Area
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {KARACHI_AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the nature of the issue, severity, duration, and any hazards to nearby residents or traffic..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Step 3: Location Details & Leaflet Picker */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            3. Geographical Location
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Street Address / Landmark
            </label>
            <input
              type="text"
              required
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="e.g. Near Nursery Flyover Service Road, Main Shahrah-e-Faisal"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
          </div>

          {/* Interactive Map Picker */}
          <LocationPickerMap
            initialLat={latitude}
            initialLng={longitude}
            onLocationChange={handleLocationChange}
          />
        </div>

        {/* Submit Review CTA */}
        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center gap-2"
          >
            Review & Lodge Complaint
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-navy-900">
                Confirm Complaint Submission
              </h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="text-slate-500">
                Please verify the accuracy of your complaint before it enters the municipal queue:
              </p>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">Category:</span> {issueCategory}
                </div>
                <div>
                  <span className="font-bold text-slate-800">Area:</span> {area}, {city}
                </div>
                <div>
                  <span className="font-bold text-slate-800">Address:</span> {locationAddress}
                </div>
                <div>
                  <span className="font-bold text-slate-800">Coordinates:</span> {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </div>
                <div>
                  <span className="font-bold text-slate-800">Description:</span>
                  <p className="mt-0.5 text-slate-700 italic">"{description}"</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                By submitting, you certify that this photographic evidence is genuine and represents a current municipal condition.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirm & Lodge Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Card */}
      {createdReport && (
        <div className="p-8 bg-white border border-teal-200 rounded-2xl shadow-lg space-y-6 text-center">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-teal-700 uppercase">Complaint Lodged Successfully</span>
            <h2 className="text-2xl font-black text-navy-900">
              Reference: <span className="font-mono text-teal-600">{createdReport.referenceId}</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your report has been stored in the municipal database and dispatched to the review queue.
            </p>
          </div>

          {/* Potential Duplicate Warning if flagged */}
          {duplicateWarning.length > 0 && (
            <div className="max-w-md mx-auto p-4 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Nearby Similar Complaint(s) Detected
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                The platform identified {duplicateWarning.length} nearby report(s) matching this category. Your submission remains independent and has been recorded with reference <strong className="font-mono">{createdReport.referenceId}</strong>.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to={`/reports/${createdReport.referenceId}`}
              className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              View Complaint Record
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
            >
              Return to Citizen Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
