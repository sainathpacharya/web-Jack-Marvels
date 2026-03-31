/**
 * Map backend validation payloads to field keys for inline display.
 * Shape varies by API; normalize common patterns.
 *
 * @param {unknown} raw — error.details, ApiError.response, or full error object
 * @returns {Record<string, string>}
 */
export function mapApiDetailsToFieldErrors(raw) {
  if (!raw || typeof raw !== 'object') return {};

  const candidates = [];
  const obj = /** @type {Record<string, unknown>} */ (raw);

  if (obj.fieldErrors && typeof obj.fieldErrors === 'object') {
    candidates.push(obj.fieldErrors);
  }
  if (obj.errors && typeof obj.errors === 'object') {
    candidates.push(obj.errors);
  }
  if (obj.validationErrors && typeof obj.validationErrors === 'object') {
    candidates.push(obj.validationErrors);
  }

  /** @type {Record<string, string>} */
  const out = {};

  for (const bag of candidates) {
    for (const [key, val] of Object.entries(bag)) {
      if (out[key]) continue;
      if (Array.isArray(val) && val.length) {
        const first = val[0];
        out[key] = typeof first === 'string' ? first : String(first?.message ?? first);
      } else if (typeof val === 'string') {
        out[key] = val;
      } else if (val && typeof val === 'object' && 'message' in val) {
        out[key] = String(/** @type {{ message?: string }} */ (val).message);
      }
    }
  }

  return out;
}

/**
 * Merge API field errors into React state setters pattern: { ...prev, ...apiErrors }
 * @param {unknown} error — caught from mutateAsync / unwrap
 */
export function extractFieldErrorsFromCaughtError(error) {
  const e = /** @type {{ details?: unknown; error?: unknown }} */ (error);
  const details = e?.details ?? e?.error ?? null;
  return mapApiDetailsToFieldErrors(details || {});
}
