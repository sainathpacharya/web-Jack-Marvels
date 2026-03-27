import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getDashBoardDetails } from '../api/dashboard';
import { fetchMyProfile } from '../api/profile';
import { listSchools } from '../api/schools';
import { getStudents, getStudentsSummary } from '../api/students';
import { queryKeys } from '../lib/queryKeys';

export default function useNavigationPrefetch() {
  const queryClient = useQueryClient();

  const prefetchByPath = useCallback(
    (path) => {
      if (!path) return;
      if (path.includes('/profile')) {
        queryClient.prefetchQuery({ queryKey: queryKeys.profile.me, queryFn: ({ signal }) => fetchMyProfile({ signal }) });
        return;
      }
      if (path.includes('/school/dashboard') || path.includes('/home')) {
        queryClient.prefetchQuery({ queryKey: queryKeys.students.summary, queryFn: ({ signal }) => getStudentsSummary({ signal }) });
        queryClient.prefetchQuery({ queryKey: queryKeys.dashboard.details('prefetch'), queryFn: ({ signal }) => getDashBoardDetails({ signal }) });
        return;
      }
      if (path.includes('/school/students')) {
        const params = { page: 0, size: 20 };
        queryClient.prefetchQuery({ queryKey: queryKeys.students.list(params), queryFn: ({ signal }) => getStudents({ ...params, signal }) });
        return;
      }
      if (path.includes('/admin') || path.includes('/promoter')) {
        const params = { page: 1, limit: 10 };
        queryClient.prefetchQuery({ queryKey: queryKeys.schools.list(params), queryFn: ({ signal }) => listSchools({ ...params, signal }) });
      }
    },
    [queryClient]
  );

  const getPrefetchHandlers = useCallback(
    (path) => ({
      onMouseEnter: () => prefetchByPath(path),
      onFocus: () => prefetchByPath(path),
    }),
    [prefetchByPath]
  );

  return { prefetchByPath, getPrefetchHandlers };
}
