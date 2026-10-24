import { api, refreshAccessToken } from './client';

export const authApi = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),

  // Shares the client's deduplicated refresh: the refresh token rotates on every
  // call, so concurrent requests would revoke each other's cookie
  refresh: () => refreshAccessToken(),

  logout: () => api.post('/auth/logout'),
};
