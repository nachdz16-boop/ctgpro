import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { initSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('ctgpro_token'));
  const restoreHandlersRef = useRef([]);
  const inFlightRef = useRef(null);
  const loadTimerRef = useRef(null);

  const registerRestoreHandler = (handler) => {
    restoreHandlersRef.current.push(handler);
    return () => {
      restoreHandlersRef.current = restoreHandlersRef.current.filter((h) => h !== handler);
    };
  };

  const runRestoreHandlers = async () => {
    const handlers = restoreHandlersRef.current.slice();
    await Promise.all(handlers.map((handler) => handler?.()));
  };

  useEffect(() => {
    // Debounce and single-flight protection to avoid repeated /auth/me calls
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }

    loadTimerRef.current = setTimeout(() => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        loadUser();
      } else {
        setLoading(false);
      }
    }, 120);

    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, [token]);

  const loadUser = async () => {
    // single-flight: return existing in-flight promise if present
    if (inFlightRef.current) return inFlightRef.current;

    const p = (async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        await runRestoreHandlers();
      } catch (error) {
        if (error.response?.status === 401) logout();
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = p;
    return p;
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      await runRestoreHandlers();
      return res.data.user;
    } catch (error) {
      console.error('Error refreshing user', error);
      return null;
    }
  };

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      const { token, user } = res.data;
      localStorage.setItem('ctgpro_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUser(user);
      await runRestoreHandlers();
      toast.success('✅ تم تسجيل الدخول بنجاح');
      return { success: true, user };
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token, user } = res.data;
      localStorage.setItem('ctgpro_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUser(user);
      toast.success('✅ تم إنشاء الحساب بنجاح');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('ctgpro_token');
    delete api.defaults.headers.common['Authorization'];
    disconnectSocket();
    setToken(null);
    setUser(null);
    toast.success('👋 تم تسجيل الخروج');
  };

  useEffect(() => {
    if (token) {
      initSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    refreshUser,
    registerRestoreHandler,
    runRestoreHandlers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};