import { getAccessToken, getRefreshToken, setSession, clearSession } from '../auth/session';

// Default to relative URLs so `fetch('/api/...')` goes through Vite's dev proxy.
// If you set `VITE_API_BASE_URL`, we will use it as an absolute base.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function tryRefreshToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function apiFetch(path, { method = 'GET', headers, body, auth = true } = {}) {
  const url = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const h = { ...(headers || {}) };

  if (auth) {
    const token = getAccessToken();
    if (token) h.Authorization = `Bearer ${token}`;
  }

  let res = await fetch(url, { method, headers: h, body });

  if (auth && res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (!refreshed?.accessToken) {
      clearSession();
      return res;
    }
    setSession({ accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken });
    h.Authorization = `Bearer ${refreshed.accessToken}`;
    res = await fetch(url, { method, headers: h, body });
  }

  return res;
}

export function getApiBaseUrl() {
  return BASE_URL;
}

