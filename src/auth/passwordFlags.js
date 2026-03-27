/**
 * Normalize backend flags for "must set / change password" flows.
 * Backend should set one of these after login (JWT claims or user DTO).
 */
export function deriveMustChangePassword(user = {}, authPayload = {}) {
  if (authPayload.mustChangePassword === true) return true;
  if (authPayload.passwordChangeRequired === true) return true;
  if (authPayload.forcePasswordChange === true) return true;

  if (user.mustChangePassword === true) return true;
  if (user.passwordChangeRequired === true) return true;
  if (user.forcePasswordChange === true) return true;
  if (user.isFirstLogin === true) return true;
  if (user.firstLogin === true) return true;

  return false;
}
