/**
 * Strong password rules (align with OWASP ASVS; validate on server too).
 * Min 8 characters; requires upper, lower, digit, special.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** @type {RegExp} */
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;

/**
 * @param {string} password
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateStrongPassword(password) {
  const p = password ?? '';
  if (!p) {
    return { valid: false, error: 'Password is required.' };
  }
  if (p.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    };
  }
  if (p.length > PASSWORD_MAX_LENGTH) {
    return { valid: false, error: 'Password is too long.' };
  }
  if (!STRONG_PASSWORD_REGEX.test(p)) {
    return {
      valid: false,
      error:
        'Use at least 8 characters including uppercase, lowercase, a number, and a symbol.',
    };
  }
  return { valid: true };
}

/** User-facing requirement line for forms (no secret patterns). */
export const PASSWORD_REQUIREMENTS_SUMMARY =
  'At least 8 characters with uppercase, lowercase, a number, and a symbol.';
