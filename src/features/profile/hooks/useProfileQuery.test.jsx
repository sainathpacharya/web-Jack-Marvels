import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfileQuery, useUpdateProfileMutation } from './useProfileQuery';
import { queryKeys } from '../../../lib/queryKeys';

jest.mock('../../../api/profile', () => ({
  fetchMyProfile: jest.fn(),
  updateMyProfile: jest.fn(),
}));

import { fetchMyProfile, updateMyProfile } from '../../../api/profile';

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

describe('useProfileQuery hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads profile data successfully', async () => {
    fetchMyProfile.mockResolvedValue({ userId: '1', fullName: 'John Doe', email: 'john@example.com' });
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useProfileQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.fullName).toBe('John Doe');
    expect(fetchMyProfile).toHaveBeenCalledTimes(1);
  });

  test('exposes query error state on profile fetch failure', async () => {
    fetchMyProfile.mockRejectedValue(new Error('Profile failed'));
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useProfileQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Profile failed');
  });

  test('updates profile cache after successful mutation', async () => {
    const initial = { userId: '1', fullName: 'John Doe', email: 'john@example.com' };
    const updated = { userId: '1', fullName: 'Jane Doe', email: 'jane@example.com' };
    updateMyProfile.mockResolvedValue(updated);
    const queryClient = createQueryClient();
    queryClient.setQueryData(queryKeys.profile.me, initial);

    const { result } = renderHook(() => useUpdateProfileMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ fullName: 'Jane Doe' });
    });

    expect(updateMyProfile).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(queryKeys.profile.me)).toEqual(updated);
  });
});
