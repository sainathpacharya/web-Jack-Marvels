import React from 'react';

function CardSkeleton() {
  return (
    <div className="theme-card animate-pulse">
      <div className="h-3 w-28 rounded bg-orange-100/60" />
      <div className="mt-3 h-8 w-16 rounded bg-orange-100/80" />
    </div>
  );
}

export default function DashboardCards({ summary, loading }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {loading ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : (
        <>
          <div className="theme-card">
            <p className="font-label text-sm text-gray-600">Total Students</p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-orange">
              {summary?.totalStudents ?? 0}
            </p>
          </div>
          <div className="theme-card">
            <p className="font-label text-sm text-gray-600">Students Participated in Events</p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-orange">
              {summary?.participantsCount ?? 0}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
