import { ApiError, apiClient } from '../services/apiClient';

/** @typedef {'influencer' | 'promotor' | 'partner' | 'teacher' | 'school' | 'student'} MasterEntityType */

export const MASTER_ENTITY_TYPES = Object.freeze({
  INFLUENCER: 'influencer',
  PROMOTOR: 'promotor',
  PARTNER: 'partner',
  TEACHER: 'teacher',
  SCHOOL: 'school',
  STUDENT: 'student',
});

function unwrap(data) {
  return data?.response ?? data?.data ?? data;
}

function assertOk(data) {
  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Request failed');
  }
}

/**
 * True when `id` looks like a backend primary key (not client-only `Date.now()` / temp ids).
 */
export function isServerMasterId(id) {
  const raw = String(id ?? '').trim();
  if (!raw || raw.startsWith('temp-')) return false;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return false;
  // Local admin rows use `Date.now()` (~1.7e12); DB ids are typically much smaller.
  return n < 1_000_000_000_000;
}

/**
 * PATCH /api/masters/{entityType}/{id}/status — body `{ active: boolean }`.
 * @param {MasterEntityType} entityType
 * @param {string | number} id
 * @param {boolean} active
 */
export async function setMasterActive(entityType, id, active, { signal } = {}) {
  const type = String(entityType ?? '').trim().toLowerCase();
  const recordId = String(id ?? '').trim();
  if (!type) throw new Error('entityType is required');
  if (!recordId) throw new Error('id is required');

  const data = await apiClient.patch(
    `/api/masters/${encodeURIComponent(type)}/${encodeURIComponent(recordId)}/status`,
    { active: Boolean(active) },
    { signal }
  );

  assertOk(data);
  return unwrap(data);
}

export async function setSchoolActive(schoolId, active, options) {
  return setMasterActive(MASTER_ENTITY_TYPES.SCHOOL, schoolId, active, options);
}

export async function setStudentActive(studentId, active, options) {
  return setMasterActive(MASTER_ENTITY_TYPES.STUDENT, studentId, active, options);
}

export async function setInfluencerActive(influencerId, active, options) {
  return setMasterActive(MASTER_ENTITY_TYPES.INFLUENCER, influencerId, active, options);
}

export async function setPromotorActive(promotorId, active, options) {
  return setMasterActive(MASTER_ENTITY_TYPES.PROMOTOR, promotorId, active, options);
}

export async function setTeacherActive(teacherId, active, options) {
  return setMasterActive(MASTER_ENTITY_TYPES.TEACHER, teacherId, active, options);
}

export { ApiError };
