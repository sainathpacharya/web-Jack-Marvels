import { apiClient } from '../services/apiClient';

function normalizeRoleHeader(role) {
  const value = String(role || '').trim().toLowerCase();
  if (value === 'promoter' || value === 'promotor') return 'PROMOTOR';
  if (value === 'school') return 'SCHOOL';
  if (value === 'super_admin' || value === 'super-admin' || value === 'superadmin') {
    return 'SUPER_ADMIN';
  }
  return 'ADMIN';
}

/** Map API school row to fields the dashboards already render. */
export function normalizeSchoolFromApi(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const createdOn = raw.createdOn;
  let addedAt = '';
  if (typeof createdOn === 'string' && createdOn.length >= 10) {
    addedAt = createdOn.slice(0, 10);
  } else if (raw.addedAt) {
    addedAt = String(raw.addedAt).slice(0, 10);
  }
  return {
    ...raw,
    id: raw.id,
    name: raw.name || '',
    email: raw.email || '',
    branchCode: raw.branchCode || raw.schoolCode || '',
    address: raw.address || '',
    city: raw.city || '',
    state: raw.state || '',
    pincode: raw.pincode || '',
    contactName: raw.contactName || raw.principalName || '',
    contactPhone: raw.contactPhone || raw.contactNumber || '',
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    studentsCount:
      raw.studentsCount != null && raw.studentsCount !== ''
        ? parseInt(raw.studentsCount, 10) || 0
        : 0,
    addedAt: addedAt || new Date().toISOString().slice(0, 10),
    addedByPromoterId: raw.addedByPromoterId ?? null,
  };
}

function unwrapSchoolsListPayload(data) {
  if (!data || typeof data !== 'object') return null;
  let inner = data.data;
  if (inner == null && data.response != null && typeof data.response === 'object') {
    inner = data.response.data ?? data.response;
  }
  if (inner == null && Array.isArray(data.items)) {
    inner = data;
  }
  if (inner == null || typeof inner !== 'object') return null;
  const items = inner.items ?? inner.content ?? [];
  if (!Array.isArray(items)) return null;
  const limit = typeof inner.limit === 'number' && inner.limit > 0 ? inner.limit : 10;
  const total = typeof inner.total === 'number' ? inner.total : items.length;
  const page = typeof inner.page === 'number' ? inner.page : 1;
  const totalPages =
    typeof inner.totalPages === 'number'
      ? inner.totalPages
      : Math.max(1, Math.ceil(total / limit));
  return { items, total, page, limit, totalPages };
}

/**
 * GET /api/schools?page=&limit=
 * Response shape: { data: { total, limit, totalPages, page, items }, message }
 */
export async function listSchools({ page = 1, limit = 10, signal } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  const data = await apiClient.get(`/api/schools?${params.toString()}`, undefined, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Failed to fetch schools');
  }

  const unwrapped = unwrapSchoolsListPayload(data);
  if (!unwrapped) {
    throw new Error(data?.message || 'Unexpected schools list response');
  }

  return {
    items: unwrapped.items.map(normalizeSchoolFromApi),
    total: unwrapped.total,
    page: unwrapped.page,
    limit: unwrapped.limit,
    totalPages: Math.max(1, unwrapped.totalPages),
  };
}

export async function createSchool(payload, { userId, userRole, signal } = {}) {
  // Spring registers POST /api/schools (same handler as /api/addSchools when backend is current).
  const data = await apiClient.post(
    '/api/schools',
    payload,
    {
      headers: {
        Accept: 'application/json',
        'X-User-Id': String(userId ?? 1),
        'X-User-Role': normalizeRoleHeader(userRole),
      },
      signal,
    }
  );

  if (typeof data?.statusCode === 'number' && data.statusCode !== 200 && data.statusCode !== 201) {
    throw new Error(data?.response || data?.message || 'Failed to create school');
  }

  const inner = data?.data ?? data?.response ?? data;
  if (inner && typeof inner === 'object' && inner.school != null) {
    return inner.school;
  }
  return inner;
}

/**
 * DELETE /api/deleteSchool/{schoolId}
 * Authorization: header-based role mapping using `X-User-Role` only.
 */
export async function deleteSchool(schoolId, { userRole, signal } = {}) {
  const id = String(schoolId ?? '').trim();
  if (!id) throw new Error('schoolId is required');

  // Some backends return 204 No Content.
  const data = await apiClient.delete(`/api/deleteSchool/${encodeURIComponent(id)}`, {
    headers: {
      Accept: 'application/json',
      'X-User-Role': normalizeRoleHeader(userRole),
    },
    signal,
  });
  return data;
}
