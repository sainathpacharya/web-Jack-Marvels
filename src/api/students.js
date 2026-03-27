import { getCurrentUser, getMe } from '../auth/session';
import { apiClient } from '../services/apiClient';

let cachedXlsxModule = null;

async function loadXlsx() {
  if (!cachedXlsxModule) {
    cachedXlsxModule = await import('xlsx');
  }
  return cachedXlsxModule;
}

export function prefetchXlsx() {
  // Fire-and-forget optimization for user-intent based prefetch.
  // Consumers can call this on hover/focus of upload CTA.
  loadXlsx().catch(() => {});
}

function unwrap(data) {
  if (!data || typeof data !== 'object') return data;
  return data.data ?? data.response ?? data;
}

function getSchoolHeaders() {
  const user = getCurrentUser() || {};
  const me = getMe() || {};
  const userId = String(
    user.id ??
      user.userId ??
      user.user_id ??
      me.id ??
      me.userId ??
      me.user_id ??
      user.schoolId ??
      user.school_id ??
      ''
  ).trim();
  return {
    'X-User-Id': userId || '0',
    'X-User-Role': 'SCHOOL',
  };
}

const NEW_HEADERS = ['rollNumber', 'firstName', 'lastName', 'mobileNumber', 'emailId', 'class', 'section'];
const OLD_HEADERS = ['Student Name', 'Mobile Number', 'Email', 'Class', 'Section'];

function splitName(value) {
  const full = String(value || '').trim();
  if (!full) return { firstName: '', lastName: '' };
  const [firstName, ...rest] = full.split(/\s+/);
  return { firstName: firstName || '', lastName: rest.join(' ') || '' };
}

function normalizeRecord(row) {
  if (row.firstName !== undefined || row.lastName !== undefined) {
    return {
      firstName: String(row.firstName ?? '').trim(),
      lastName: String(row.lastName ?? '').trim(),
      mobileNumber: String(row.mobileNumber ?? '').trim(),
      emailId: String(row.emailId ?? '').trim(),
      class: String(row.class ?? '').trim(),
      section: String(row.section ?? '').trim(),
      rollNumber: String(row.rollNumber ?? row['Roll Number'] ?? '').trim(),
    };
  }

  if (row['Student Name'] !== undefined || row['Mobile Number'] !== undefined) {
    const split = splitName(row['Student Name']);
    return {
      firstName: split.firstName,
      lastName: split.lastName,
      mobileNumber: String(row['Mobile Number'] ?? '').trim(),
      emailId: String(row.Email ?? '').trim(),
      class: String(row.Class ?? '').trim(),
      section: String(row.Section ?? '').trim(),
      rollNumber: '',
    };
  }

  return null;
}

async function transformUploadFile(file) {
  const lowerName = String(file?.name || '').toLowerCase();
  const isCsv = lowerName.endsWith('.csv');
  const isXlsx = lowerName.endsWith('.xlsx');
  if (!isCsv && !isXlsx) {
    throw new Error('Invalid file type. Please upload .xlsx or .csv');
  }

  let XLSX;
  try {
    XLSX = await loadXlsx();
  } catch {
    throw new Error('Failed to load Excel parser. Please retry.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (!rows.length) return file;

  const firstRow = rows[0] || {};
  const hasNew = NEW_HEADERS.every((key) => Object.prototype.hasOwnProperty.call(firstRow, key));
  const hasOld = OLD_HEADERS.every((key) => Object.prototype.hasOwnProperty.call(firstRow, key));
  if (!hasOld || hasNew) return file;

  const normalized = rows.map(normalizeRecord).filter(Boolean);
  const nextSheet = XLSX.utils.json_to_sheet(normalized, { header: NEW_HEADERS });
  const nextWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(nextWb, nextSheet, 'Students');

  if (isCsv) {
    const csv = XLSX.utils.sheet_to_csv(nextSheet, { FS: ',', RS: '\n' });
    return new File([csv], file.name, { type: 'text/csv' });
  }

  const out = XLSX.write(nextWb, { type: 'array', bookType: 'xlsx' });
  return new File([out], file.name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function looksLikeEmail(value) {
  const text = String(value ?? '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function looksLikeMobile(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length === 10;
}

function normalizeFailure(raw) {
  const source = raw || {};
  let mobileNumber = String(source.mobileNumber ?? source.mobile ?? source.phone ?? '').trim();
  let emailId = String(source.emailId ?? source.email ?? '').trim();

  // Defensive swap: some backends return email/mobile in reversed keys.
  if (looksLikeEmail(mobileNumber) && looksLikeMobile(emailId)) {
    const prev = mobileNumber;
    mobileNumber = emailId;
    emailId = prev;
  }

  return {
    rowNumber: source.rowNumber ?? source.row ?? '-',
    reason: String(source.reason ?? source.error ?? 'Validation failed'),
    mobileNumber,
    emailId,
  };
}

function toStudent(raw) {
  const firstName = String(raw?.firstName ?? raw?.first_name ?? '').trim();
  const lastName = String(raw?.lastName ?? raw?.last_name ?? '').trim();
  const name =
    String(raw?.name ?? '').trim() ||
    `${firstName} ${lastName}`.trim() ||
    String(raw?.studentName ?? '').trim();

  const isActive = typeof raw?.active === 'boolean' ? raw.active : typeof raw?.status === 'boolean' ? raw.status : undefined;
  const statusText =
    typeof isActive === 'boolean'
      ? isActive
        ? 'Active'
        : 'Inactive'
      : String(raw?.status ?? 'Active').trim() || 'Active';

  return {
    id: raw?.id ?? raw?.studentId ?? `${raw?.mobileNumber ?? ''}-${name}`,
    firstName,
    lastName,
    name: name || '-',
    mobileNumber: String(raw?.mobileNumber ?? raw?.mobile ?? raw?.phone ?? '').trim(),
    emailId: String(raw?.emailId ?? raw?.email ?? '').trim(),
    className: String(raw?.studentClass ?? raw?.class ?? raw?.className ?? '').trim(),
    section: String(raw?.section ?? '').trim(),
    status: statusText,
  };
}

function normalizeStudentsListPayload(payload) {
  const root = unwrap(payload);
  const items = root?.items ?? root?.content ?? root?.students ?? [];
  const totalElements = root?.totalElements ?? root?.total ?? root?.count ?? items.length;
  const backendPage = root?.page ?? root?.number ?? 1;
  const size = root?.size ?? root?.limit ?? 20;
  const page = Math.max(0, Number(backendPage) - 1);
  const totalPages = root?.totalPages ?? Math.max(1, Math.ceil(totalElements / Math.max(size, 1)));
  return {
    items: Array.isArray(items) ? items.map(toStudent) : [],
    totalElements: Number(totalElements) || 0,
    page: Number(page) || 0,
    size: Number(size) || 20,
    totalPages: Number(totalPages) || 1,
  };
}

export async function downloadStudentsTemplate() {
  const anchor = document.createElement('a');
  anchor.href = '/templates/student-upload-template.xlsx';
  anchor.download = 'student-upload-template.xlsx';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function getStudentsTemplateUrl() {
  return '/templates/student-upload-template.xlsx';
}

export async function bulkUploadStudents(file, onProgress) {
  const transformedFile = await transformUploadFile(file);
  const formData = new FormData();
  formData.append('file', transformedFile);

  const schoolHeaders = getSchoolHeaders();
  const result = await apiClient.multipart('/api/v1/students/bulk-upload', formData, {
    headers: {
      Accept: 'application/json',
      ...schoolHeaders,
    },
    onUploadProgress: onProgress,
  });

  const root = unwrap(result) || {};
  return {
    totalRows: Number(root.totalRows ?? 0) || 0,
    successCount: Number(root.successCount ?? root.success ?? 0) || 0,
    failureCount: Number(root.failureCount ?? root.failedCount ?? 0) || 0,
    failures: Array.isArray(root.failures) ? root.failures.map(normalizeFailure) : [],
    message: String(root.message ?? result?.message ?? ''),
  };
}

export async function getStudents({
  page = 0,
  size = 20,
  className = '',
  section = '',
  search = '',
  status = '',
  sortBy = '',
  sortDir = '',
  signal,
} = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page + 1));
  params.set('limit', String(size));
  if (className) params.set('class', className);
  if (section) params.set('section', section);
  if (search) params.set('search', search);
  if (status === 'active') params.set('status', 'true');
  if (status === 'inactive') params.set('status', 'false');
  if (sortBy) params.set('sortBy', sortBy);
  if (sortDir) params.set('sortDir', sortDir);

  const data = await apiClient.get(`/api/v1/students/school/list?${params.toString()}`, undefined, {
    headers: { Accept: 'application/json', ...getSchoolHeaders() },
    signal,
  });
  return normalizeStudentsListPayload(data);
}

export async function updateStudentStatus(studentId, active, { signal } = {}) {
  const data = await apiClient.put(
    `/api/students/${studentId}/status`,
    { active: Boolean(active) },
    {
      headers: { Accept: 'application/json', ...getSchoolHeaders() },
      signal,
    }
  );
  return unwrap(data);
}

export async function getStudentsSummary({ signal } = {}) {
  const data = await apiClient.get('/api/students/summary', undefined, {
    headers: { Accept: 'application/json', ...getSchoolHeaders() },
    signal,
  });
  const root = unwrap(data) || {};
  return {
    totalStudents: Number(root.totalStudents ?? root.total ?? 0) || 0,
    participantsCount: Number(root.participantsCount ?? root.participants ?? 0) || 0,
  };
}
