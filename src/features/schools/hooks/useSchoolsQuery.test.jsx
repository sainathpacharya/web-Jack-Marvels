import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCreateSchoolMutation,
  useDeleteSchoolMutation,
  useSchoolsQuery,
} from './useSchoolsQuery';
import { queryKeys } from '../../../lib/queryKeys';

jest.mock('../../../api/schools', () => ({
  listSchools: jest.fn(),
  createSchool: jest.fn(),
  deleteSchool: jest.fn(),
  normalizeSchoolFromApi: jest.fn((row) => row),
}));

import { createSchool, deleteSchool, listSchools } from '../../../api/schools';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient) {
  return function Wrapper({ children }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useSchoolsQuery hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches schools list from api', async () => {
    listSchools.mockResolvedValue({
      items: [{ id: 1, name: 'Alpha School' }],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    const queryClient = createQueryClient();
    const params = { page: 1, limit: 10, fallbackToStatic: false };

    const { result } = renderHook(() => useSchoolsQuery(params), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
    expect(listSchools).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  test('falls back to static data when api fails and fallback enabled', async () => {
    listSchools.mockRejectedValue(new Error('Schools failed'));
    const queryClient = createQueryClient();
    const params = { page: 1, limit: 10, fallbackToStatic: true };

    const { result } = renderHook(() => useSchoolsQuery(params), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(Array.isArray(result.current.data?.items)).toBe(true);
    expect(result.current.data?.items.length).toBeGreaterThan(0);
  });

  test('invalidates school queries after create/delete mutation', async () => {
    createSchool.mockResolvedValue({ id: 101, name: 'New School' });
    deleteSchool.mockResolvedValue({ ok: true });
    const queryClient = createQueryClient();
    const listKey = queryKeys.schools.list({ scope: 'admin', page: 1, limit: 10, fallbackToStatic: true });
    queryClient.setQueryData(listKey, { items: [] });

    const { result: createResult } = renderHook(() => useCreateSchoolMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await createResult.current.mutateAsync({ payload: { name: 'X' }, userId: 1, userRole: 'admin' });
    });

    let state = queryClient.getQueryState(listKey);
    expect(state?.isInvalidated).toBe(true);

    queryClient.setQueryData(listKey, { items: [{ id: 101, name: 'New School' }] });

    const { result: deleteResult } = renderHook(() => useDeleteSchoolMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await deleteResult.current.mutateAsync({ schoolId: 101, userRole: 'admin' });
    });

    state = queryClient.getQueryState(listKey);
    expect(state?.isInvalidated).toBe(true);
  });
});
