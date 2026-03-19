const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const AUTH_TOKEN_KEY = 'authToken';

/**
 * Thin fetch wrapper used across the entire client.
 *
 * It injects the stored JWT, understands JSON and problem+json responses, and
 * throws consistent ApiError instances for pages and provider actions to handle.
 */
function createApiError(message, { status, code, payload } = {}) {
  const error = new Error(message || 'Request failed');
  error.name = 'ApiError';
  error.status = status;
  error.code = code;
  error.payload = payload;
  return error;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getStoredAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredAuthToken(token) {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const token = getStoredAuthToken();
  const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(options.headers || {})
  };

  if (!isFormDataBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('json')
    ? await response.json()
    : contentType.includes('text/')
      ? await response.text()
      : null;

  if (!response.ok) {
    const message = typeof payload === 'string'
      ? payload
      : payload?.detail || payload?.error?.message || payload?.message || payload?.errorCode || 'Request failed';
    const code = typeof payload === 'object'
      ? payload?.code || payload?.error?.code || payload?.errorCode
      : undefined;
    throw createApiError(message, { status: response.status, code, payload });
  }

  // Support the legacy envelope defensively while the client migrates.
  if (payload && typeof payload === 'object' && typeof payload.success === 'boolean') {
    if (!payload.success) {
      const message = payload?.error?.message || 'Request failed';
      throw createApiError(message, { status: response.status, code: payload?.error?.code, payload });
    }
    return payload.data;
  }

  return payload;
}

export function normalizeAuthPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { token: null, user: null, raw: payload };
  }

  const source = payload.data && typeof payload.data === 'object' ? payload.data : payload;
  const token = source.token || source.jwt || source.jwtToken || source.accessToken || source.access_token || null;
  const user = source.user || source.profile || source.userDto || source.currentUser || null;

  return { token, user, raw: payload };
}
