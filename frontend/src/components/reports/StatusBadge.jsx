import React from 'react';

const STATUS_CONFIG = {
  'Submitted': {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500'
  },
  'Under Review': {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500'
  },
  'Assigned': {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500'
  },
  'In Progress': {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500 animate-pulse'
  },
  'Awaiting Verification': {
    bg: 'bg-teal-50 text-teal-800 border-teal-200',
    dot: 'bg-teal-500 animate-bounce'
  },
  'Resolved': {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500'
  },
  'Reopened': {
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    dot: 'bg-rose-500'
  },
  'Rejected': {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400'
  }
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {status || 'Unknown'}
    </span>
  );
}
