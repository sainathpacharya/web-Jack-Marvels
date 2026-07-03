import React from 'react';

export default function WatercolorBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl" />
      <div className="absolute left-1/3 top-0 h-64 w-64 rounded-full bg-emerald-200/35 blur-3xl" />
      <div className="absolute -left-10 bottom-16 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="absolute right-0 top-1/4 h-56 w-56 rounded-full bg-sky-200/25 blur-3xl" />
    </div>
  );
}
