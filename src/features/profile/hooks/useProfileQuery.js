import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMyProfile, updateMyProfile } from '../../../api/profile';
import { queryKeys } from '../../../lib/queryKeys';
import { QUERY_STALE } from '../../../lib/queryConfig';

export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: ({ signal }) => fetchMyProfile({ signal }),
    staleTime: QUERY_STALE.profile,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateMyProfile(payload),
    onMutate: async (nextData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.me });
      const previousProfile = queryClient.getQueryData(queryKeys.profile.me);
      queryClient.setQueryData(queryKeys.profile.me, (existing) => ({ ...(existing || {}), ...(nextData || {}) }));
      return { previousProfile };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKeys.profile.me, context.previousProfile);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.profile.me, updated);
    },
  });
}
