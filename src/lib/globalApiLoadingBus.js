/** In-flight HTTP calls via `apiClient` (reference count). */

let pendingCount = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => {
    try {
      fn(pendingCount);
    } catch {
      /* ignore subscriber errors */
    }
  });
}

export function beginGlobalApiLoading() {
  pendingCount += 1;
  emit();
}

export function endGlobalApiLoading() {
  pendingCount = Math.max(0, pendingCount - 1);
  emit();
}

export function getGlobalApiLoadingCount() {
  return pendingCount;
}

/** @param {(count: number) => void} listener */
export function subscribeGlobalApiLoading(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
