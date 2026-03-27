import React from 'react';

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50 p-5">
      <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-300" />
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
          <div className="rounded-xl border border-sky-100 bg-[#f6fbff] p-5">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="mt-2 text-3xl font-bold text-sky-900">{summary?.totalStudents ?? 0}</p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-[#f6fbff] p-5">
            <p className="text-sm text-gray-600">Students Participated in Events</p>
            <p className="mt-2 text-3xl font-bold text-sky-900">{summary?.participantsCount ?? 0}</p>
          </div>
        </>
      )}
    </div>
  );
}
