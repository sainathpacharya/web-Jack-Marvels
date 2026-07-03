import React, { useEffect } from 'react';
import EventCard, { EventCardSkeleton } from '../components/EventCard';
import SiteHeader from '../components/layout/SiteHeader';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEvents } from '../store/slices/eventsSlice';

export default function EventsPage() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.events);
  const loading = useAppSelector((state) => state.events.loading);
  const error = useAppSelector((state) => state.events.error);

  useEffect(() => {
    dispatch(fetchEvents({ audience: 'public' }));
  }, [dispatch]);

  return (
    <div>
      <SiteHeader homePath="/" />
      <div className="theme-page">
        <h1 className="theme-page-title">Events</h1>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <EventCardSkeleton key={idx} />
            ))}
          </div>
        ) : null}

        {!loading && error ? <div className="theme-alert-error">{error}</div> : null}

        {!loading && !error && events.length === 0 ? (
          <div className="theme-alert-info">No events available</div>
        ) : null}

        {!loading && !error && events.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {events.map((event) => (
              <EventCard key={String(event.id)} event={event} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
