import React from 'react';
import { getAssetUrl } from '../services/eventsService';

export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="w-full h-40 bg-slate-200" />
      <div className="p-4">
        <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-full" />
      </div>
    </div>
  );
}

export default function EventCard({ event, onClick }) {
  return (
    <article
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
      onClick={() => onClick?.(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(event);
      }}
    >
      <div className="w-full h-40 bg-slate-100 overflow-hidden flex items-center justify-center">
        <img
          src={getAssetUrl(event?.eventGifOrImage)}
          alt={event?.eventName || 'Event'}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-base mb-1">{event?.eventName || 'Untitled event'}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">
          {event?.description || 'Participate, showcase your talent, and win recognition.'}
        </p>
      </div>
    </article>
  );
}

