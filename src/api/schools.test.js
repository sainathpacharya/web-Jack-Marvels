import { listSchools, deleteSchool } from './schools';

jest.mock('../services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

import { apiClient } from '../services/apiClient';

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
});

