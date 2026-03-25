import { apiFetch } from './client';

export async function login({ username, password }) {
  const res = await apiFetch('/api/authenticateUser', {
    method: 'POST',
    auth: false,
    headers: { 'Content-Type': 'application/json' },
    // Backend login DTO expects { username, password, mobilenumber }
    body: JSON.stringify({ username, password, mobilenumber: '' }),
  });
  const data = await res.json().catch(() => null);

  // Backend returns an application-level ResponseDTO inside a 200 HTTP response.
  if (!res.ok) {
    const msg = data?.message || 'Login failed';
    throw new Error(msg);
  }

  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Login failed');
  }

  return data?.response ?? data;
}

export async function me() {
  // Not wired yet because backend OpenAPI does not expose a simple `/me` endpoint.
  // Prefer using `login()` response to populate `me` on the client.
  throw new Error('Profile endpoint not implemented');
}

