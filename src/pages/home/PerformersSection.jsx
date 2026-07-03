import React, { memo } from 'react';

function PerformersSection({ performers = [] }) {
  if (!performers.length) return null;
  return (
    <section className="theme-banner relative mb-12 overflow-hidden px-4 py-12 md:px-10">
      <h2 className="theme-section-title mb-10 text-center">This Week&apos;s Star Performers</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {performers.map((winner, idx) => (
          <article key={`${winner.event}-${idx}`} className="theme-card overflow-hidden p-0 transition hover:shadow-lg">
            <img
              src={winner.image}
              alt={winner.event}
              className="h-48 w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="p-4">
              <h3 className="font-script text-2xl text-purple-800">{winner.event}</h3>
              <p className="mt-1 font-label font-medium text-gray-800">🏆 {winner.winner}</p>
              <p className="text-sm text-gray-600">{winner.school}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default memo(PerformersSection);
