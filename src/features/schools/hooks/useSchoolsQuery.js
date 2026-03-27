import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSchool, deleteSchool, listSchools, normalizeSchoolFromApi } from '../../../api/schools';
import { STATIC_SCHOOLS_ADDED } from '../../../data/staticData';
import { queryKeys } from '../../../lib/queryKeys';
import { QUERY_STALE } from '../../../lib/queryConfig';

function normalizeFallbackSchool(s) {
  return {
    ...s,
    id: s.id ?? Date.now(),
    name: s.name || '',
    email: s.email || '',
    branchCode: s.branchCode || '',
    address: s.address || '',
    city: s.city || '',
    state: s.state || '',
    pincode: s.pincode || '',
    contactName: s.contactName || '',
    contactPhone: s.contactPhone || '',
    status: s.status === 'inactive' ? 'inactive' : 'active',
    studentsCount: Number.isFinite(s.studentsCount) ? s.studentsCount : 0,
    addedAt: s.addedAt || new Date().toISOString().slice(0, 10),
    addedByPromoterId: s.addedByPromoterId ?? null,
  };
}

function fromStaticFallback({ page = 1, limit = 10 } = {}) {
  const all = STATIC_SCHOOLS_ADDED.map(normalizeFallbackSchool);
  const start = Math.max(0, (page - 1) * limit);
  const end = start + limit;
  const items = all.slice(start, end);
  return {
    items,
    total: all.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(all.length / limit)),
  };
}

async function fetchSchoolsWithFallback({ page = 1, limit = 10, fallbackToStatic = false, signal }) {
  try {
    const result = await listSchools({ page, limit, signal });
    return {
      ...result,
      items: result.items.map(normalizeSchoolFromApi),
    };
  } catch (error) {
    if (fallbackToStatic) {
      return fromStaticFallback({ page, limit });
    }
    throw error;
  }
}

export function useSchoolsQuery(params) {
  return useQuery({
    queryKey: queryKeys.schools.list(params),
    queryFn: ({ signal }) => fetchSchoolsWithFallback({ ...params, signal }),
    placeholderData: (previous) => previous,
    staleTime: QUERY_STALE.schools,
  });
}

export function useInfiniteSchoolsQuery(params) {
  return useInfiniteQuery({
    queryKey: queryKeys.schools.infiniteList(params),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => fetchSchoolsWithFallback({ ...params, page: pageParam, signal }),
    getNextPageParam: (lastPage) => {
      const nextPage = Number(lastPage?.page ?? 1) + 1;
      const totalPages = Number(lastPage?.totalPages ?? 1);
      return nextPage <= totalPages ? nextPage : undefined;
    },
    staleTime: QUERY_STALE.schools,
  });
}

export function useCreateSchoolMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, userId, userRole }) => createSchool(payload, { userId, userRole }),
    onMutate: async ({ payload }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.schools.all });
      const optimisticSchool = normalizeSchoolFromApi({
        ...payload,
        id: `temp-${Date.now()}`,
        createdOn: new Date().toISOString(),
      });
      const previousSchools = queryClient.getQueriesData({ queryKey: queryKeys.schools.all });

      previousSchools.forEach(([key, value]) => {
        if (!value) return;
        if (value?.items) {
          queryClient.setQueryData(key, { ...value, items: [optimisticSchool, ...value.items], total: (value.total || 0) + 1 });
          return;
        }
        if (value?.pages) {
          const firstPage = value.pages[0] || { items: [] };
          queryClient.setQueryData(key, {
            ...value,
            pages: [{ ...firstPage, items: [optimisticSchool, ...(firstPage.items || [])] }, ...value.pages.slice(1)],
          });
        }
      });

      return { previousSchools };
    },
    onError: (_error, _variables, context) => {
      context?.previousSchools?.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all, refetchType: 'active' });
    },
  });
}

export function useDeleteSchoolMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, userRole }) => deleteSchool(schoolId, { userRole }),
    onMutate: async ({ schoolId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.schools.all });
      const previousSchools = queryClient.getQueriesData({ queryKey: queryKeys.schools.all });

      previousSchools.forEach(([key, value]) => {
        if (!value) return;
        if (value?.items) {
          queryClient.setQueryData(key, { ...value, items: value.items.filter((item) => String(item.id) !== String(schoolId)) });
          return;
        }
        if (value?.pages) {
          queryClient.setQueryData(key, {
            ...value,
            pages: value.pages.map((page) => ({
              ...page,
              items: (page.items || []).filter((item) => String(item.id) !== String(schoolId)),
            })),
          });
        }
      });

      return { previousSchools };
    },
    onError: (_error, _variables, context) => {
      context?.previousSchools?.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all, refetchType: 'active' });
    },
  });
}
