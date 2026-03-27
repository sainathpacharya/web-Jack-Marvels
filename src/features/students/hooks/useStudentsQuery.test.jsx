import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useBulkUploadStudentsMutation,
  useStudentsQuery,
  useUpdateStudentStatusMutation,
} from './useStudentsQuery';
import { queryKeys } from '../../../lib/queryKeys';

jest.mock('../../../api/students', () => ({
  getStudents: jest.fn(),
  bulkUploadStudents: jest.fn(),
  updateStudentStatus: jest.fn(),
}));

import { bulkUploadStudents, getStudents, updateStudentStatus } from '../../../api/students';

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

describe('useStudentsQuery hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches students list with useQuery', async () => {
    const params = { page: 0, size: 20, className: '', section: '', search: '', status: '', sortBy: '', sortDir: 'asc' };
    getStudents.mockResolvedValue({ items: [{ id: 1, name: 'A' }], totalElements: 1, totalPages: 1, page: 0, size: 20 });
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useStudentsQuery(params), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
    expect(getStudents).toHaveBeenCalledWith(params);
  });

  test('exposes error state when students fetch fails', async () => {
    const params = { page: 0, size: 20, className: '', section: '', search: '', status: '', sortBy: '', sortDir: 'asc' };
    getStudents.mockRejectedValue(new Error('Students failed'));
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useStudentsQuery(params), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Students failed');
  });

  test('invalidates students queries after bulk upload', async () => {
    bulkUploadStudents.mockResolvedValue({ successCount: 1, failureCount: 0 });
    const queryClient = createQueryClient();
    const listKey = queryKeys.students.list({ page: 0, size: 20 });
    queryClient.setQueryData(listKey, { items: [] });

    const { result } = renderHook(() => useBulkUploadStudentsMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ file: new Blob(['x']) });
    });

    const state = queryClient.getQueryState(listKey);
    expect(state?.isInvalidated).toBe(true);
  });

  test('invalidates students queries after status mutation', async () => {
    updateStudentStatus.mockResolvedValue({ ok: true });
    const queryClient = createQueryClient();
    const listKey = queryKeys.students.list({ page: 0, size: 20 });
    queryClient.setQueryData(listKey, { items: [{ id: 1, status: 'Active' }] });

    const { result } = renderHook(() => useUpdateStudentStatusMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ studentId: 1, active: false });
    });

    const state = queryClient.getQueryState(listKey);
    expect(state?.isInvalidated).toBe(true);
  });
});
