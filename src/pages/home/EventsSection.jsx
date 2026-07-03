import React, { Suspense, lazy, memo } from 'react';

const LottiePlayer = lazy(() => import('../../components/common/LottiePlayer'));

function EventsSection({ events = [], getEventState, formatRemaining, onOpenSchedule }) {
  if (!events.length) return null;
  return (
    <>
      <section className="theme-banner mb-10">
        <h2 className="theme-section-title mb-2">Explore Our Exciting Events</h2>
        <p className="font-body text-sm text-gray-600 md:text-base">
          Discover, participate, and shine in competitions crafted to showcase every child&apos;s unique talent!
        </p>
      </section>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {events.map((item, i) => {
          const { isActive, remainingMs } = getEventState(item);
          return (
            <button
              key={`${item.name}-${i}`}
              type="button"
              className="theme-card flex flex-col items-center p-4 transition hover:-translate-y-1 hover:shadow-lg"
              onClick={() => onOpenSchedule(item)}
            >
              <div className="rounded-full bg-white/80 p-3 shadow-inner">
                {item.gifUrl ? (
                  <img
                    src={item.gifUrl}
                    alt={item.name}
                    className="h-20 w-20 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                ) : item.animation ? (
                  <Suspense fallback={<div className="h-20 w-20 animate-pulse rounded-full bg-orange-100/50" />}>
                    <LottiePlayer src={item.animation} className="h-20 w-20" />
                  </Suspense>
                ) : null}
              </div>
              <span className="mt-3 text-center font-script text-xl text-purple-800">{item.name}</span>
              {!isActive ? (
                <div className="mt-1 text-center text-xs text-gray-400">Inactive</div>
              ) : (
                <div className="mt-1 text-center text-xs text-green-700">
                  Ends in {formatRemaining(remainingMs)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default memo(EventsSection);
