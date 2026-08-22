import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('globetrotter_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('globetrotter_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.success && res.data.user) {
            setUser(res.data.user);
            setToken(storedToken);
            setIsAuthenticated(true);
          } else {
            handleLocalLogout();
          }
        } catch (err) {
          handleLocalLogout();
        }
      } else {
        handleLocalLogout();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLocalLogout = () => {
    localStorage.removeItem('globetrotter_token');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const login = async ({ email, password }) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const authToken = res.data.token;
        const authUser = res.data.user;

        localStorage.setItem('globetrotter_token', authToken);
        setToken(authToken);
        setUser(authUser);
        setIsAuthenticated(true);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const register = async ({ firstName, lastName, email, password }) => {
    try {
      const res = await api.post('/auth/register', { firstName, lastName, email, password });
      if (res.data && res.data.success) {
        const authToken = res.data.token;
        const authUser = res.data.user;

        localStorage.setItem('globetrotter_token', authToken);
        setToken(authToken);
        setUser(authUser);
        setIsAuthenticated(true);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore API logout error and clear client state
    } finally {
      handleLocalLogout();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/users/profile', profileData);
      if (res.data && res.data.success && res.data.user) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Failed to update profile' };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update profile' };
    }
  };

  const updatePreferences = async (preferencesData) => {
    try {
      const res = await api.put('/users/preferences', preferencesData);
      if (res.data && res.data.success && res.data.user) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Failed to update preferences' };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update preferences' };
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await api.delete('/users/account');
      handleLocalLogout();
      return { success: true, message: res.data?.message || 'Account deleted successfully' };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to delete account' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return { success: true, message: res.data?.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const resetPassword = async ({ token, newPassword }) => {
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword });
      return { success: true, message: res.data?.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.success && res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      // Ignore error
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    deleteAccount,
    forgotPassword,
    resetPassword,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
