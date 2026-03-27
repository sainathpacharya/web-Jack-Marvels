import { apiClient } from '../services/apiClient';
import { clearSession, getAccessToken, getCurrentUser, getMe, getRefreshToken, setSession } from '../auth/session';

export async function login({ username, password }) {
  // Backend login DTO expects { username, password, mobilenumber }.
  const data = await apiClient.post('/api/authenticateUser', { username, password, mobilenumber: '' }, { auth: false });

  // Backend returns an application-level ResponseDTO inside a 200 HTTP response.
  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Login failed');
  }

  return data?.response ?? data;
}

export async function registerUser(payload) {
  // Public endpoint: no Authorization required.
  const data = await apiClient.post('/api/registerUser', payload, { auth: false });
  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Registration failed');
  }
  return data;
}

export async function me() {
  // Not wired yet because backend OpenAPI does not expose a simple `/me` endpoint.
  // Prefer using `login()` response to populate `me` on the client.
  throw new Error('Profile endpoint not implemented');
}

/**
 * Change password while authenticated (e.g. first-login or voluntary rotation).
 * Backend contract (implement server-side): POST with current + new password; returns 200 and clears mustChangePassword on user.
 * Alternate paths can be added if your API differs.
 */
export async function changePassword({ currentPassword, newPassword }, { signal } = {}) {
  const body = {
    currentPassword: String(currentPassword ?? ''),
    newPassword: String(newPassword ?? ''),
  };
  const data = await apiClient.post('/api/changePassword', body, { signal });

  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Password change failed');
  }

  return data?.response ?? data?.data ?? data;
}

/**
 * After successful password change, sync stored user flags so the client stops forcing /change-password.
 */
export function clearMustChangePasswordInSession() {
  const user = getCurrentUser();
  if (!user) return;
  const next = {
    ...user,
    mustChangePassword: false,
    passwordChangeRequired: false,
    isFirstLogin: false,
    firstLogin: false,
    forcePasswordChange: false,
  };
  localStorage.setItem('user', JSON.stringify(next));
  setSession({
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    me: next,
  });
}

export async function logoutFromServer() {
  const user = getCurrentUser() || {};
  const me = getMe() || {};
  const userId = String(user.id ?? user.userId ?? user.user_id ?? me.id ?? me.userId ?? me.user_id ?? '').trim();
  const mobileNumber = String(user.mobileNumber ?? user.mobile ?? user.phone ?? me.mobileNumber ?? me.mobile ?? me.phone ?? '').trim();

  const headers = {
    'X-User-Role': 'SCHOOL',
    ...(userId ? { 'X-User-Id': userId } : {}),
    Accept: 'application/json',
  };

  const payload = mobileNumber ? { mobileNumber } : {};
  const endpoints = ['/api/v1/logout', '/api/logout'];

  for (const path of endpoints) {
    try {
      await apiClient.post(path, payload, { headers });
      break;
    } catch {
      // Try alias endpoint.
    }
  }

  // Always clear client session even if server logout fails.
  clearSession();
}

