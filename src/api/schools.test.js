import { listSchools, deleteSchool } from './schools';

jest.mock('../services/apiClient', () => {
  class ApiError extends Error {
    constructor(payload) {
      super(payload?.message || 'Something went wrong');
      this.name = 'ApiError';
      this.payload = payload;
    }
  }
  return {
    ApiError,
    apiClient: {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
    },
  };
});

import { ApiError, apiClient } from '../services/apiClient';

describe('schools api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('listSchools normalizes API response items', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        items: [
          {
            id: 10,
            name: 'Sunshine High School',
            email: 's@school.com',
            schoolCode: 'SCH01',
            branchCode: 'B01',
            address: 'Addr',
            city: 'City',
            state: 'State',
            pincode: '123456',
            principalName: 'Principal',
            contactNumber: '999',
            status: 'inactive',
            studentsCount: '25',
            createdOn: '2024-05-01T00:00:00.000Z',
            addedByPromoterId: 3,
          },
        ],
        total: 1,
        limit: 10,
        totalPages: 1,
        page: 1,
      },
      statusCode: 200,
    });

    const res = await listSchools({ page: 1, limit: 10 });
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/schools?page=1&limit=10'),
      undefined,
      { headers: { Accept: 'application/json' } },
    );

    expect(res.items).toHaveLength(1);
    expect(res.items[0]).toMatchObject({
      id: 10,
      name: 'Sunshine High School',
      branchCode: 'B01',
      status: 'inactive',
      studentsCount: 25,
      addedAt: '2024-05-01',
    });
  });

  test('deleteSchool throws when schoolId is missing', async () => {
    await expect(deleteSchool('')).rejects.toThrow(/schoolid is required/i);
  });

  test('deleteSchool uses DELETE /api/deleteSchool/:id', async () => {
    apiClient.delete.mockResolvedValueOnce({ message: 'School deleted successfully' });
    const res = await deleteSchool(42, { userRole: 'admin' });
    expect(res).toEqual({ message: 'School deleted successfully' });
    expect(apiClient.delete).toHaveBeenCalledWith('/api/deleteSchool/42', {
      headers: { Accept: 'application/json' },
      signal: undefined,
    });
  });

  test('deleteSchool falls back to /api/schools/:id on 404', async () => {
    apiClient.delete
      .mockRejectedValueOnce(new ApiError({ message: 'Not Found', status: 404 }))
      .mockResolvedValueOnce({ statusCode: 200 });
    await deleteSchool(7, { userRole: 'admin' });
    expect(apiClient.delete).toHaveBeenNthCalledWith(1, '/api/deleteSchool/7', expect.any(Object));
    expect(apiClient.delete).toHaveBeenNthCalledWith(2, '/api/schools/7', expect.any(Object));
  });
});

