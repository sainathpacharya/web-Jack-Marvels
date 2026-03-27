import React, { Suspense, lazy, memo } from 'react';

const LottiePlayer = lazy(() => import('../../components/common/LottiePlayer'));

function EventsSection({ events = [], getEventState, formatRemaining, onOpenSchedule }) {
  if (!events.length) return null;
  return (
    <>
      <section className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl overflow-hidden shadow-lg mb-10">
        <div className="px-6 py-10 md:px-20 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Explore Our Exciting Events</h2>
          <p className="text-sm md:text-base opacity-90">
            Discover, participate, and shine in competitions crafted to showcase every child&apos;s unique talent!
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <img src="https://cdn-icons-png.flaticon.com/512/3163/3163619.png" alt="Event Icon" className="h-40 w-40 object-contain" loading="lazy" decoding="async" />
        </div>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
        {events.map((item, i) => {
          const { isActive, remainingMs } = getEventState(item);
          return (
            <button
              key={`${item.name}-${i}`}
              type="button"
              className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-2xl transition flex flex-col items-center border border-gray-200 hover:-translate-y-1"
              onClick={() => onOpenSchedule(item)}
            >
              <div className="bg-white p-3 rounded-full shadow-inner">
                {item.gifUrl ? (
                  <img
                    src={item.gifUrl}
                    alt={item.name}
                    className="h-20 w-20 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                ) : item.animation ? (
                  <Suspense fallback={<div className="h-20 w-20 animate-pulse rounded-full bg-slate-100" />}>
                    <LottiePlayer src={item.animation} className="h-20 w-20" />
                  </Suspense>
                ) : null}
              </div>
              <span className="mt-3 text-sm font-semibold text-gray-700 text-center">{item.name}</span>
              {!isActive ? (
                <div className="mt-1 text-xs text-gray-400 text-center">Inactive</div>
              ) : (
                <div className="mt-1 text-xs text-green-700 text-center">Ends in {formatRemaining(remainingMs)}</div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default memo(EventsSection);
