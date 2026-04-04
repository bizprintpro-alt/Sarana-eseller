/**
 * eseller.mn — Mobile API Client
 * Connects to NextJS API routes for all features
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change to your deployed URL in production
const API_BASE = __DEV__
  ? 'http://10.0.2.2:3000/api'  // Android emulator → localhost
  : 'https://eseller.mn/api';

async function getToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem('@eseller_role_store');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.accessToken || null;
    }
  } catch {}
  return null;
}

async function apiFetch<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw { status: res.status, message: data.error || data.message || 'Алдаа гарлаа', data };
  }
  return data as T;
}

// ══════ BANNERS ══════
export interface BannerData {
  id: string;
  refId: string;
  title: string;
  slot: string;
  imageUrl: string;
  imageMobile?: string;
  linkUrl: string;
  altText?: string;
  bgColor?: string;
  sortOrder: number;
}

export const BannersAPI = {
  getBySlot: (slot: string) =>
    apiFetch<{ success: boolean; data: BannerData[] }>(`/banners/slot/${slot}`),
  trackClick: (bannerId: string) =>
    apiFetch(`/banners/${bannerId}/click`, { method: 'POST' }),
};

// ══════ LOYALTY ══════
export interface LoyaltyAccount {
  id: string;
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface LoyaltyRedeemResult {
  redemption: any;
  couponCode: string;
  valueAmount: number;
}

export const LoyaltyAPI = {
  getAccount: (userId: string) =>
    apiFetch<LoyaltyAccount>(`/loyalty/${userId}`),
  earn: (data: { userId: string; type: string; points: number; description?: string; refType?: string; refId?: string }) =>
    apiFetch('/loyalty/earn', { method: 'POST', body: JSON.stringify(data) }),
  redeem: (data: { userId: string; points: number; type: string; orderId?: string }) =>
    apiFetch<LoyaltyRedeemResult>('/loyalty/redeem', { method: 'POST', body: JSON.stringify(data) }),
};

// ══════ QPAY PAYMENT ══════
export interface QPayInvoice {
  invoiceId: string;
  qrImage: string;
  qrText: string;
  urls: { name: string; link: string }[];
}

export interface QPayStatus {
  paid: boolean;
  paidAmount: number;
  paidDate: string | null;
}

export const QPayAPI = {
  createInvoice: (data: { orderId: string; amount: number; description?: string }) =>
    apiFetch<QPayInvoice>('/payment/qpay/create', { method: 'POST', body: JSON.stringify(data) }),
  checkPayment: (invoiceId: string) =>
    apiFetch<QPayStatus>('/payment/qpay/check', { method: 'POST', body: JSON.stringify({ invoiceId }) }),
};

// ══════ ORDERS ══════
export interface CreateOrderData {
  items: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  delivery: {
    phone: string;
    address: { district?: string; street?: string; building?: string };
  };
  paymentMethod: string;
  loyaltyDiscount?: number;
  loyaltyCoupon?: string;
}

export const OrdersAPI = {
  create: (data: CreateOrderData) =>
    apiFetch<{ id: string; orderNumber: string }>('/orders', { method: 'POST', body: JSON.stringify(data) }),
};

// ══════ STORES / ENTITIES ══════
export interface StoreListItem {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  phone?: string;
  address?: string;
  industry?: string;
  district?: string;
  type?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  productCount?: number;
  followerCount?: number;
  entityType: string;
}

export const StoresAPI = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch<{ stores: StoreListItem[]; total: number }>('/stores' + (qs ? '?' + qs : ''));
  },
  getBySlug: (slug: string) =>
    apiFetch<StoreListItem>(`/stores/${slug}`),
};

// ══════ PRODUCTS ══════
export const ProductsAPI = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch<{ products: any[] }>('/products' + (qs ? '?' + qs : ''));
  },
  get: (id: string) => apiFetch<any>(`/products/${id}`),
};
