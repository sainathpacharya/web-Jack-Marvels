import { fetchMyProfile, updateMyProfile } from './profile';

jest.mock('../services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock('../auth/session', () => ({
  getCurrentUser: jest.fn(),
  setCurrentUser: jest.fn(),
}));

import { apiClient } from '../services/apiClient';
import { getCurrentUser, setCurrentUser } from '../auth/session';

describe('profile api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchMyProfile', () => {
    test('normalizes and trims profile from /api/v1/profile when available', async () => {
      apiClient.get.mockResolvedValue({
        data: {
          id: 1,
          fullName: '  John Doe  ',
          email: ' john@example.com ',
          mobileNumber: ' 1234567890 ',
          roleName: ' ADMIN ',
          createdAt: ' 2020-01-01 ',
          address: ' Somewhere ',
          profilePicture: ' pic.png ',
        },
      });

      getCurrentUser.mockReturnValue({});

      const res = await fetchMyProfile();
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/profile', undefined, { headers: { Accept: 'application/json' } });
      expect(res).toEqual({
        userId: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        role: 'ADMIN',
        createdAt: '2020-01-01',
        address: 'Somewhere',
        profilePicture: 'pic.png',
      });
    });

    test('falls back to /api/profile when /api/v1/profile fails', async () => {
      apiClient.get
        .mockRejectedValueOnce(new Error('nope'))
      .mockResolvedValueOnce({
        data: {
          user_id: 2,
          name: '  Jane  ',
          username: ' jane@example.com ',
          mobile: ' 0987654321 ',
          role: ' SCHOOL ',
          created_date: ' 2021-02-03 ',
          address: ' Addr ',
          photo: ' photo.jpg ',
        },
      });

      const res = await fetchMyProfile();
      expect(apiClient.get).toHaveBeenNthCalledWith(
        1,
        '/api/v1/profile',
        undefined,
        { headers: { Accept: 'application/json' } },
      );
      expect(apiClient.get).toHaveBeenNthCalledWith(
        2,
        '/api/profile',
        undefined,
        { headers: { Accept: 'application/json' } },
      );
      expect(res.fullName).toBe('Jane');
      expect(res.userId).toBe('2');
    });

    test('falls back to local current user when both endpoints fail', async () => {
      apiClient.get.mockRejectedValue(new Error('fail'));
      getCurrentUser.mockReturnValue({
        id: 3,
        fullName: ' Local Name ',
        email: ' local@example.com ',
        phone: ' 1111111111 ',
        role: ' PROMOTOR ',
        createdAt: ' 2022-01-01 ',
        address: ' Local Addr ',
        profilePicture: ' local.png ',
      });

      const res = await fetchMyProfile();
      expect(res.fullName).toBe('Local Name');
      expect(res.userId).toBe('3');
    });
  });

  describe('updateMyProfile', () => {
    test('updates server profile and merges it into current user', async () => {
      getCurrentUser.mockReturnValue({
        id: '10',
        name: 'Old',
        fullName: 'Old',
        email: 'old@example.com',
        username: 'old@example.com',
        mobileNumber: '000',
        phone: '000',
        address: 'Old Addr',
        profilePicture: 'old.png',
      });

      apiClient.put.mockResolvedValue({
        data: {
          id: '10',
          fullName: ' New Name ',
          email: ' new@example.com ',
          mobileNumber: ' 2222222222 ',
          roleName: 'ADMIN',
          createdAt: '2020-01-01',
          address: 'New Addr',
          profilePicture: 'new.png',
        },
      });

      const payload = {
        fullName: 'New Name',
        email: 'new@example.com ',
        phone: '2222222222',
        address: 'New Addr',
        profilePicture: 'new.png',
      };

      const res = await updateMyProfile(payload);
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/v1/profile',
        {
          fullName: 'New Name',
          email: 'new@example.com',
          mobileNumber: '2222222222',
          address: 'New Addr',
          profilePicture: 'new.png',
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        }),
      );
      expect(setCurrentUser).toHaveBeenCalled();
      expect(res.fullName).toBe('New Name');
    });

    test('falls back to local update and throws when both endpoints fail', async () => {
      getCurrentUser.mockReturnValue({
        id: '10',
        name: 'Old',
        fullName: 'Old',
        email: 'old@example.com',
        username: 'old@example.com',
        mobileNumber: '000',
        phone: '000',
        address: 'Old Addr',
        profilePicture: 'old.png',
      });

      apiClient.put.mockRejectedValue(new Error('put failed'));

      const payload = {
        fullName: ' New Name ',
        email: 'new@example.com ',
        phone: '2222222222',
        address: 'New Addr',
        profilePicture: 'new.png',
      };

      await expect(updateMyProfile(payload)).rejects.toThrow(/put failed/i);
      expect(setCurrentUser).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'New Name',
          name: 'New Name',
          email: 'new@example.com',
          mobileNumber: '2222222222',
          phone: '2222222222',
          address: 'New Addr',
          profilePicture: 'new.png',
        }),
      );
    });
  });
});

