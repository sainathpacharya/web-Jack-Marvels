import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardCards from '../../components/school/DashboardCards';
import { getStudentsSummary } from '../../api/students';
import { queryKeys } from '../../lib/queryKeys';
import { QUERY_BACKGROUND_SYNC, QUERY_STALE } from '../../lib/queryConfig';

export default function SchoolDashboardPage() {
  const summaryQuery = useQuery({
    queryKey: queryKeys.students.summary,
    queryFn: ({ signal }) => getStudentsSummary({ signal }),
    retry: 1,
    staleTime: QUERY_STALE.students,
    refetchInterval: QUERY_BACKGROUND_SYNC.summary,
    refetchOnWindowFocus: false,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-sky-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-600">Overview of your school student metrics.</p>

      <div className="mt-5">
        <DashboardCards
          summary={summaryQuery.isError ? { totalStudents: 0, participantsCount: 0 } : summaryQuery.data}
          loading={summaryQuery.isLoading || summaryQuery.isFetching}
        />
      </div>
    </div>
  );
}
