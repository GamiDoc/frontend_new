import { api, refreshAccessToken } from './client';

export const authApi = {
    // Returns { verification_required, email } when the account must be confirmed
    // by email before logging in, else { access_token, user }.
    register: (email, password) =>
        api.post('/auth/register', { email, password }),
    login: (email, password) => api.post('/auth/login', { email, password }),
    me: () => api.get('/auth/me'),

    // Shares the client's deduplicated refresh: the refresh token rotates on every
    // call, so concurrent requests would revoke each other's cookie
    refresh: () => refreshAccessToken(),

    logout: () => api.post('/auth/logout'),

    // Deletes the logged-in user's account and all its projects (password required)
    deleteAccount: (password) => api.delete('/auth/me', { password }),

    // Email verification and password reset (links sent by email: /?verify=… and /?reset=…)
    verifyEmail: (token) => api.post('/auth/verify-email', { token }),
    resendVerification: (email) =>
        api.post('/auth/resend-verification', { email }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    checkResetToken: (token) =>
        api.post('/auth/reset-password/check', { token }),
    resetPassword: (token, password) =>
        api.post('/auth/reset-password', { token, password }),
};
