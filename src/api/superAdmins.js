import { apiClient } from '../services/apiClient';

function unwrap(data) {
  return data?.response ?? data?.data ?? data;
}

function assertOk(data) {
  if (typeof data?.statusCode === 'number' && data.statusCode !== 200 && data.statusCode !== 201) {
    throw new Error(data?.response || data?.message || 'Request failed');
  }
}

export function normalizeSuperAdminFromApi(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const active =
    typeof raw.active === 'boolean'
      ? raw.active
      : raw.status === true || String(raw.status).toLowerCase() === 'active';
  return {
    id: raw.id ?? raw.userId ?? '',
    name: String(raw.name ?? raw.employeeName ?? '').trim(),
    email: String(raw.email ?? raw.emailId ?? '').trim(),
    mobileNumber: String(raw.mobileNumber ?? raw.mobile ?? raw.phone ?? '').trim(),
    active,
  };
}

function unwrapListPayload(data) {
  const root = unwrap(data);
  if (!root || typeof root !== 'object') return null;
  const items = root.items ?? root.content ?? root.data ?? [];
  if (!Array.isArray(items)) return null;
  const limit =
    typeof root.limit === 'number' && root.limit > 0
      ? root.limit
      : typeof root.size === 'number' && root.size > 0
        ? root.size
        : 10;
  const total =
    typeof root.total === 'number'
      ? root.total
      : typeof root.totalElements === 'number'
        ? root.totalElements
        : items.length;
  let page = typeof root.page === 'number' ? root.page : 1;
  if (typeof root.number === 'number' && root.number >= 0) {
    page = root.number + 1;
  }
  const totalPages =
    typeof root.totalPages === 'number'
      ? root.totalPages
      : Math.max(1, Math.ceil(total / limit));
  return { items, total, page, limit, totalPages };
}

const BASE_PATH = '/api/super-admins';

/** POST — ADMIN only. Server must provision credentials securely (no predictable defaults). */
export async function createSuperAdmin({ name, email, mobileNumber }, { signal } = {}) {
  const payload = {
    name: String(name ?? '').trim(),
    email: String(email ?? '').trim(),
    mobileNumber: String(mobileNumber ?? '').replace(/\s/g, ''),
  };
  const data = await apiClient.post(BASE_PATH, payload, { signal });
  assertOk(data);
  const row = unwrap(data);
  return normalizeSuperAdminFromApi(row?.user ?? row) || row;
}

/**
 * GET — any authenticated user. Paginated list.
 */
export async function listSuperAdmins(
  { page = 1, limit = 10, search = '', status, signal } = {}
) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (search) params.set('search', String(search).trim());
  if (status === true || status === false) params.set('status', String(status));

  const data = await apiClient.get(`${BASE_PATH}?${params.toString()}`, undefined, { signal });
  assertOk(data);
  const unwrapped = unwrapListPayload(data);
  if (!unwrapped) {
    const fallback = unwrap(data);
    const arr = Array.isArray(fallback) ? fallback : [];
    return {
      items: arr.map(normalizeSuperAdminFromApi).filter(Boolean),
      total: arr.length,
      page: 1,
      limit,
      totalPages: 1,
    };
  }
  return {
    ...unwrapped,
    items: unwrapped.items.map(normalizeSuperAdminFromApi).filter(Boolean),
  };
}

/**
 * PATCH — ADMIN only (active / inactive)
 */
export async function updateSuperAdminStatus(userId, active, { signal } = {}) {
  const id = String(userId ?? '').trim();
  if (!id) throw new Error('userId is required');
  const data = await apiClient.patch(
    `${BASE_PATH}/${encodeURIComponent(id)}/status`,
    { active: Boolean(active) },
    { signal }
  );
  assertOk(data);
  return unwrap(data);
}

/**
 * PATCH — ADMIN only (min 8 chars)
 */
export async function resetSuperAdminPassword(userId, newPassword, { signal } = {}) {
  const id = String(userId ?? '').trim();
  if (!id) throw new Error('userId is required');
  const data = await apiClient.patch(
    `${BASE_PATH}/${encodeURIComponent(id)}/reset-password`,
    { newPassword: String(newPassword ?? '') },
    { signal }
  );
  assertOk(data);
  return unwrap(data);
}
