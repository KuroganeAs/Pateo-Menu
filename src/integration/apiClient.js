// Never-throwing API client for the CUSTOMER site.
//
// Every call resolves to { ok, data, offline, error }:
//   ok      — request succeeded (2xx)
//   data    — parsed JSON body (null on failure)
//   offline — true when the failure was network-level (backend unreachable),
//             false when the backend answered with an error status
//   error   — human-readable message (null on success)
//
// Components therefore NEVER need try/catch around API calls and can always
// render a fallback instead of an error screen.
//
// A cached health check (GET /api/health) tracks backend availability:
// polled every HEALTH_INTERVAL ms by whoever subscribes — not on every render,
// and shared module-wide so N components cost one poller.

export const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

const REQUEST_TIMEOUT = 8000;
const HEALTH_TIMEOUT = 4000;
const HEALTH_INTERVAL = 12000; // ~10-15s

async function doFetch(path, options = {}, timeoutMs = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, signal: controller.signal });
    let data = null;
    const text = await res.text();
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const detail = data && typeof data === 'object' && data.detail ? data.detail : res.statusText;
      return { ok: false, data: null, offline: false, error: String(detail), status: res.status };
    }
    return { ok: true, data, offline: false, error: null, status: res.status };
  } catch {
    // AbortError / TypeError => network-level failure: the backend is offline
    // (or unreachable). This is the branch that must never throw upward.
    return { ok: false, data: null, offline: true, error: 'Backend unreachable', status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  get: (path) => doFetch(path),
  post: (path, body) =>
    doFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
};

// ---------------------------------------------------------------------------
// Cached backend status (shared health poller)
// ---------------------------------------------------------------------------
const status = {
  online: null,      // null = unknown (first check pending)
  lastCheck: 0,
  listeners: new Set(),
  timer: null,
  inflight: null,
};

function notify() {
  for (const fn of status.listeners) fn(status.online);
}

export async function checkHealth(force = false) {
  const now = Date.now();
  // Cache: reuse the last verdict within the polling window unless forced.
  if (!force && status.online !== null && now - status.lastCheck < HEALTH_INTERVAL) {
    return status.online;
  }
  if (status.inflight) return status.inflight; // de-dupe concurrent checks
  status.inflight = (async () => {
    const res = await doFetch('/api/health', {}, HEALTH_TIMEOUT);
    const online = res.ok && res.data?.ok === true;
    status.lastCheck = Date.now();
    status.inflight = null;
    if (online !== status.online) {
      status.online = online;
      notify();
    }
    return online;
  })();
  return status.inflight;
}

export function getBackendOnline() {
  return status.online;
}

/**
 * Subscribe to online/offline transitions. Starts the shared poller with the
 * first subscriber, stops it with the last. Returns an unsubscribe fn.
 */
export function subscribeBackendStatus(listener) {
  status.listeners.add(listener);
  if (status.online !== null) listener(status.online);
  if (!status.timer) {
    checkHealth(true);
    status.timer = setInterval(() => checkHealth(true), HEALTH_INTERVAL);
  }
  return () => {
    status.listeners.delete(listener);
    if (status.listeners.size === 0 && status.timer) {
      clearInterval(status.timer);
      status.timer = null;
    }
  };
}
