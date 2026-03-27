import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bulkUploadStudents, getStudents, updateStudentStatus } from '../../../api/students';
import { queryKeys } from '../../../lib/queryKeys';
import { QUERY_STALE } from '../../../lib/queryConfig';

export function useStudentsQuery(params) {
  return useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: ({ signal }) => getStudents({ ...params, signal }),
    placeholderData: (previous) => previous,
    staleTime: QUERY_STALE.students,
  });
}

export function useInfiniteStudentsQuery(params) {
  return useInfiniteQuery({
    queryKey: queryKeys.students.infiniteList(params),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => getStudents({ ...params, page: pageParam, signal }),
    getNextPageParam: (lastPage) => {
      const nextPage = Number(lastPage?.page ?? 0) + 1;
      const totalPages = Number(lastPage?.totalPages ?? 1);
      return nextPage < totalPages ? nextPage : undefined;
    },
    staleTime: QUERY_STALE.students,
  });
}

export function useBulkUploadStudentsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }) => bulkUploadStudents(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

export function useUpdateStudentStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, active }) => updateStudentStatus(studentId, active),
    onMutate: async ({ studentId, active }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.students.all });

      const previousStudentsList = queryClient.getQueriesData({ queryKey: queryKeys.students.list({}) });
      const previousInfiniteStudentsList = queryClient.getQueriesData({ queryKey: queryKeys.students.infiniteList({}) });
      const nextStatus = active ? 'Active' : 'Inactive';

      previousStudentsList.forEach(([key, value]) => {
        if (!value?.items) return;
        queryClient.setQueryData(key, {
          ...value,
          items: value.items.map((student) =>
            String(student.id) === String(studentId) ? { ...student, status: nextStatus } : student
          ),
        });
      });

      previousInfiniteStudentsList.forEach(([key, value]) => {
        if (!value?.pages) return;
        queryClient.setQueryData(key, {
          ...value,
          pages: value.pages.map((page) => ({
            ...page,
            items: page.items?.map((student) =>
              String(student.id) === String(studentId) ? { ...student, status: nextStatus } : student
            ),
          })),
        });
      });

      return { previousStudentsList, previousInfiniteStudentsList };
    },
    onError: (_error, _variables, context) => {
      context?.previousStudentsList?.forEach(([key, value]) => queryClient.setQueryData(key, value));
      context?.previousInfiniteStudentsList?.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all, refetchType: 'active' });
    },
  });
}
