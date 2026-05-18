import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setMasterActive } from '../../../api/masters';

/**
 * Unified PATCH /api/masters/{entityType}/{id}/status
 * @param {{ entityType: string, invalidateKeys?: unknown[][] }} options
 */
export function useMasterStatusMutation({ entityType, invalidateKeys = [] } = {}) {
  const queryClient = useQueryClient();
  const type = String(entityType ?? '').toLowerCase();

  return useMutation({
    mutationFn: ({ id, active }) => setMasterActive(type, id, active),
    onSuccess: () => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key, refetchType: 'active' });
      });
    },
  });
}

export function useUpdateInfluencerStatusMutation() {
  return useMasterStatusMutation({ entityType: 'influencer' });
}

export function useUpdatePromotorStatusMutation() {
  return useMasterStatusMutation({ entityType: 'promotor' });
}
