import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSuperAdmin,
  listSuperAdmins,
  resetSuperAdminPassword,
  updateSuperAdminStatus,
} from '../../../api/superAdmins';
import { queryKeys } from '../../../lib/queryKeys';
import { QUERY_STALE } from '../../../lib/queryConfig';

export function useSuperAdminsListQuery(params = {}, options = {}) {
  const { page = 1, limit = 10, search = '', status } = params;
  const queryKey = queryKeys.superAdmins.list({ page, limit, search, status });

  return useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      listSuperAdmins({ page, limit, search, status, signal }),
    staleTime: QUERY_STALE.superAdmins,
    ...options,
  });
}

export function useCreateSuperAdminMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createSuperAdmin(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.superAdmins.all });
    },
  });
}

export function useUpdateSuperAdminStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, active }) => updateSuperAdminStatus(userId, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.superAdmins.all });
    },
  });
}

export function useResetSuperAdminPasswordMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newPassword }) => resetSuperAdminPassword(userId, newPassword),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.superAdmins.all });
    },
  });
}
