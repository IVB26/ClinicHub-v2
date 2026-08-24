'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, AuthContextType } from '@/lib/types';
import { authAPI, getToken, setToken } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Decode JWT to get user info
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            setToken(null);
            setIsLoading(false);
            return;
          }
          if (payload.user) {
            setUser(payload.user);
          }
        } catch (e) {
          console.error('Failed to parse token:', e);
          setToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(username, password);
      if (response.token) {
        setToken(response.token);
        setUser(response.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
