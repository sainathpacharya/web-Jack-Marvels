import { apiFetch } from './client';

export async function getDashBoardDetails() {
  const res = await apiFetch('/api/dashBoardDetails', { method: 'GET', auth: true });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || 'Failed to fetch dashboard details';
    throw new Error(msg);
  }

  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Failed to fetch dashboard details');
  }

  return data?.response ?? data;
}

