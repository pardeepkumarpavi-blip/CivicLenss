import React from 'react';
import { ShieldCheck, Lock, Eye, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyTermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
          Legal & Governance Framework
        </span>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Privacy Policy & Citizen Terms of Service
        </h1>
        <p className="text-xs text-slate-500">
          CivicLens AI Municipal Complaint Management Platform • Operating in Karachi, Sindh
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            1. Core Data Privacy Principles
          </h2>
          <p>
            CivicLens AI is designed to protect citizen privacy while enabling transparent municipal action. We collect only the minimum information necessary to route, inspect, and resolve civic complaints:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li><strong>Public Incident Map Privacy:</strong> Your name, email, phone number, and private residence notes are never published on the public community map or visible to anonymous visitors.</li>
            <li><strong>Coordinates & Photos:</strong> Photographs and geographic coordinates are used strictly for municipal inspection and departmental dispatch.</li>
            <li><strong>No Third-Party Advertising:</strong> Citizen information is never sold, rented, or shared with commercial advertising brokers.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-600" />
            2. Authentication & Account Boundaries
          </h2>
          <p>
            The platform enforces a strict cryptographic boundary between ordinary citizen accounts and authorized municipal personnel:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>Citizen accounts can only lodge and monitor complaints. They cannot escalate their operational privileges to authority or administrative roles.</li>
            <li>Municipal authority accounts are issued on an invitation-only basis by Super Administrators with cryptographically hashed, single-use tokens and designated department permissions.</li>
            <li>Passwords are secured with bcrypt salted hashes and never stored in plaintext or logged.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            3. AI Multimodal Evaluation Advisory
          </h2>
          <p>
            CivicLens AI integrates the Google Gemini multimodal model to assist in classifying reported civic conditions:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>AI suggestions regarding category, severity, and department are preliminary and advisory only.</li>
            <li>The AI system is strictly instructed never to identify individual people who may appear in photographs and never to establish legal culpability.</li>
            <li>All AI outputs are editable by the citizen prior to submission and subject to verification by municipal officers.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            4. Institutional Deployment Status
          </h2>
          <p className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900">
            CivicLens AI is an independently developed municipal technology platform designed for presentation, pilot deployment, and evaluation. It does not represent an officially mandated service of the Government of Sindh or any government authority until formal institutional execution has taken place.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            5. Citizen Verification & Closure
          </h2>
          <p>
            In accordance with CivicLens accountability standards, an authority's claim of completion moves a complaint to <em>Awaiting Verification</em>. Only the reporting citizen's confirmation establishes a complaint as <em>Confirmed Resolved</em>. If the issue remains unaddressed, the citizen retains the right to reopen the complaint with explanatory feedback.
          </p>
        </section>
      </div>
    </div>
  );
}
