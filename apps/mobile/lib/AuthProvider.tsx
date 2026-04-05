import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext, type User } from './auth';
import { getApiClient, getAuthToken, removeAuthToken, resetApiClient, setAuthToken } from './api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const client = await getApiClient();
      const res = await client.get<{ id: number; username: string; phone: string; subscriptionStatus: string }>(
        '/users/me',
      );
      setUser({
        id: res.id,
        username: res.username,
        phone: res.phone ?? '',
        subscriptionStatus: (res.subscriptionStatus as User['subscriptionStatus']) ?? 'free',
      });
    } catch {
      await removeAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (phone: string, otp: string) => {
    const client = await getApiClient();
    const res = await client.post<{ jwt: string; user: any }>('/auth-otp/verify', { phone, otp });
    await setAuthToken(res.jwt);
    resetApiClient();
    setUser({
      id: res.user.id,
      username: res.user.username,
      phone: res.user.phone ?? '',
      subscriptionStatus: res.user.subscriptionStatus ?? 'free',
    });
  }, []);

  const register = useCallback(async (phone: string, username: string, otp: string) => {
    const client = await getApiClient();
    const res = await client.post<{ jwt: string; user: any }>('/auth-otp/register', { phone, username, otp });
    await setAuthToken(res.jwt);
    resetApiClient();
    setUser({
      id: res.user.id,
      username: res.user.username,
      phone: res.user.phone ?? '',
      subscriptionStatus: res.user.subscriptionStatus ?? 'free',
    });
  }, []);

  const logout = useCallback(async () => {
    await removeAuthToken();
    resetApiClient();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isPaid: user?.subscriptionStatus === 'active',
      login,
      register,
      logout,
      refreshUser: fetchMe,
    }),
    [user, isLoading, login, register, logout, fetchMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
