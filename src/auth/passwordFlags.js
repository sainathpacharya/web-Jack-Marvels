/**
 * Normalize backend flags for "must set / change password" flows.
 * Backend should set one of these after login (JWT claims or user DTO).
 */
export function deriveMustChangePassword(user = {}, authPayload = {}) {
  const safeUser = user ?? {};
  const safeAuthPayload = authPayload ?? {};

  if (safeAuthPayload.mustChangePassword === true) return true;
  if (safeAuthPayload.passwordChangeRequired === true) return true;
  if (safeAuthPayload.forcePasswordChange === true) return true;

  if (safeUser.mustChangePassword === true) return true;
  if (safeUser.passwordChangeRequired === true) return true;
  if (safeUser.forcePasswordChange === true) return true;
  if (safeUser.isFirstLogin === true) return true;
  if (safeUser.firstLogin === true) return true;

  return false;
}
