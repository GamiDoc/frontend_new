const BASE_URL = '/api/v1';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
    });
  } catch {
    throw Object.assign(new Error('Unable to connect to the server. Please check your connection and try again.'), {
      status: 0,
      code: 'NETWORK_ERROR',
    });
  }
  if (res.status === 204) return null;
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }
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
    const res = await fetch(`${BASE_URL}${path}`, { method: 'GET', headers: getHeaders() });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = data.error || data;
      throw Object.assign(new Error(err.message || 'Download failed'), { status: res.status, code: err.code });
    }
    return res.blob();
  },
};
