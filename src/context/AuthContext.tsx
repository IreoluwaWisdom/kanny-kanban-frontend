'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import { getUserFriendlyError } from '@/lib/errorMessages';
import { logger } from '@/lib/logger';
import Cookies from 'js-cookie';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';

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
  googleLogin: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
      // Firebase email/password auth then exchange for backend tokens
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        const { sendEmailVerification } = await import('firebase/auth');
        await sendEmailVerification(cred.user, { url: `${window.location.origin}/login` });
        throw new Error('Please verify your email. A new verification email has been sent.');
      }
      const idToken = await cred.user.getIdToken();
      const response = await api.firebaseAuth(idToken);
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
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        const { sendEmailVerification } = await import('firebase/auth');
        await sendEmailVerification(cred.user, { url: `${window.location.origin}/login` });
        throw new Error('Verification email sent. Please check your inbox and verify before signing in.');
      } else {
        const idToken = await cred.user.getIdToken();
        const response = await api.firebaseAuth(idToken);
        localStorage.setItem('accessToken', response.accessToken);
        setUser(response.user);
      }
    } catch (error) {
      const apiError = error as ApiError;
      logger.error('Signup error:', apiError);
      throw new Error(getUserFriendlyError(apiError.message || 'Signup failed'));
    }
  };

  const googleLogin = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const response = await api.firebaseAuth(idToken);
    localStorage.setItem('accessToken', response.accessToken);
    setUser(response.user);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
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
        googleLogin,
        resetPassword,
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
