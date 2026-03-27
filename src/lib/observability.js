const MAX_ENDPOINT_RECORDS = 100;
const endpointState = new Map();
const mutationEvents = [];

function getEndpointKey(method, url) {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return `${String(method || 'GET').toUpperCase()} ${parsed.pathname}`;
  } catch {
    return `${String(method || 'GET').toUpperCase()} ${String(url || '')}`;
  }
}

export function trackApiEvent({ method, url, status, durationMs, errorType, retried = false }) {
  const key = getEndpointKey(method, url);
  const current = endpointState.get(key) || {
    total: 0,
    failures: 0,
    retries: 0,
    slowCount: 0,
    avgDurationMs: 0,
    lastStatus: null,
    lastErrorType: null,
  };
  const total = current.total + 1;
  const avgDurationMs = Math.round(((current.avgDurationMs * current.total) + Number(durationMs || 0)) / total);
  const next = {
    ...current,
    total,
    failures: current.failures + (Number(status || 0) >= 400 || Number(status || 0) === 0 ? 1 : 0),
    retries: current.retries + (retried ? 1 : 0),
    slowCount: current.slowCount + (Number(durationMs || 0) > 1200 ? 1 : 0),
    avgDurationMs,
    lastStatus: status ?? null,
    lastErrorType: errorType ?? null,
  };
  endpointState.set(key, next);

  if (endpointState.size > MAX_ENDPOINT_RECORDS) {
    const oldest = endpointState.keys().next();
    if (!oldest.done) endpointState.delete(oldest.value);
  }
}

export function trackMutationEvent(event) {
  mutationEvents.push({
    ...event,
    timestamp: new Date().toISOString(),
  });
  if (mutationEvents.length > 200) mutationEvents.shift();
}

export function getErrorIntelligenceSnapshot() {
  return {
    endpoints: Array.from(endpointState.entries()).map(([endpoint, stats]) => ({ endpoint, ...stats })),
    recentMutations: [...mutationEvents],
  };
}

export function logDevErrorIntelligence() {
  if (!import.meta.env.DEV) return;
  // eslint-disable-next-line no-console
  console.debug('[error-intelligence]', getErrorIntelligenceSnapshot());
}
