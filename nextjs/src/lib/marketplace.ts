// ══════════════════════════════════════════════════════════════
// eseller.mn — Unified Marketplace Feed
// Merges products + services into a single browsable feed
// ══════════════════════════════════════════════════════════════

import type { Product } from './api';
import type { Service } from './types/service';

export type ItemType = 'product' | 'service';

export interface ModifierGroupData {
  id: string;
  name: string;
  required: boolean;
  multiple: boolean;
  options: { id: string; name: string; price: number; available: boolean }[];
}

export interface AddOnData {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface MarketplaceItem {
  id: string;
  type: ItemType;
  title: string;
  description?: string;
  price: number;
  salePrice?: number;
  currency: 'MNT';
  category?: string;
  emoji?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  sellerName?: string;
  sellerSlug?: string;
  // Service-specific
  duration?: number;
  // Product-specific
  stock?: number;
  commission?: number;
  createdAt?: string;
  // Modifiers + Add-ons
  modifierGroups?: ModifierGroupData[];
  addOns?: AddOnData[];
  deliveryFee?: number;
  deliveryType?: 'standard' | 'express' | 'pickup';
  estimatedMins?: number;
}

/** Convert a Product to MarketplaceItem */
export function productToItem(p: Product): MarketplaceItem {
  return {
    id: p._id,
    type: 'product',
    title: p.name,
    description: p.description,
    price: p.price,
    salePrice: p.salePrice,
    currency: 'MNT',
    category: p.category,
    emoji: p.emoji,
    images: p.images,
    rating: p.rating,
    reviewCount: p.reviewCount,
    sellerName: p.store?.name,
    stock: p.stock,
    commission: p.commission,
    createdAt: p.createdAt,
  };
}

/** Convert a Service to MarketplaceItem */
export function serviceToItem(s: Service): MarketplaceItem {
  return {
    id: s._id,
    type: 'service',
    title: s.name,
    description: s.description,
    price: s.price,
    salePrice: s.salePrice,
    currency: 'MNT',
    category: s.category,
    emoji: s.emoji,
    images: s.images,
    rating: s.rating,
    reviewCount: s.reviewCount,
    duration: s.duration,
    commission: s.commission,
    createdAt: s.createdAt,
  };
}

export type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'rating';

/** Sort marketplace items */
export function sortItems(items: MarketplaceItem[], sort: SortKey): MarketplaceItem[] {
  const sorted = [...items];
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    case 'price_asc':
      return sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    case 'price_desc':
      return sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    default:
      return sorted;
  }
}

/** Filter by category */
export function filterByCategory(items: MarketplaceItem[], category: string): MarketplaceItem[] {
  if (!category || category === 'all') return items;
  return items.filter((i) => i.category === category);
}

/** Filter by type */
export function filterByType(items: MarketplaceItem[], type: 'all' | ItemType): MarketplaceItem[] {
  if (type === 'all') return items;
  return items.filter((i) => i.type === type);
}

/** Extract unique categories from items */
export function extractCategories(items: MarketplaceItem[]): { key: string; count: number }[] {
  const map = new Map<string, number>();
  items.forEach((i) => {
    if (i.category) map.set(i.category, (map.get(i.category) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

/** Search items */
export function searchItems(items: MarketplaceItem[], query: string): MarketplaceItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter((i) =>
    i.title.toLowerCase().includes(q) ||
    (i.description || '').toLowerCase().includes(q) ||
    (i.sellerName || '').toLowerCase().includes(q) ||
    (i.category || '').toLowerCase().includes(q)
  );
}
