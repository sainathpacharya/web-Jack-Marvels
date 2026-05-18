import { clearSession, getAccessToken, getRefreshToken, setSession } from '../auth/session';
import { beginGlobalApiLoading, endGlobalApiLoading } from '../lib/globalApiLoadingBus';
import { normalizeApiError } from '../lib/errorModel';
import { trackApiEvent } from '../lib/observability';

/** Production default when `VITE_API_BASE_URL` is unset (paths in code are `/api/...`). */
const DEFAULT_PRODUCTION_API_BASE = 'https://api.alphavlogs.com';

/** Development default: browser calls Spring directly (ensure CORS allows the Vite origin). */
const DEFAULT_DEV_API_BASE = 'http://localhost:8080';

let didLogApiBaseHint = false;

function trimBase(url) {
  return String(url ?? '').trim().replace(/\/$/, '');
}

function getProductionApiBase() {
  const fromEnv = trimBase(import.meta.env.VITE_API_BASE_URL);
  return fromEnv || DEFAULT_PRODUCTION_API_BASE;
}

/**
 * Development: `http://localhost:8080` by default.
 * Set `VITE_DEV_USE_VITE_PROXY=true` to use same-origin `/api/*` (Vite proxy → `VITE_DEV_API_PROXY_TARGET`).
 * Override host with `VITE_DEV_API_BASE_URL` (e.g. `http://127.0.0.1:8081`).
 */
function getDevelopmentApiBase() {
  if (import.meta.env.VITE_DEV_USE_VITE_PROXY === 'true') return '';
  const fromEnv = trimBase(import.meta.env.VITE_DEV_API_BASE_URL);
  return fromEnv || DEFAULT_DEV_API_BASE;
}

/**
 * API origin (no trailing slash). Paths in this app are rooted at `/api/...`.
 * — Production (`vite build`): `VITE_API_BASE_URL` or `https://api.alphavlogs.com`
 * — Dev server: `VITE_DEV_API_BASE_URL` or `http://localhost:8080`, or `''` + Vite proxy when `VITE_DEV_USE_VITE_PROXY=true`
 */
function getApiBaseUrl() {
  const base = import.meta.env.PROD ? getProductionApiBase() : getDevelopmentApiBase();

  if (import.meta.env.DEV && typeof window !== 'undefined' && !didLogApiBaseHint) {
    didLogApiBaseHint = true;
    // eslint-disable-next-line no-console
    console.info(
      base
        ? `[apiClient] DEV → API base: ${base}`
        : '[apiClient] DEV → same-origin /api (Vite proxy; set VITE_DEV_API_PROXY_TARGET if not localhost:8080)'
    );
  }

  return base;
}

const DEFAULT_TIMEOUT_MS = 20000;

export class ApiError extends Error {
  constructor(payload) {
    super(payload?.message || 'Something went wrong');
    this.name = 'ApiError';
    this.payload = payload;
  }
}

function redactHeaders(headers) {
  const out = { ...(headers || {}) };
  for (const key of Object.keys(out)) {
    const lower = key.toLowerCase();
    if (lower === 'authorization' || lower.includes('token') || lower.includes('refresh')) {
      out[key] = '***REDACTED***';
    }
  }
  return out;
}

function isLikelyJsonContentType(contentType) {
  return typeof contentType === 'string' && contentType.toLowerCase().includes('application/json');
}

async function parseBodyFromResponse(response) {
  const contentType = response.headers.get('content-type') || response.headers.get('Content-Type') || '';
  if (isLikelyJsonContentType(contentType)) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  const text = await response.text().catch(() => '');
  if (!text) return null;
  return text;
}

function createApiErrorPayload({ status, data, fallbackMessage }) {
  const message =
    (data && typeof data === 'object' && (data.message || data.error?.message || data.response?.message)) ||
    (typeof data === 'string' ? data : '') ||
    fallbackMessage ||
    'Something went wrong';

  // Ensure `error` is always an object for consistent consumer UX.
  let errorObj = {};
  if (data && typeof data === 'object') {
    errorObj = data.error && typeof data.error === 'object' ? data.error : { ...data };
  }

  return normalizeApiError({
    success: false,
    message: String(message || 'Something went wrong'),
    details: errorObj,
    code: errorObj?.code || errorObj?.errorCode || `HTTP_${status || 0}`,
    status,
    raw: data,
  });
}

function buildUrl(pathOrUrl, { forceSameOrigin = false } = {}) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  if (forceSameOrigin) return p;
  return `${getApiBaseUrl()}${p}`;
}

function buildQuery(params) {
  if (!params || typeof params !== 'object') return '';
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v === undefined || v === null) return;
        usp.append(key, String(v));
      });
    } else {
      usp.set(key, String(value));
    }
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

/** Absolute URL for logging (relative paths become `http://localhost:5173/api/...` in the browser). */
function resolveAbsoluteRequestUrl(url) {
  if (typeof url !== 'string' || !url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === 'undefined' || !window.location?.origin) return url;
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return url;
  }
}

function shouldLogApiTraffic() {
  return import.meta.env.DEV || import.meta.env.VITE_LOG_API === 'true';
}

/** Human-readable backend / connection target for each call. */
function describeApiServer({ forceSameOrigin } = {}) {
  if (forceSameOrigin) {
    const origin = typeof window !== 'undefined' ? window.location?.origin : '';
    return origin
      ? `${origin} (same-origin; /api routed via Vite dev proxy when applicable)`
      : 'same-origin';
  }
  const base = getApiBaseUrl();
  if (!base) {
    const origin = typeof window !== 'undefined' ? window.location?.origin : '';
    return origin
      ? `${origin} (same-origin /api; Vite proxies to Spring in dev — see vite.config.js)`
      : 'same-origin /api';
  }
  return base;
}

function logApiTraffic(phase, { method, url, forceSameOrigin = false, headers, hasBody, status, ok, durationMs } = {}) {
  if (!shouldLogApiTraffic()) return;
  const server = describeApiServer({ forceSameOrigin });
  const endpoint = resolveAbsoluteRequestUrl(url);
  const line = `[apiClient] ${String(phase).toUpperCase()} ${method} ${endpoint}`;
  const detail = {
    server,
    endpoint,
    fetchUrl: url,
    method,
  };
  if (headers) detail.headers = redactHeaders(headers);
  if (hasBody != null) detail.hasBody = hasBody;
  if (status != null) {
    detail.status = status;
    detail.ok = ok;
    if (durationMs != null) detail.durationMs = durationMs;
  }
  // eslint-disable-next-line no-console
  console.info(line, detail);
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  beginGlobalApiLoading();
  try {
    const url = buildUrl('/api/auth/refresh');
    logApiTraffic('request', {
      method: 'POST',
      url,
      forceSameOrigin: false,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      hasBody: true,
    });
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    logApiTraffic('response', {
      method: 'POST',
      url,
      forceSameOrigin: false,
      status: res.status,
      ok: res.ok,
    });

    if (!res.ok) return null;
    const data = await parseBodyFromResponse(res);
    if (!data?.accessToken) return null;

    setSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      me: undefined,
    });

    return data;
  } finally {
    endGlobalApiLoading();
  }
}

function mergeSignals(signals = []) {
  const available = signals.filter(Boolean);
  if (!available.length || typeof AbortController === 'undefined') return null;
  if (available.length === 1) return available[0];
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  available.forEach((signal) => {
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener('abort', onAbort, { once: true });
  });
  return controller.signal;
}

async function requestJson(
  method,
  pathOrUrl,
  {
    params,
    data,
    headers,
    auth = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    skipAuthRetry = false,
    signal,
    skipSameOriginRetry = false,
    forceSameOrigin = false,
  } = {}
) {
  beginGlobalApiLoading();
  try {
  const url = `${buildUrl(pathOrUrl, { forceSameOrigin })}${buildQuery(params)}`;
  const requestHeaders = {
    Accept: 'application/json',
    ...(headers || {}),
  };

  // Attach Authorization only when a token exists.
  // Sending `Authorization: Bearer ` (empty token) can trigger avoidable preflight/auth failures.
  if (auth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let body = undefined;
  if (data !== undefined && data !== null && method !== 'GET' && method !== 'HEAD') {
    if (
      typeof FormData !== 'undefined' &&
      (data instanceof FormData || data instanceof Blob || data instanceof ArrayBuffer)
    ) {
      body = data;
    } else {
      // Default to JSON for plain objects.
      if (!requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
        requestHeaders['Content-Type'] = 'application/json';
      }
      body = typeof data === 'string' ? data : JSON.stringify(data);
    }
  }

  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const mergedSignal = mergeSignals([controller?.signal, signal]);
  const timerId =
    controller && timeoutMs
      ? setTimeout(() => {
          controller.abort('timeout');
        }, timeoutMs)
      : null;

  try {
    logApiTraffic('request', {
      method,
      url,
      forceSameOrigin,
      headers: requestHeaders,
      hasBody: body != null,
    });

    const res = await fetch(url, {
      method,
      headers: requestHeaders,
      body,
      signal: mergedSignal,
    });

    const payload = await parseBodyFromResponse(res);

    logApiTraffic('response', {
      method,
      url,
      forceSameOrigin,
      status: res.status,
      ok: res.ok,
      durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt),
    });

    if (res.status === 401 && auth && !skipAuthRetry) {
      trackApiEvent({ method, url, status: res.status, durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt), retried: true });
      const refreshed = await refreshAccessToken();
      if (!refreshed?.accessToken) {
        clearSession();
        // eslint-disable-next-line no-console
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:logout'));
        throw new ApiError(createApiErrorPayload({ status: 401, data: payload, fallbackMessage: 'Unauthorized' }));
      }
      return requestJson(method, pathOrUrl, { params, data, headers, auth, timeoutMs, skipAuthRetry: true, signal });
    }

    if (!res.ok) {
      const fallbackMessage = res.status === 403 ? 'Forbidden' : res.status === 500 ? 'Server error' : 'Something went wrong';
      const normalized = createApiErrorPayload({ status: res.status, data: payload, fallbackMessage });
      trackApiEvent({ method, url, status: res.status, durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt), errorType: normalized.type });
      throw new ApiError(normalized);
    }

    trackApiEvent({ method, url, status: res.status, durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt) });
    return payload;
  } catch (err) {
    if (err?.name === 'AbortError') {
      const fallbackMessage = signal?.aborted ? 'Request cancelled' : 'Request timed out';
      const normalized = createApiErrorPayload({ status: 408, data: {}, fallbackMessage });
      trackApiEvent({ method, url, status: 408, durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt), errorType: normalized.type });
      throw new ApiError(normalized);
    }
    if (err instanceof ApiError) throw err;

    // Dev: direct call to localhost:8080 can fail (CORS / down). Retry once via same-origin /api + Vite proxy.
    const canRetrySameOrigin =
      !skipSameOriginRetry &&
      import.meta.env.DEV &&
      import.meta.env.VITE_DEV_USE_VITE_PROXY !== 'true' &&
      !/^https?:\/\//i.test(pathOrUrl);
    if (canRetrySameOrigin) {
      const sameOriginPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
      return requestJson(method, sameOriginPath, {
        params,
        data,
        headers,
        auth,
        timeoutMs,
        skipAuthRetry,
        signal,
        skipSameOriginRetry: true,
        forceSameOrigin: true,
      });
    }

    const normalized = createApiErrorPayload({ status: 0, data: {}, fallbackMessage: err?.message || 'Something went wrong' });
    trackApiEvent({ method, url, status: 0, durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt), errorType: normalized.type });
    throw new ApiError(normalized);
  } finally {
    if (timerId) clearTimeout(timerId);
  }
} finally {
  endGlobalApiLoading();
}
}

async function requestMultipart(pathOrUrl, formData, { headers, auth = true, timeoutMs = DEFAULT_TIMEOUT_MS, skipAuthRetry = false, onUploadProgress } = {}) {
  beginGlobalApiLoading();
  try {
  const url = buildUrl(pathOrUrl);
  const requestHeaders = {
    Accept: 'application/json',
    ...(headers || {}),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.timeout = timeoutMs;

    for (const [k, v] of Object.entries(requestHeaders)) {
      // IMPORTANT: do NOT set Content-Type for FormData; XHR/browser will set the boundary.
      if (k.toLowerCase() === 'content-type') continue;
      xhr.setRequestHeader(k, v);
    }

    xhr.upload.onprogress = (event) => {
      if (!event || !event.lengthComputable) return;
      if (typeof onUploadProgress !== 'function') return;
      const next = Math.min(100, Math.round((event.loaded / event.total) * 100));
      onUploadProgress(next);
    };

    xhr.onload = async () => {
      const text = xhr.responseText || '';
      let payload = null;
      if (text) {
        try {
          payload = JSON.parse(text);
        } catch {
          payload = text;
        }
      }

      logApiTraffic('response', {
        method: 'POST',
        url,
        forceSameOrigin: false,
        status: xhr.status,
        ok: xhr.status >= 200 && xhr.status < 300,
        durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt),
      });

      if (xhr.status === 401 && auth && !skipAuthRetry) {
        trackApiEvent({ method: 'POST', url, status: xhr.status, durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt), retried: true });
        refreshAccessToken()
          .then((refreshed) => {
            if (!refreshed?.accessToken) {
              clearSession();
              if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:logout'));
              reject(new ApiError(createApiErrorPayload({ status: 401, data: payload, fallbackMessage: 'Unauthorized' })));
              return;
            }
            requestMultipart(pathOrUrl, formData, { headers, auth, timeoutMs, skipAuthRetry: true, onUploadProgress })
              .then(resolve)
              .catch(reject);
          })
          .catch((e) => reject(e));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        const fallbackMessage =
          xhr.status === 403 ? 'Forbidden' : xhr.status === 500 ? 'Server error' : 'Something went wrong';
        const normalized = createApiErrorPayload({ status: xhr.status, data: payload, fallbackMessage });
        trackApiEvent({ method: 'POST', url, status: xhr.status, durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt), errorType: normalized.type });
        reject(new ApiError(normalized));
        return;
      }

      trackApiEvent({ method: 'POST', url, status: xhr.status, durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt) });
      resolve(payload);
    };

    xhr.onerror = () => {
      const normalized = createApiErrorPayload({ status: 0, data: {}, fallbackMessage: 'Network error' });
      trackApiEvent({ method: 'POST', url, status: 0, durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt), errorType: normalized.type });
      reject(new ApiError(normalized));
    };

    xhr.ontimeout = () => {
      const normalized = createApiErrorPayload({ status: 408, data: {}, fallbackMessage: 'Request timed out' });
      trackApiEvent({ method: 'POST', url, status: 408, durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt), errorType: normalized.type });
      reject(new ApiError(normalized));
    };

    logApiTraffic('request', {
      method: 'POST',
      url,
      forceSameOrigin: false,
      headers: requestHeaders,
      hasBody: true,
    });

    xhr.send(formData);
  });
  } finally {
    endGlobalApiLoading();
  }
}

export const apiClient = {
  get: (url, params, config) => requestJson('GET', url, { params, ...config }),
  post: (url, data, config) => requestJson('POST', url, { data, ...config }),
  put: (url, data, config) => requestJson('PUT', url, { data, ...config }),
  patch: (url, data, config) => requestJson('PATCH', url, { data, ...config }),
  delete: (url, config) => requestJson('DELETE', url, { ...config }),
  multipart: (url, formData, config) => requestMultipart(url, formData, config),
  getApiBaseUrl: () => getApiBaseUrl(),
};

