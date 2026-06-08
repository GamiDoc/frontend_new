import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { authApi } from '../api/auth';
import { setAccessToken } from '../api/client';
import { activityApi } from '../api/activity';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const scheduleAutoLogout = useCallback((accessToken) => {
    clearLogoutTimer();
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.exp) {
        const delay = payload.exp * 1000 - Date.now();
        if (delay > 0) {
          logoutTimerRef.current = setTimeout(async () => {
            // Try silent refresh before logging out
            const result = await authApi.refresh();
            if (result) {
              setAccessToken(result.access_token);
              setUser(result.user);
              scheduleAutoLogout(result.access_token);
            } else {
              setAccessToken(null);
              setUser(null);
            }
          }, delay);
        }
      }
    } catch {
      // malformed token, ignore
    }
  }, [clearLogoutTimer]);

  const applyAuthResult = useCallback((result) => {
    setAccessToken(result.access_token);
    setUser(result.user);
    scheduleAutoLogout(result.access_token);
  }, [scheduleAutoLogout]);

  const login = useCallback(async (email, password) => {
    const result = await authApi.login(email, password);
    applyAuthResult(result);
    activityApi.record('frontend.auth.login', { page: 'auth' });
    return result;
  }, [applyAuthResult]);

  const register = useCallback(async (email, password) => {
    const result = await authApi.register(email, password);
    applyAuthResult(result);
    activityApi.record('frontend.auth.register', { page: 'auth' });
    return result;
  }, [applyAuthResult]);

  const logout = useCallback(async () => {
    activityApi.record('frontend.auth.logout', { page: 'auth' });
    try { await authApi.logout(); } catch { /* ignore */ }
    clearLogoutTimer();
    setAccessToken(null);
    setUser(null);
  }, [clearLogoutTimer]);

  // Listen for 401 events from the API client
  useEffect(() => {
    function handleUnauthorized() {
      clearLogoutTimer();
      setAccessToken(null);
      setUser(null);
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [clearLogoutTimer]);

  // Bootstrap: try silent refresh on mount (httpOnly cookie sent automatically)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await authApi.refresh();
        if (!cancelled && result) {
          applyAuthResult(result);
        }
      } catch {
        // no valid refresh token, stay logged out
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [applyAuthResult]);

  // Clean up timer on unmount
  useEffect(() => clearLogoutTimer, [clearLogoutTimer]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
