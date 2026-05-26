const BASE_URL = '/api/v1';

let accessToken = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return headers;
}

async function refreshAccessToken() {
  // Deduplicate concurrent refresh calls
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        accessToken = null;
        return null;
      }
      const data = await res.json();
      accessToken = data.access_token;
      return data;
    } catch {
      accessToken = null;
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
      credentials: 'include',
    });
  } catch {
    throw Object.assign(new Error('Unable to connect to the server. Please check your connection and try again.'), {
      status: 0,
      code: 'NETWORK_ERROR',
    });
  }

  // On 401 try a silent refresh once, then retry original request
  if (res.status === 401 && !options._retried) {
    const refreshResult = await refreshAccessToken();
    if (refreshResult) {
      return request(path, { ...options, _retried: true });
    }
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    throw Object.assign(new Error('Session expired'), {
      status: 401,
      code: 'UNAUTHORIZED',
    });
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw Object.assign(new Error('The server is not responding correctly. Please try again later.'), {
      status: res.status,
      code: 'INVALID_RESPONSE',
    });
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw Object.assign(new Error('The server returned an invalid response. Please try again later.'), {
      status: res.status,
      code: 'PARSE_ERROR',
    });
  }

  if (!res.ok) {
    const err = data.error || data;
    throw Object.assign(new Error(err.message || 'Request failed'), {
      status: res.status,
      code: err.code,
      data,
    });
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  downloadBlob: async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = data.error || data;
      throw Object.assign(new Error(err.message || 'Download failed'), { status: res.status, code: err.code });
    }
    return res.blob();
  },
};
