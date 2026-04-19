'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthContext, getStoredUser, getStoredToken, saveAuth, clearAuth } from '@/lib/auth';
import type { User } from '@/lib/api';
import { Ref } from '@/lib/ref';
import { useCartStore } from '@/lib/cart';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    setToken(getStoredToken());
    Ref.capture();
    useCartStore.getState().load();
  }, []);

  const login = useCallback((t: string, u: User) => {
    saveAuth(t, u);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    // Fire-and-forget: clears the httpOnly auth-token cookie used by
    // middleware. Ignore failures — localStorage is already cleared and
    // the cookie expires with the JWT anyway.
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
