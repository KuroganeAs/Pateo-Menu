// Authenticated fetch wrapper for the admin panel.
// - JWT stored client-side (localStorage) and attached on every request.
// - Any 401 clears the token and hard-redirects to /login.

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// The customer site's origin, used to resolve menu image paths like
// /dishes/foo.jpg that are served by the customer site, not the backend.
export const CUSTOMER_BASE = import.meta.env.VITE_CUSTOMER_SITE_URL || 'http://localhost:5173';

const TOKEN_KEY = 'pateo.admin.token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

function handleUnauthorized() {
  clearToken();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login');
  }
}

export class ApiError extends Error {
  constructor(status, detail) {
    super(typeof detail === 'string' ? detail : 'Request failed');
    this.status = status;
    this.detail = detail;
  }
}

async function parseBody(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

export async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined && !(body instanceof FormData)
        ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined
      : body instanceof FormData ? body
      : JSON.stringify(body),
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, 'Session expired');
  }
  if (!res.ok) {
    const data = await parseBody(res);
    throw new ApiError(res.status, data?.detail ?? data ?? res.statusText);
  }
  if (res.status === 204) return null;
  return parseBody(res);
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, file, extraFields = {}) => {
    const form = new FormData();
    form.append('file', file);
    for (const [key, value] of Object.entries(extraFields)) {
      if (value !== undefined && value !== null && value !== '') form.append(key, value);
    }
    return request(path, { method: 'POST', body: form });
  },
};

// Menu images may be: absolute URLs, backend uploads (/uploads/...), or
// customer-site assets (/dishes/...). Resolve accordingly.
export function resolveImageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`;
  return `${CUSTOMER_BASE}${url}`;
}
