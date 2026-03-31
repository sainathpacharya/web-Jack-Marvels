/**
 * Client-side input hygiene. Server must still validate all payloads.
 */

export function trimInput(value) {
  if (value == null) return '';
  return String(value).trim();
}

/**
 * Normalize repeated internal whitespace (names, labels).
 * @param {string} value
 */
export function collapseWhitespace(value) {
  return trimInput(value).replace(/\s+/g, ' ');
}

/**
 * Remove control characters and angle brackets to reduce basic HTML/script injection in text fields.
 * @param {string} value
 * @param {{ maxLen?: number }} [opts]
 */
export function sanitizeTextInput(value, { maxLen = 4000 } = {}) {
  let s = trimInput(value);
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  s = s.replace(/[<>]/g, '');
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

/**
 * @param {string} value
 */
export function normalizeEmail(value) {
  return trimInput(value).toLowerCase();
}

/**
 * @param {string} value
 */
export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}
