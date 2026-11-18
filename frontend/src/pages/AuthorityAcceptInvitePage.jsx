import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authorityAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { KeyRound, Lock, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

export default function AuthorityAcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await authorityAPI.acceptInvitation({
        token: token.trim(),
        password,
        confirmPassword
      });

      if (res.data.success) {
        localStorage.setItem('civiclens_token', res.data.accessToken);
        localStorage.setItem('civiclens_user', JSON.stringify(res.data.user));
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/authority';
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate authority account. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-300 shadow-md">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-teal-50 text-teal-700 mb-2">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">
            Activate Authority Account
          </h2>
          <p className="text-xs text-slate-500">
            Complete your official municipal onboarding with your secure single-use invitation token
          </p>
        </div>

        {success ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-emerald-900">Account Activated Successfully</h3>
            <p className="text-xs text-emerald-700">
              Welcome to the CivicLens Municipal Workspace. Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Invitation Token
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter 64-character token"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Set Secure Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-teal-400" />}
                Activate Municipal Account
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an activated account?{' '}
              <Link to="/authority/login" className="font-bold text-teal-700 hover:underline">
                Sign In to Authority Workspace
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
