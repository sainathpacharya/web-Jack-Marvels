import React from 'react';

export default function PageSkeleton({ rows = 6 }) {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="mb-3 h-10 animate-pulse rounded bg-slate-100 last:mb-0" />
        ))}
      </div>
    </div>
  );
}
