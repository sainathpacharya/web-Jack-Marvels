export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export function classifyApiError({ status, code, message }) {
  if (status === 0 || status === 408) return API_ERROR_TYPES.NETWORK_ERROR;
  if (status === 401 || status === 403) return API_ERROR_TYPES.AUTH_ERROR;
  if (status === 400 || status === 409 || status === 422) return API_ERROR_TYPES.VALIDATION_ERROR;
  if (status >= 500) return API_ERROR_TYPES.SERVER_ERROR;
  if (String(code || '').toUpperCase().includes('NETWORK')) return API_ERROR_TYPES.NETWORK_ERROR;
  if (String(message || '').toLowerCase().includes('network')) return API_ERROR_TYPES.NETWORK_ERROR;
  return API_ERROR_TYPES.UNKNOWN_ERROR;
}

export function normalizeApiError(input = {}) {
  const status = Number(input.status ?? 0) || 0;
  const code = String(input.code || input.errorCode || '').trim() || `HTTP_${status || 0}`;
  const message = String(input.message || 'Something went wrong');
  return {
    success: false,
    type: classifyApiError({ status, code, message }),
    message,
    code,
    status,
    error: input.details ?? null,
    details: input.details ?? null,
    raw: input.raw ?? null,
  };
}
