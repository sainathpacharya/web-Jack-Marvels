import { apiClient } from '../services/apiClient';

function unwrap(data) {
  return data?.response ?? data?.data ?? data;
}

function normalizeStatus(value) {
  const text = String(value ?? '').trim().toLowerCase();
  return text === 'active' ? 'active' : 'inactive';
}

export function normalizeEventFromApi(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id ?? raw.eventId ?? '',
    name: String(raw.eventName ?? raw.name ?? '').trim(),
    status: normalizeStatus(raw.status),
    fromDate: raw.fromDate ?? raw.activeFromDate ?? null,
    toDate: raw.toDate ?? raw.activeToDate ?? null,
  };
}

export async function listEvents({ signal } = {}) {
  const data = await apiClient.get('/api/events', undefined, { signal });
  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Failed to fetch events');
  }
  const root = unwrap(data);
  const items = Array.isArray(root) ? root : [];
  return items.map(normalizeEventFromApi).filter(Boolean);
}

export async function updateEventStatus(eventId, status, { fromDate, toDate, signal } = {}) {
  const id = String(eventId ?? '').trim();
  const nextStatus = normalizeStatus(status);
  if (!id) throw new Error('eventId is required');
  const payload = { status: nextStatus };
  if (nextStatus === 'active') {
    payload.fromDate = String(fromDate ?? '').trim();
    payload.toDate = String(toDate ?? '').trim();
  }

  const data = await apiClient.patch(`/api/events/${encodeURIComponent(id)}/status`, payload, { signal });
  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Failed to update event status');
  }
  return unwrap(data);
}

