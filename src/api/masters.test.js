import { apiClient } from '../services/apiClient';
import { isServerMasterId, setMasterActive } from './masters';

jest.mock('../services/apiClient', () => ({
  apiClient: {
    patch: jest.fn(),
  },
}));

describe('masters API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('isServerMasterId rejects temp and timestamp ids', () => {
    expect(isServerMasterId('temp-123')).toBe(false);
    expect(isServerMasterId(Date.now())).toBe(false);
    expect(isServerMasterId(42)).toBe(true);
    expect(isServerMasterId('901')).toBe(true);
  });

  test('setMasterActive PATCHes unified status route', async () => {
    apiClient.patch.mockResolvedValueOnce({
      message: 'Status updated successfully',
      data: { entityType: 'school', id: 3, active: false },
    });

    const result = await setMasterActive('school', 3, false);

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/masters/school/3/status',
      { active: false },
      { signal: undefined }
    );
    expect(result).toEqual({ entityType: 'school', id: 3, active: false });
  });
});
