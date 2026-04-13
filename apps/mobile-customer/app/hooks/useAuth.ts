/**
 * eseller.mn — Auth hook
 * Manages login, register, logout, auto-login
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { AuthAPI, AuthUser, setToken, clearToken } from '../lib/api';
import { useRoleStore, AppRole } from '../lib/roleStore';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const { setAuth, clearAuth, addRole, setActiveRole } = useRoleStore();
  const router = useRouter();

  // Auto-login on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const me = await AuthAPI.me();
      setUser(me);
      setupRoles(me);
    } catch {
      // Not authenticated — that's fine
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRoles = (u: AuthUser) => {
    const roles: AppRole[] = ['customer'];
    if (u.role === 'seller' || u.role === 'admin' || u.role === 'superadmin') {
      roles.push('seller', 'pos');
    }
    if (u.role === 'delivery') {
      roles.push('driver');
    }
    if (u.role === 'admin' || u.role === 'superadmin') {
      roles.push('driver', 'pos');
    }
    setAuth(u.id, '', roles);
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await AuthAPI.login(email, password);
    await setToken(res.token);
    setUser(res.user);
    setupRoles(res.user);

    // Navigate based on role
    const role = res.user.role;
    if (role === 'seller') {
      setActiveRole('seller');
    } else if (role === 'delivery') {
      setActiveRole('driver');
    } else {
      setActiveRole('customer');
    }

    router.replace('/(tabs)' as any);
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await AuthAPI.register(data);
    await setToken(res.token);
    setUser(res.user);
    setupRoles(res.user);
    router.replace('/(tabs)' as any);
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    clearAuth();
    setUser(null);
    router.replace('/(auth)/login' as any);
  }, []);

  return {
    isLoading,
    isAuthenticated: !!user,
    user,
    login,
    register,
    logout,
    checkAuth,
  };
}
