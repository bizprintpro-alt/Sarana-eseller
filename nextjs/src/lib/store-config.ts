// ══════════════════════════════════════════════════════════════
// eseller.mn — Store Configuration Helpers
// ══════════════════════════════════════════════════════════════

import type { BusinessType } from './types/service';

const CONFIG_KEY = 'eseller_store_config';

interface StoreConfig {
  businessType?: BusinessType;
  industry?: string;
  storeName?: string;
  [key: string]: unknown;
}

function getConfig(): StoreConfig {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveConfig(updates: Partial<StoreConfig>) {
  if (typeof window === 'undefined') return;
  const current = getConfig();
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...current, ...updates }));
}

export function getBusinessType(): BusinessType {
  return getConfig().businessType || 'product';
}

export function isServiceBusiness(): boolean {
  const t = getBusinessType();
  return t === 'service' || t === 'hybrid';
}

export function isProductBusiness(): boolean {
  const t = getBusinessType();
  return t === 'product' || t === 'hybrid';
}

export function isHybridBusiness(): boolean {
  return getBusinessType() === 'hybrid';
}
