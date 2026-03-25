let isFetchLoggingEnabled = false;

function toObject(headers) {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  return { ...headers };
}

function redactSensitive(data) {
  if (!data || typeof data !== 'object') return data;
  const redacted = { ...data };
  const sensitiveKeys = ['password', 'accessToken', 'refreshToken', 'authorization'];

  Object.keys(redacted).forEach((key) => {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      redacted[key] = '***REDACTED***';
    }
  });

  return redacted;
}

function parseBody(body) {
  if (!body) return null;
  if (typeof body === 'string') {
    try {
      return redactSensitive(JSON.parse(body));
    } catch {
      return body;
    }
  }
  return body;
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  const cloned = response.clone();
  const text = await cloned.text();
  if (!text) return null;

  if (contentType.includes('application/json')) {
    try {
      return redactSensitive(JSON.parse(text));
    } catch {
      return text;
    }
  }

  return text.length > 2000 ? `${text.slice(0, 2000)}...<truncated>` : text;
}

export function setupApiLogging() {
  if (isFetchLoggingEnabled || typeof window === 'undefined' || typeof fetch !== 'function') return;
  isFetchLoggingEnabled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const requestUrl = typeof input === 'string' ? input : input?.url;
    const requestMethod = init.method || (typeof input !== 'string' ? input?.method : 'GET') || 'GET';
    const requestHeaders = toObject(init.headers || (typeof input !== 'string' ? input?.headers : undefined));
    const requestBody = parseBody(init.body);

    const startedAt = performance.now();

    console.log('[API Request]', {
      method: requestMethod,
      url: requestUrl,
      headers: redactSensitive(requestHeaders),
      body: requestBody,
    });

    try {
      const response = await originalFetch(input, init);
      const durationMs = Math.round(performance.now() - startedAt);
      const responseBody = await parseResponseBody(response);

      console.log('[API Response]', {
        method: requestMethod,
        url: requestUrl,
        status: response.status,
        ok: response.ok,
        durationMs,
        headers: toObject(response.headers),
        body: responseBody,
      });

      return response;
    } catch (error) {
      const durationMs = Math.round(performance.now() - startedAt);
      console.error('[API Error]', {
        method: requestMethod,
        url: requestUrl,
        durationMs,
        error: error?.message || error,
      });
      throw error;
    }
  };
}
