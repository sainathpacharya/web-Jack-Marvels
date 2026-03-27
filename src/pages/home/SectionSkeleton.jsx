import React from 'react';

export default function SectionSkeleton({ rows = 3, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="mb-3 h-8 animate-pulse rounded bg-slate-100 last:mb-0" />
      ))}
    </div>
  );
}
