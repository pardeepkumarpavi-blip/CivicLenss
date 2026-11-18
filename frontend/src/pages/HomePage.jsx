import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI } from '../services/api.js';
import PublicMap from '../components/map/PublicMap.jsx';
import StatusBadge from '../components/reports/StatusBadge.jsx';
import {
  ShieldAlert,
  ArrowRight,
  MapPin,
  Sparkles,
  CheckCircle2,
  Building2,
  Eye,
  FileText,
  AlertTriangle,
  Layers,
  HelpCircle,
  Clock,
  Compass
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Waste Management', desc: 'Garbage accumulation, illegal dumping, uncollected commercial waste', color: 'from-amber-500 to-amber-600', count: 'Active Monitoring' },
  { name: 'Drainage and Flooding', desc: 'Blocked storm drains, nallah overflow, monsoon water accumulation', color: 'from-blue-600 to-cyan-600', count: 'Monsoon Ready' },
  { name: 'Water Leakage', desc: 'Burst supply pipelines, contaminated water lines, sewerage overflow', color: 'from-teal-500 to-teal-700', count: 'High Priority' },
  { name: 'Road Damage', desc: 'Potholes, surface erosion, damaged footpaths, road cave-ins', color: 'from-rose-500 to-rose-700', count: 'Safety Hazard' },
  { name: 'Streetlight', desc: 'Broken municipal lighting, unlit public corridors, dangling wiring', color: 'from-yellow-500 to-amber-600', count: 'Public Safety' },
  { name: 'Air Pollution', desc: 'Open burning, industrial toxic emissions, particulate smoke hazards', color: 'from-slate-600 to-slate-800', count: 'Environmental' },
  { name: 'Environmental Hazard', desc: 'Chemical spills, deforestation, hazardous dumping, canal pollution', color: 'from-emerald-600 to-teal-700', count: 'Ecological' },
  { name: 'Other Municipal Issue', desc: 'General civic infrastructure damage requiring municipal intervention', color: 'from-navy-700 to-navy-900', count: 'General Civic' }
];

export default function HomePage() {
  const [publicReports, setPublicReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await reportAPI.getPublicReports({ limit: 12 });
        if (res.data.success) {
          setPublicReports(res.data.reports || []);
        }
      } catch (err) {
        console.error('Error fetching public reports for homepage:', err);
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#008DDA_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Empowering Municipal Transparency in Karachi
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your Community. <br />
              Your Voice. <span className="text-teal-400">Real Change.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
              A smarter way to report civic problems, connect with municipal services, and track community improvements with photographic verification and AI-assisted routing.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-teal-500 hover:bg-teal-600 text-navy-900 font-bold rounded-xl text-base shadow-lg shadow-teal-500/20 transition transform hover:-translate-y-0.5"
              >
                Report an Issue
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-navy-800 hover:bg-navy-700 text-white font-semibold rounded-xl text-base border border-slate-700 transition"
              >
                <Compass className="w-5 h-5 text-teal-400" />
                Explore Community Map
              </Link>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-700/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Geotagged Evidence</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multimodal AI Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Citizen-Verified Resolution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Statement & Platform Solution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded">
              The Urban Challenge
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
              Bridging the Accountability Gap in Municipal Operations
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Rapid urban growth in Karachi often leads to recurring challenges: overflowing garbage dumps, blocked stormwater nallahs, persistent water pipeline bursts, and unlit hazardous roads. Traditional complaint channels remain fragmented, difficult to track, and lack verifiable closure.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              <strong className="text-navy-900 font-semibold">CivicLens AI</strong> introduces an open, data-driven bridge. Citizens submit geolocated photo evidence; the platform assists in classification and routes complaints to authorized municipal departments. Crucially, complaints cannot be marked resolved without photographic resolution proof and citizen confirmation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy-900 text-base">Verifiable Lodgment</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Atomic reference sequence (CL-2026-XXXXX) with GPS coordinates and photographic documentation.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy-900 text-base">AI Classification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Objective multimodal analysis provides department recommendations and severity assessments.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy-900 text-base">Department Routing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complaints assigned to relevant municipal teams with full transition accountability.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy-900 text-base">Citizen Verification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Citizens inspect resolution evidence and confirm completion or reopen unresolved issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Workflow */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Structured Municipal Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900">
              How CivicLens AI Operates
            </h2>
            <p className="text-sm text-slate-600">
              From on-the-ground citizen observation to authorized departmental action and verified ground truth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="text-3xl font-black text-slate-200">01</span>
              <h4 className="text-base font-bold text-navy-900">Snap & Geotag</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Citizen captures photo evidence of the municipal problem and specifies or pinpoints the location on an interactive map.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="text-3xl font-black text-teal-200">02</span>
              <h4 className="text-base font-bold text-navy-900">AI Visual Analysis</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Gemini AI multimodal engine analyzes visible hazards, suggests categories, recommends municipal departments, and flags potential duplicates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="text-3xl font-black text-blue-200">03</span>
              <h4 className="text-base font-bold text-navy-900">Authorized Action</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Municipal officers review the complaint, dispatch field crews, record progress notes, and upload photo evidence upon completion.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
              <span className="text-3xl font-black text-emerald-200">04</span>
              <h4 className="text-base font-bold text-navy-900">Citizen Verification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The citizen reviews the resolution evidence and either confirms the fix or reopens the complaint if the problem persists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Monitored Civic Issue Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Scope of Intervention
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
              Monitored Civic & Environmental Categories
            </h2>
          </div>
          <Link
            to="/report"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            Report an issue in any of these categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="w-3 h-3 rounded-full bg-teal-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {cat.count}
                </span>
              </div>
              <h3 className="font-bold text-navy-900 text-sm">{cat.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Live Community Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Geographic Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Karachi Community Incident Map
            </h2>
            <p className="text-xs text-slate-600">
              Interactive display of real complaints logged in the database. Exact personal data is scrubbed for public privacy.
            </p>
          </div>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Compass className="w-4 h-4 text-teal-400" />
            Open Full Interactive Map
          </Link>
        </div>

        {loadingReports ? (
          <div className="h-96 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-sm animate-pulse">
            Loading geographical complaint records...
          </div>
        ) : (
          <PublicMap reports={publicReports} height="480px" />
        )}
      </section>

      {/* 6. Institutional Transparency Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start gap-5">
          <div className="p-3 bg-amber-100 rounded-xl text-amber-800 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-amber-900">
              Institutional Governance & Operational Scope Notice
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              CivicLens AI is an independently engineered civic technology platform designed for presentation, pilot deployment, and evaluation by municipal authorities. It does not claim official adoption by or legal affiliation with the Government of Sindh, Karachi Metropolitan Corporation (KMC), or Karachi Water & Sewerage Corporation (KWSC) unless formal institutional authorization has been executed. All operational integrations and authority accounts are strictly provisioned by administrative oversight.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Call to Action */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to improve your neighborhood?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Lodge a complaint in under two minutes with photographic evidence and track its progress from review to verified resolution.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/report"
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-navy-900 font-bold rounded-xl text-sm transition shadow-lg"
            >
              Report an Issue Now
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-navy-800 hover:bg-navy-700 text-white font-semibold rounded-xl text-sm border border-slate-700 transition"
            >
              Create Citizen Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
