import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listEvents, updateEventStatus } from '../../../api/events';
import { queryKeys } from '../../../lib/queryKeys';

export function useEventsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.events.list,
    queryFn: ({ signal }) => listEvents({ signal }),
    enabled,
  });
}

export function useUpdateEventStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status, fromDate, toDate }) =>
      updateEventStatus(eventId, status, { fromDate, toDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all, refetchType: 'active' });
    },
  });
}

