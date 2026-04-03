// ══════════════════════════════════════════════════════════════
// eseller.mn — Cart Store (Zustand)
// ══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { Product } from './api';

export interface CartItem extends Product {
  qty: number;
}

interface CartStore {
  items: CartItem[];
  load: () => void;
  add: (product: Product, qty?: number) => void;
  updateQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: () => number;
  total: () => number;
}

const CART_KEY = 'eseller_cart';

function persist(items: CartItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  load: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(CART_KEY);
      set({ items: raw ? JSON.parse(raw) : [] });
    } catch {
      set({ items: [] });
    }
  },

  add: (product, qty = 1) => {
    const items = [...get().items];
    const idx = items.findIndex((i) => i._id === product._id);
    if (idx >= 0) {
      items[idx].qty += qty;
    } else {
      items.push({ ...product, qty });
    }
    persist(items);
    set({ items });
  },

  updateQty: (id, qty) => {
    let items = [...get().items];
    const idx = items.findIndex((i) => i._id === id);
    if (idx >= 0) {
      if (qty <= 0) {
        items.splice(idx, 1);
      } else {
        items[idx].qty = qty;
      }
    }
    persist(items);
    set({ items });
  },

  remove: (id) => {
    const items = get().items.filter((i) => i._id !== id);
    persist(items);
    set({ items });
  },

  clear: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(CART_KEY);
    set({ items: [] });
  },

  count: () => get().items.reduce((s, i) => s + (i.qty || 1), 0),

  total: () =>
    get().items.reduce(
      (s, i) => s + (i.salePrice || i.price) * (i.qty || 1),
      0
    ),
}));
