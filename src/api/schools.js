import { ApiError, apiClient } from '../services/apiClient';

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

function toCreateSchoolError(error) {
  if (!(error instanceof ApiError)) {
    return new Error(error?.message || 'Failed to create school');
  }

  const status = Number(error?.payload?.status || 0);
  const message = String(error?.message || '').trim();
  if (status === 409) {
    return new Error(message || 'School already exists. Email/branch code may already be in use.');
  }
  if (status === 403) {
    return new Error(message || 'You are not authorized to create schools.');
  }
  if (status === 400) {
    return new Error(message || 'Invalid school details. Please verify phone, pincode, and branch code.');
  }
  if (status === 500) {
    const devHint =
      import.meta.env.DEV && typeof window !== 'undefined' && window.location?.hostname === 'localhost'
        ? ' Check the Spring Boot console (Vite proxies /api to localhost:8080).'
        : '';
    return new Error((message || 'Server error while creating school.') + devHint);
  }
  return new Error(message || 'Failed to create school');
}

/** Prefer Spring JSON body (`message`, `error`) over generic HTTP fallback labels. */
function pickDetailedApiMessage(error) {
  if (!(error instanceof ApiError)) return '';
  const p = error.payload;
  if (!p || typeof p !== 'object') return '';
  const raw = p.raw;
  if (raw && typeof raw === 'object') {
    const fromMessage = typeof raw.message === 'string' ? raw.message.trim() : '';
    if (fromMessage) return fromMessage;
    const fromError = typeof raw.error === 'string' ? raw.error.trim() : '';
    if (fromError && !/^internal server error$/i.test(fromError)) return fromError;
  }
  const details = p.details;
  if (details && typeof details === 'object') {
    const dm = typeof details.message === 'string' ? details.message.trim() : '';
    if (dm) return dm;
    const de = typeof details.error === 'string' ? details.error.trim() : '';
    if (de && !/^internal server error$/i.test(de)) return de;
  }
  const top = typeof p.message === 'string' ? p.message.trim() : '';
  if (top && !/^server error$/i.test(top) && !/^something went wrong$/i.test(top)) return top;
  return '';
}

function toDeleteSchoolError(error) {
  if (!(error instanceof ApiError)) {
    return new Error(error?.message || 'Failed to delete school');
  }
  const status = Number(error?.payload?.status || 0);
  const message = String(error?.message || '').trim();
  const detailed = pickDetailedApiMessage(error);
  if (status === 403) {
    return new Error(detailed || message || 'You are not authorized to delete schools.');
  }
  if (status === 404) {
    return new Error(detailed || message || 'School not found.');
  }
  if (status === 408 || status === 0) {
    const devHint =
      import.meta.env.DEV && typeof window !== 'undefined' && window.location?.hostname === 'localhost'
        ? ' Start the API or set VITE_DEV_API_PROXY_TARGET.'
        : '';
    return new Error((detailed || message || 'Cannot reach server.') + devHint);
  }
  if (status === 500) {
    const devHint =
      import.meta.env.DEV && typeof window !== 'undefined' && window.location?.hostname === 'localhost'
        ? ' Check the Spring Boot console (Vite proxies /api to your backend).'
        : '';
    return new Error((detailed || message || 'Server error while deleting school.') + devHint);
  }
  return new Error(detailed || message || 'Failed to delete school');
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

export async function createSchool(payload, { userId: _userId, userRole: _userRole, signal } = {}) {
  // Custom X-User-* headers omitted: api.alphavlogs.com CORS does not list them; Spring uses JWT for identity/roles.
  const requestConfig = {
    headers: {
      Accept: 'application/json',
    },
    signal,
  };

  let data;
  try {
    // Preferred route in the latest backend.
    data = await apiClient.post('/api/schools', payload, requestConfig);
  } catch (error) {
    // Backward compatibility: some deployments still expose create-school at /api/addSchools.
    const status = error instanceof ApiError ? error.payload?.status : undefined;
    if (status && status !== 404 && status !== 405) throw toCreateSchoolError(error);
    try {
      data = await apiClient.post('/api/addSchools', payload, requestConfig);
    } catch (fallbackError) {
      throw toCreateSchoolError(fallbackError);
    }
  }

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
 * DELETE /api/deleteSchool/{schoolId} — canonical backend route (numeric id in path).
 * Spring: @PreAuthorize("hasRole('ADMIN')"). Success example: { "message": "School deleted successfully" }.
 * Falls back to DELETE /api/schools/{schoolId} on 404/405 only. Some deployments return 204 No Content.
 */
export async function deleteSchool(schoolId, { userRole: _userRole, signal } = {}) {
  const id = String(schoolId ?? '').trim();
  if (!id) throw new Error('schoolId is required');

  const headers = {
    Accept: 'application/json',
  };

  try {
    return await apiClient.delete(`/api/deleteSchool/${encodeURIComponent(id)}`, { headers, signal });
  } catch (error) {
    const status = error instanceof ApiError ? error.payload?.status : undefined;
    if (status && status !== 404 && status !== 405) throw toDeleteSchoolError(error);
    try {
      return await apiClient.delete(`/api/schools/${encodeURIComponent(id)}`, { headers, signal });
    } catch (fallbackError) {
      throw toDeleteSchoolError(fallbackError);
    }
  }
}
