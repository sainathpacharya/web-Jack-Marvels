import { getDashBoardDetails } from './dashboard';

jest.mock('../services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

import { apiClient } from '../services/apiClient';

describe('dashboard api', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns response payload on success', async () => {
    apiClient.get.mockResolvedValue({ statusCode: 200, response: { Results: [] } });
    await expect(getDashBoardDetails()).resolves.toEqual({ Results: [] });
  });

  test('throws when statusCode is not 200', async () => {
    apiClient.get.mockResolvedValue({ statusCode: 500, message: 'server' });
    await expect(getDashBoardDetails()).rejects.toThrow(/failed to fetch dashboard details|server/i);
  });
});

