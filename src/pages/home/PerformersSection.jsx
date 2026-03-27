import React, { memo } from 'react';

function PerformersSection({ performers = [] }) {
  if (!performers.length) return null;
  return (
    <section className="relative py-12 px-4 md:px-10 bg-gradient-to-r from-indigo-100 to-purple-100 shadow-inner rounded-xl mb-12 overflow-hidden">
      <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-10">This Week&apos;s Star Performers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {performers.map((winner, idx) => (
          <article
            key={`${winner.event}-${idx}`}
            className="bg-white shadow-xl rounded-3xl overflow-hidden border border-indigo-100 hover:shadow-2xl transition duration-300"
          >
            <img
              src={winner.image}
              alt={winner.event}
              className="w-full h-48 object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold text-indigo-700">{winner.event}</h3>
              <p className="text-gray-800 font-medium mt-1">🏆 {winner.winner}</p>
              <p className="text-sm text-gray-600">{winner.school}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default memo(PerformersSection);
