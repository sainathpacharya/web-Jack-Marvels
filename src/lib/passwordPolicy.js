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

/** Longer passwords are encouraged in UI copy; schema still allows min 8 to match backend. */
export const PASSWORD_RECOMMENDED_MIN = 10;

/**
 * @typedef {'weak' | 'medium' | 'strong'} PasswordStrengthLabel
 */

/**
 * Heuristic strength meter (does not replace regex validation).
 * @param {string} password
 * @returns {{ label: PasswordStrengthLabel; score: number }}
 */
export function getPasswordStrength(password) {
  const p = password ?? '';
  let score = 0;
  if (p.length >= PASSWORD_MIN_LENGTH) score += 1;
  if (p.length >= PASSWORD_RECOMMENDED_MIN) score += 1;
  if (/[a-z]/.test(p)) score += 1;
  if (/[A-Z]/.test(p)) score += 1;
  if (/\d/.test(p)) score += 1;
  if (/[^A-Za-z0-9]/.test(p)) score += 1;

  /** @type {PasswordStrengthLabel} */
  let label = 'weak';
  if (score >= 5 && p.length >= PASSWORD_MIN_LENGTH && STRONG_PASSWORD_REGEX.test(p)) {
    label = 'strong';
  } else if (score >= 3) {
    label = 'medium';
  }
  return { label, score };
}
