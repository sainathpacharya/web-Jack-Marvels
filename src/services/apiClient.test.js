import { apiClient } from './apiClient';
import { clearSession, setSession } from '../auth/session';

function mockJsonResponse({ status = 200, payload = {}, headers = { 'content-type': 'application/json' } } = {}) {
  const json = jest.fn().mockResolvedValue(payload);
  const text = jest.fn().mockResolvedValue(typeof payload === 'string' ? payload : JSON.stringify(payload));

  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key) => headers[key.toLowerCase()] || headers[key] || null,
    },
    json,
    text,
  });
}

describe('apiClient', () => {
  beforeEach(() => {
    clearSession();
    jest.restoreAllMocks();
  });

  test('attaches Authorization header for authenticated requests', async () => {
    setSession({ accessToken: 'access123', refreshToken: '', me: undefined });

    global.fetch = jest.fn().mockImplementation(() =>
      mockJsonResponse({ status: 200, payload: { data: 'ok' }, headers: { 'content-type': 'application/json' } }),
    );

    const res = await apiClient.get('/api/test');
    expect(res).toEqual({ data: 'ok' });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.method).toBe('GET');
    expect(options.headers).toEqual(
      expect.objectContaining({
        Accept: 'application/json',
        Authorization: 'Bearer access123',
      }),
    );
  });

  test('refreshes access token on 401 and retries original request', async () => {
    setSession({ accessToken: 'oldAccess', refreshToken: 'refreshToken123', me: undefined });

    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url.endsWith('/api/protected')) {
        // First protected call returns 401.
        if (options.headers.Authorization === 'Bearer oldAccess') {
          return mockJsonResponse({ status: 401, payload: { message: 'unauthorized' } });
        }
        // Second protected call returns success.
        return mockJsonResponse({ status: 200, payload: { data: 'success' } });
      }
      if (url.endsWith('/api/auth/refresh')) {
        expect(options.method).toBe('POST');
        expect(JSON.parse(options.body)).toEqual({ refreshToken: 'refreshToken123' });
        return mockJsonResponse({ status: 200, payload: { accessToken: 'newAccess', refreshToken: 'newRefresh' } });
      }
      throw new Error(`Unexpected fetch url: ${url}`);
    });

    const res = await apiClient.get('/api/protected');
    expect(res).toEqual({ data: 'success' });

    // Ensure the retry used the new token.
    const protectedCalls = global.fetch.mock.calls.filter((c) => c[0].endsWith('/api/protected'));
    expect(protectedCalls).toHaveLength(2);
    const retryOptions = protectedCalls[1][1];
    expect(retryOptions.headers.Authorization).toBe('Bearer newAccess');
  });

  test('clears session and dispatches auth:logout when refresh fails', async () => {
    setSession({ accessToken: 'oldAccess', refreshToken: 'refreshToken123', me: undefined });

    const logoutHandler = jest.fn();
    window.addEventListener('auth:logout', logoutHandler);

    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url.endsWith('/api/protected')) {
        return mockJsonResponse({ status: 401, payload: { message: 'unauthorized' } });
      }
      if (url.endsWith('/api/auth/refresh')) {
        // Refresh succeeds but returns no accessToken => treated as failure.
        return mockJsonResponse({ status: 200, payload: { refreshToken: 'newRefresh' } });
      }
      throw new Error(`Unexpected fetch url: ${url}`);
    });

    await expect(apiClient.get('/api/protected')).rejects.toMatchObject({
      name: 'ApiError',
    });

    expect(logoutHandler).toHaveBeenCalledTimes(1);
    // Tokens should be cleared.
    expect(localStorage.getItem('alphavlogs.accessToken')).toBeNull();
    expect(localStorage.getItem('alphavlogs.refreshToken')).toBeNull();
    window.removeEventListener('auth:logout', logoutHandler);
  });
});

