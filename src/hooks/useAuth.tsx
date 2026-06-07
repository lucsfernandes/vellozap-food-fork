import { useState, useEffect, useCallback } from 'react';
import { apiClient, getAccessToken, setAccessToken } from '@/lib/apiClient';

export interface AuthUser {
  id: string;
  email: string;
  display_name?: string | null;
}

interface MeResponse {
  user: AuthUser;
  restaurant: unknown | null;
  role: string;
}

/**
 * Auth state backed by the REST API (replaces Supabase Auth).
 * Access token is stored in localStorage; the refresh token lives in an
 * httpOnly cookie and is rotated automatically by the apiClient on 401.
 */
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    if (!getAccessToken()) {
      // Try a silent refresh in case only the cookie is present.
      try {
        const refreshed = await apiClient.post<{ accessToken: string }>('/auth/refresh', {});
        setAccessToken(refreshed.data.accessToken);
      } catch {
        setUser(null);
        setLoading(false);
        return;
      }
    }
    try {
      const res = await apiClient.get<MeResponse>('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const res = await apiClient.post<{ accessToken: string; user: AuthUser }>('/auth/login', {
        email,
        password,
      });
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      setLoading(false);
      return res.data.user;
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, restaurantName: string): Promise<AuthUser> => {
      const res = await apiClient.post<{ accessToken: string; user: AuthUser }>('/auth/signup', {
        email,
        password,
        restaurantName,
      });
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      setLoading(false);
      return res.data.user;
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // ignore network/logout errors
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return {
    user,
    // `session` kept for backwards-compat with components that only check truthiness.
    session: user ? { user } : null,
    loading,
    signIn,
    signUp,
    signOut,
    refresh: loadCurrentUser,
  };
};
