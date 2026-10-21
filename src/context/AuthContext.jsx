import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

function readSavedSession() {
  try {
    const token = localStorage.getItem('elearning_token');
    const rawUser = localStorage.getItem('elearning_user');
    if (!token || !rawUser) return null;
    const user = JSON.parse(rawUser);
    return user && typeof user === 'object' ? user : null;
  } catch {
    localStorage.removeItem('elearning_token');
    localStorage.removeItem('elearning_user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedSession);
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('elearning_token');
    localStorage.removeItem('elearning_user');
    setUser(null);
  }, []);

  const login = useCallback(async ({ email, studentId, password }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        ...(email ? { email: email.trim() } : {}),
        ...(studentId ? { studentId: studentId.trim() } : {}),
        password,
      });
      const token = response?.data?.token;
      const loggedInUser = response?.data?.user;
      if (typeof token !== 'string' || !token || !loggedInUser) {
        throw new Error('The server response did not include a valid token and user.');
      }
      localStorage.setItem('elearning_token', token);
      localStorage.setItem('elearning_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      // Never leave a previous/stale session active after a failed login.
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('elearning:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('elearning:unauthorized', handleUnauthorized);
  }, [logout]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user && localStorage.getItem('elearning_token')),
    loading,
    login,
    logout,
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
