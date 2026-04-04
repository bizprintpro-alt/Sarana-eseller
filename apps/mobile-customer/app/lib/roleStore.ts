import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────────────
export type AppRole = 'customer' | 'seller' | 'driver';

export interface RoleState {
  userId: string | null;
  accessToken: string | null;
  activeRole: AppRole;
  availableRoles: AppRole[];
  entityId: string | null;   // shopId or driverId depending on role
  entityName: string | null;  // shop name or driver name
}

export interface RoleActions {
  setAuth: (userId: string, accessToken: string, roles?: AppRole[]) => void;
  setActiveRole: (role: AppRole) => void;
  addRole: (role: AppRole, entityId?: string, entityName?: string) => void;
  clearAuth: () => void;
}

export type RoleStore = RoleState & RoleActions;

// ─── Defaults ────────────────────────────────────────────────
const STORAGE_KEY = '@eseller_role_store';

const defaultState: RoleState = {
  userId: null,
  accessToken: null,
  activeRole: 'customer',
  availableRoles: ['customer'],
  entityId: null,
  entityName: null,
};

// ─── Context ─────────────────────────────────────────────────
const RoleContext = createContext<RoleStore | null>(null);

export function useRoleStore(): RoleStore {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRoleStore must be used within RoleProvider');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RoleState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load persisted state
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<RoleState>;
            setState((prev) => ({ ...prev, ...parsed }));
          } catch {}
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  // Persist on change
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }
  }, [state, loaded]);

  const setAuth = useCallback(
    (userId: string, accessToken: string, roles?: AppRole[]) => {
      setState((prev) => ({
        ...prev,
        userId,
        accessToken,
        availableRoles: roles ?? prev.availableRoles,
      }));
    },
    [],
  );

  const setActiveRole = useCallback((role: AppRole) => {
    setState((prev) => {
      if (!prev.availableRoles.includes(role)) return prev;
      return { ...prev, activeRole: role };
    });
  }, []);

  const addRole = useCallback(
    (role: AppRole, entityId?: string, entityName?: string) => {
      setState((prev) => {
        const roles = prev.availableRoles.includes(role)
          ? prev.availableRoles
          : [...prev.availableRoles, role];
        return { ...prev, availableRoles: roles, entityId: entityId ?? prev.entityId, entityName: entityName ?? prev.entityName };
      });
    },
    [],
  );

  const clearAuth = useCallback(() => {
    setState(defaultState);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const store: RoleStore = {
    ...state,
    setAuth,
    setActiveRole,
    addRole,
    clearAuth,
  };

  if (!loaded) return null; // wait for hydration

  return React.createElement(RoleContext.Provider, { value: store }, children);
}

// ─── Role metadata ───────────────────────────────────────────
export const ROLE_META: Record<AppRole, { emoji: string; label: string; sublabel: string; color: string }> = {
  customer: { emoji: '🛍', label: 'Хэрэглэгч', sublabel: 'Бараа захиалах', color: '#E8242C' },
  seller:   { emoji: '🏪', label: 'Борлуулагч', sublabel: 'Дэлгүүр удирдах', color: '#22C55E' },
  driver:   { emoji: '🚚', label: 'Жолооч', sublabel: 'Хүргэлт хийх', color: '#F59E0B' },
};
