import { apiClient } from '../services/apiClient';

export async function getDashBoardDetails({ signal } = {}) {
  const data = await apiClient.get('/api/dashBoardDetails', undefined, { auth: true, signal });
  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Failed to fetch dashboard details');
  }
  return data?.response ?? data;
}

export async function getPublicSummaryCount({ signal } = {}) {
  const data = await apiClient.get('/api/public/summary-count', undefined, {
    auth: false,
    signal,
  });

  const root = data?.response ?? data ?? {};
  return {
    activeSchools: Number(root.activeSchools ?? 0) || 0,
    activeStudents: Number(root.activeStudents ?? 0) || 0,
  };
}

export async function getPublicEvents({ signal } = {}) {
  const data = await apiClient.get('/api/public/events', undefined, {
    auth: false,
    signal,
  });

  const root = data?.response ?? data ?? [];
  if (!Array.isArray(root)) return [];

  const apiBaseUrl = apiClient.getApiBaseUrl?.() || '';
  const fallbackBackendOrigin =
    typeof window !== 'undefined'
      ? import.meta.env.DEV
        ? 'http://localhost:8080'
        : window.location.origin
      : '';
  const resolveMediaUrl = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('/')) {
      if (apiBaseUrl) return `${apiBaseUrl}${raw}`;
      if (fallbackBackendOrigin) return `${fallbackBackendOrigin}${raw}`;
      return raw;
    }
    return raw;
  };

  return root.map((event) => ({
    id: event?.id,
    title: String(event?.eventName ?? '').trim(),
    desc: 'Participate, showcase your talent, and win recognition.',
    mediaUrl: resolveMediaUrl(event?.eventGifOrImage),
  }));
}

