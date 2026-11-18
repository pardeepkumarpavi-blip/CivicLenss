import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-center">
      <div className="max-w-md w-full space-y-4">
        <span className="text-6xl font-black text-slate-200 block font-mono">404</span>
        <h1 className="text-2xl font-bold text-navy-900">Page Not Found</h1>
        <p className="text-xs text-slate-500">
          The requested municipal page or complaint record could not be located.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-semibold hover:bg-navy-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
