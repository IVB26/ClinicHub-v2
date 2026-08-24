import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from './types';
import { authAPI, getToken, setToken } from './api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Decode JWT to get user info (basic client-side check)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            setToken(null);
            setIsLoading(false);
            return;
          }
          // Set user from token payload if available
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

    checkAuth();
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await authAPI.login(username, password);
        if (response.token) {
          setToken(response.token);
          setUser(response.user);
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
