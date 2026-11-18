import React from 'react';
import { CheckCircle2, Clock, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function Timeline({ history = [] }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-slate-500 italic">No transition history recorded.</p>;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'Awaiting Verification':
        return <UserCheck className="w-5 h-5 text-teal-600" />;
      case 'Reopened':
      case 'Rejected':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((step, idx) => {
        const dateStr = step.timestamp
          ? new Date(step.timestamp).toLocaleString('en-PK', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Pending';

        return (
          <div key={idx} className="relative flex items-start gap-4">
            <div className="absolute -left-6 mt-0.5 p-1 bg-white rounded-full ring-4 ring-slate-50">
              {getStatusIcon(step.newStatus)}
            </div>
            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                  {step.previousStatus && (
                    <>
                      <span className="text-slate-400 font-normal">{step.previousStatus}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </>
                  )}
                  <span className="text-navy-900 font-bold">{step.newStatus}</span>
                </span>
                <span className="text-xs text-slate-500">{dateStr}</span>
              </div>
              <p className="text-sm text-slate-600 mb-2">{step.explanation}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{step.changedByName || 'System'}</span>
                <span>•</span>
                <span className="capitalize px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                  {step.role ? step.role.replace('_', ' ') : 'System'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
