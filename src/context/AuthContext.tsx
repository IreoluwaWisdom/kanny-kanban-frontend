'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import { getUserFriendlyError } from '@/lib/errorMessages';
import { logger } from '@/lib/logger';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  firebaseLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        logger.log('Checking auth with token...');
        const userData = await api.getCurrentUser();
        logger.log('User data:', userData);
        setUser(userData);
      }
    } catch (error) {
      logger.log('Auth check failed, trying refresh...', error);
      // Token might be expired, try to refresh
      try {
        const { accessToken } = await api.refreshToken();
        localStorage.setItem('accessToken', accessToken);
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch (refreshError) {
        logger.log('Refresh failed, clearing auth', refreshError);
        // Refresh failed, clear auth
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      logger.log('Logging in...');
      const response = await api.login(email, password);
      logger.log('Login response:', response);
      localStorage.setItem('accessToken', response.accessToken);
      setUser(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      logger.error('Login error:', apiError);
      throw new Error(getUserFriendlyError(apiError.message || 'Login failed'));
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      logger.log('Signing up...');
      const response = await api.signup(email, password, name);
      logger.log('Signup response:', response);
      localStorage.setItem('accessToken', response.accessToken);
      setUser(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      logger.error('Signup error:', apiError);
      throw new Error(getUserFriendlyError(apiError.message || 'Signup failed'));
    }
  };

  const firebaseLogin = async (idToken: string) => {
    try {
      logger.log('Logging in with Firebase...');
      const response = await api.firebaseAuth(idToken);
      logger.log('Firebase login response:', response);
      localStorage.setItem('accessToken', response.accessToken);
      setUser(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      logger.error('Firebase login error:', apiError);
      throw new Error(getUserFriendlyError(apiError.message || 'Firebase login failed'));
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      logger.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      Cookies.remove('refreshToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        firebaseLogin,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

