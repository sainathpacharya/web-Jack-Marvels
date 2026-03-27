/**
 * Client session storage. Tokens in localStorage are visible to XSS; production hardening should prefer
 * httpOnly + Secure + SameSite cookies issued by the API, short-lived access tokens, and CSP.
 */
const ACCESS_TOKEN_KEY = 'alphavlogs.accessToken';
const REFRESH_TOKEN_KEY = 'alphavlogs.refreshToken';
const ME_KEY = 'alphavlogs.me';
const USER_KEY = 'user';
export const ROLE_IDS = {
  ADMIN: 1,
  SCHOOL: 2,
  PROMOTOR: 3,
  PROMOTER: 3,
  STUDENT: 4,
  SUPER_ADMIN: 5,
  INFLUENCER: 6,
};

export function setSession({ accessToken, refreshToken, me }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (me) localStorage.setItem(ME_KEY, JSON.stringify(me));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ME_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setCurrentUser(user) {
  if (!user) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || '';
}

export function getMe() {
  const raw = localStorage.getItem(ME_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// --- App user helpers (roleId driven) ---
export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getUserRoleId() {
  const user = getCurrentUser();
  if (!user) return null;
  const id = user.roleId ?? user.role_id;
  if (id === undefined || id === null) return null;
  const n = Number(id);
  return Number.isNaN(n) ? null : n;
}

export function getUserRoleName() {
  const user = getCurrentUser();
  if (!user) return '';
  // `role` is treated as UI-only display value.
  return user.roleName ?? user.role ?? '';
}

export function isStudentRole(roleId = getUserRoleId()) {
  return Number(roleId) === ROLE_IDS.STUDENT;
}

export function isSchoolRole(roleId = getUserRoleId()) {
  return Number(roleId) === ROLE_IDS.SCHOOL;
}

