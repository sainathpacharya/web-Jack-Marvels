import React, { useEffect } from 'react';
import EventCard, { EventCardSkeleton } from '../components/EventCard';
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
    <div className="px-6 md:px-20 py-16 bg-green-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Events</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <EventCardSkeleton key={idx} />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 text-gray-500">
          No events available
        </div>
      ) : null}

      {!loading && !error && events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={String(event.id)} event={event} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

