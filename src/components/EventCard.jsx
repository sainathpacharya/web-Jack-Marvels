import React from 'react';
import { getAssetUrl } from '../services/eventsService';

export function EventCardSkeleton() {
  return (
    <div className="theme-event-card animate-pulse overflow-hidden">
      <div className="h-40 w-full bg-orange-100/50" />
      <div className="p-4">
        <div className="mb-2 h-5 w-2/3 rounded bg-orange-100/60" />
        <div className="h-3 w-full rounded bg-orange-50" />
      </div>
    </div>
  );
}

export default function EventCard({ event, onClick }) {
  return (
    <article
      className="theme-event-card"
      onClick={() => onClick?.(event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(event);
      }}
    >
      <div className="flex h-40 w-full items-center justify-center overflow-hidden bg-white/50">
        <img
          src={getAssetUrl(event?.eventGifOrImage)}
          alt={event?.eventName || 'Event'}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h4 className="mb-1 font-script text-2xl text-purple-800">{event?.eventName || 'Untitled event'}</h4>
        <p className="line-clamp-2 font-body text-sm text-gray-600">
          {event?.description || 'Participate, showcase your talent, and win recognition.'}
        </p>
      </div>
    </article>
  );
}
