import { login, registerUser, logoutFromServer } from './auth';

jest.mock('../services/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

jest.mock('../auth/session', () => ({
  clearSession: jest.fn(),
  getCurrentUser: jest.fn(),
  getMe: jest.fn(),
}));

import { apiClient } from '../services/apiClient';
import { clearSession, getCurrentUser, getMe } from '../auth/session';

describe('auth api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login posts with auth disabled and returns response body', async () => {
    apiClient.post.mockResolvedValue({
      statusCode: 200,
      response: { accessToken: 'a', me: { roleId: 1 } },
    });

    const res = await login({ username: '  user  ', password: 'pass' });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/authenticateUser',
      { username: '  user  ', password: 'pass', mobilenumber: '' },
      { auth: false },
    );
    expect(res).toEqual({ accessToken: 'a', me: { roleId: 1 } });
  });

  test('throws when login returns non-200 statusCode', async () => {
    apiClient.post.mockResolvedValue({ statusCode: 401, message: 'nope', response: 'bad' });
    await expect(login({ username: 'u', password: 'p' })).rejects.toThrow(/login failed|bad/i);
  });

  test('registerUser posts with auth disabled and returns data', async () => {
    apiClient.post.mockResolvedValue({ statusCode: 200, data: { ok: true } });
    const payload = { fullName: 'A', email: 'a@a.com' };
    const res = await registerUser(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/api/registerUser', payload, { auth: false });
    expect(res).toEqual({ statusCode: 200, data: { ok: true } });
  });

  test('logoutFromServer tries /api/v1/logout then falls back to /api/logout, and always clears session', async () => {
    getCurrentUser.mockReturnValue({ id: 7, mobileNumber: '9999999999' });
    getMe.mockReturnValue({});

    apiClient.post.mockImplementationOnce(() => Promise.reject(new Error('fail'))).mockResolvedValueOnce({});

    await logoutFromServer();

    expect(apiClient.post).toHaveBeenNthCalledWith(
      1,
      '/api/v1/logout',
      { mobileNumber: '9999999999' },
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          'X-User-Role': 'SCHOOL',
          'X-User-Id': '7',
        }),
      }),
    );

    expect(apiClient.post).toHaveBeenNthCalledWith(
      2,
      '/api/logout',
      { mobileNumber: '9999999999' },
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          'X-User-Role': 'SCHOOL',
          'X-User-Id': '7',
        }),
      }),
    );

    expect(clearSession).toHaveBeenCalledTimes(1);
  });
});

