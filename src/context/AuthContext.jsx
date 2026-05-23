import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const expiry = getTokenExpiry(token);
        if (expiry && expiry <= Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return null;
        }
      }
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const result = await authApi.login(email, password);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    setUser(result.user);
    return result;
  }, []);

  const register = useCallback(async (email, password) => {
    const result = await authApi.register(email, password);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    function handleUnauthorized() { logout(); }
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const expiry = getTokenExpiry(token);
    if (!expiry) return;
    const delay = expiry - Date.now();
    if (delay <= 0) {
      logout();
      return;
    }
    const timer = setTimeout(logout, delay);
    return () => clearTimeout(timer);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
