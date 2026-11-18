import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Building2, Mail, Lock, ArrowRight, AlertCircle, ShieldAlert, KeyRound, Loader2 } from 'lucide-react';

export default function AuthorityLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { loginAuthority } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAuthority(email, password);
      if (res.success) {
        navigate('/authority');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your official credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-300 shadow-md">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-navy-900 text-teal-400 mb-2">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">
            Municipal Authority Workspace
          </h2>
          <p className="text-xs text-slate-500">
            Operational dashboard for departmental officers, inspectors, and administrators
          </p>
        </div>

        {/* Mandatory Institutional Security Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Restricted Operational Portal
          </div>
          <p className="leading-relaxed">
            Municipal authority accounts are issued and verified by authorized CivicLens administrators. Public authority registration is not available.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@department.gov.pk"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 text-teal-400" />}
            Enter Authority Workspace
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 space-y-3 text-center text-xs">
          <Link
            to="/authority/invitation"
            className="inline-flex items-center gap-1.5 font-bold text-teal-700 hover:underline"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Have an invitation token? Activate official account
          </Link>

          <div>
            <Link to="/login" className="text-slate-500 hover:text-slate-700">
              Citizens should sign in here &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
