import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Mail, ExternalLink, AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-12 pb-8 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-navy-800">
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="CivicLens AI" className="w-8 h-8" />
              <span className="font-extrabold text-xl text-white tracking-tight">
                CivicLens <span className="text-teal-400 font-semibold text-xs uppercase px-1.5 py-0.5 bg-navy-800 rounded">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering citizens with AI-assisted municipal reporting and establishing verifiable operational intelligence for urban management across Karachi.
            </p>
            <div className="text-[11px] text-teal-300 flex items-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              Pilot Focus: Karachi Metropolitan Area, Sindh
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/map" className="hover:text-teal-300 transition">Community Incident Map</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-teal-300 transition">Submit Civic Complaint</Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-teal-300 transition">Municipal Intelligence</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-teal-300 transition">Citizen Dashboard</Link>
              </li>
              <li>
                <Link to="/authority/login" className="hover:text-teal-300 transition">Authority Workspace</Link>
              </li>
            </ul>
          </div>

          {/* Civic Issues Monitored */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Monitored Issues
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Solid Waste & Dumping</li>
              <li>Drainage & Monsoon Flooding</li>
              <li>Water Leakage & Supply</li>
              <li>Road Surface Damage</li>
              <li>Streetlight Hazards</li>
              <li>Environmental Protection</li>
            </ul>
          </div>

          {/* Institutional Transparency Notice */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
              Institutional Notice
            </h4>
            <div className="p-3 bg-navy-800/80 rounded-xl border border-navy-700 text-[11px] text-slate-300 leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Independent Civic Technology</span>
              </div>
              CivicLens AI is an independently engineered municipal technology platform built for municipal demonstration, pilot evaluation, and potential institutional adoption by local authorities.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CivicLens AI Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-terms" className="hover:text-slate-300 transition">
              Privacy Policy & Terms
            </Link>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Karachi, Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
