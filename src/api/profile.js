import { getCurrentUser, setCurrentUser } from '../auth/session';
import { apiClient } from '../services/apiClient';

function unwrap(data) {
  if (!data || typeof data !== 'object') return data;
  return data.data ?? data.response ?? data;
}

function normalizeProfile(raw) {
  const user = raw || {};
  return {
    userId: String(user.id ?? user.userId ?? user.user_id ?? ''),
    fullName: String(user.fullName ?? user.name ?? '').trim(),
    email: String(user.email ?? user.username ?? '').trim(),
    phone: String(user.mobileNumber ?? user.phone ?? user.mobile ?? '').trim(),
    role: String(user.roleName ?? user.role ?? '').trim(),
    createdAt: String(user.createdAt ?? user.createdDate ?? user.created_date ?? '').trim(),
    address: String(user.address ?? '').trim(),
    profilePicture: String(user.profilePicture ?? user.photo ?? '').trim(),
  };
}

function mapPayload(form) {
  return {
    fullName: form.fullName?.trim(),
    email: form.email?.trim(),
    mobileNumber: form.phone?.trim(),
    address: form.address?.trim(),
    profilePicture: form.profilePicture || '',
  };
}

export async function fetchMyProfile({ signal } = {}) {
  const paths = ['/api/v1/profile', '/api/profile'];
  for (const path of paths) {
    try {
      const data = await apiClient.get(path, undefined, { headers: { Accept: 'application/json' }, signal });
      return normalizeProfile(unwrap(data));
    } catch {
      // Try alias path.
    }
  }
  return normalizeProfile(getCurrentUser());
}

export async function updateMyProfile(formData, { signal } = {}) {
  const payload = mapPayload(formData);
  const paths = ['/api/v1/profile', '/api/profile'];
  let lastError = null;

  for (const path of paths) {
    try {
      const data = await apiClient.put(path, payload, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal,
      });
      const updated = normalizeProfile(unwrap(data));
      const current = getCurrentUser() || {};
      setCurrentUser({
        ...current,
        name: updated.fullName || current.name,
        fullName: updated.fullName || current.fullName,
        email: updated.email || current.email,
        username: updated.email || current.username,
        mobileNumber: updated.phone || current.mobileNumber,
        phone: updated.phone || current.phone,
        address: updated.address || current.address,
        profilePicture: updated.profilePicture || current.profilePicture,
      });
      return updated;
    } catch (error) {
      lastError = error;
    }
  }

  // Fallback to local update so profile is still usable.
  const current = getCurrentUser() || {};
  const fallback = {
    ...current,
    name: payload.fullName || current.name,
    fullName: payload.fullName || current.fullName,
    email: payload.email || current.email,
    username: payload.email || current.username,
    mobileNumber: payload.mobileNumber || current.mobileNumber,
    phone: payload.mobileNumber || current.phone,
    address: payload.address || current.address,
    profilePicture: payload.profilePicture || current.profilePicture,
  };
  setCurrentUser(fallback);
  if (lastError) throw lastError;
  return normalizeProfile(fallback);
}
