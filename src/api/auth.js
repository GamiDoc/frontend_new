import { api } from './client';

const BASE_URL = '/api/v1';

export const authApi = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),

  // Uses fetch directly because refresh relies on httpOnly cookie, not Authorization header
  refresh: async () => {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
  },

  logout: () => api.post('/auth/logout'),
};
