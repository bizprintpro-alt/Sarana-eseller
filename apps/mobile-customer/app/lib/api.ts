/**
 * eseller.mn — Mobile API Client
 * Production-ready with SecureStore token management
 */
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from './config';

// ─── Token management ───────────────────────────────────────
async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(CONFIG.STORAGE_TOKEN);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(CONFIG.STORAGE_TOKEN, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(CONFIG.STORAGE_TOKEN);
}

// ─── Base fetch wrapper ─────────────────────────────────────
async function request<T = any>(endpoint: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

  try {
    const res = await fetch(`${CONFIG.API_URL}${endpoint}`, {
      ...opts,
      headers,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw {
        status: res.status,
        message: data.error || data.message || `HTTP ${res.status}`,
        data,
      };
    }
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}

// ══════ AUTH ══════════════════════════════════════════════════
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const AuthAPI = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<AuthUser>('/auth/me'),

  forgotPassword: (email: string) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// ══════ BANNERS ══════════════════════════════════════════════
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
    request<{ success: boolean; data: BannerData[] }>(`/banners/slot/${slot}`),
  trackClick: (bannerId: string) =>
    request(`/banners/${bannerId}/click`, { method: 'POST' }),
};

// ══════ PRODUCTS ═════════════════════════════════════════════
export const ProductsAPI = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ products: any[]; total?: number }>('/marketplace' + (qs ? '?' + qs : ''));
  },
  get: (id: string) => request<any>(`/products/${id}`),
  search: (query: string, category?: string) => {
    const params: Record<string, string> = { q: query };
    if (category) params.category = category;
    const qs = new URLSearchParams(params).toString();
    return request<{ products: any[]; total: number }>('/search?' + qs);
  },
};

// ══════ STORES / ENTITIES ════════════════════════════════════
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
  entityType: string;
}

export const StoresAPI = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ stores: StoreListItem[]; total: number }>('/stores' + (qs ? '?' + qs : ''));
  },
  getBySlug: (slug: string) =>
    request<StoreListItem>(`/stores/${slug}`),
};

// ══════ CATEGORIES ═══════════════════════════════════════════
export const CategoriesAPI = {
  tree: () => request<any[]>('/categories/tree'),
};

// ══════ LOYALTY ══════════════════════════════════════════════
export interface LoyaltyAccount {
  id: string;
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export const LoyaltyAPI = {
  getAccount: (userId: string) =>
    request<LoyaltyAccount>(`/loyalty/${userId}`),
  earn: (data: { userId: string; type: string; points: number; description?: string }) =>
    request('/loyalty/earn', { method: 'POST', body: JSON.stringify(data) }),
  redeem: (data: { userId: string; points: number; type: string; orderId?: string }) =>
    request('/loyalty/redeem', { method: 'POST', body: JSON.stringify(data) }),
};

// ══════ QPAY PAYMENT ═════════════════════════════════════════
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
    request<QPayInvoice>('/payment/qpay/create', { method: 'POST', body: JSON.stringify(data) }),
  checkPayment: (invoiceId: string) =>
    request<QPayStatus>('/payment/qpay/check', { method: 'POST', body: JSON.stringify({ invoiceId }) }),
};

// ══════ ORDERS (Customer) ════════════════════════════════════
export interface CreateOrderData {
  items: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  delivery: { phone: string; address: { district?: string; street?: string; building?: string } };
  paymentMethod: string;
  loyaltyDiscount?: number;
  loyaltyCoupon?: string;
}

export const OrdersAPI = {
  create: (data: CreateOrderData) =>
    request<{ id: string; orderNumber: string }>('/checkout/create-invoice', { method: 'POST', body: JSON.stringify(data) }),
  myOrders: () =>
    request<{ orders: any[] }>('/buyer/orders'),
  getOrder: (id: string) =>
    request<any>(`/orders/${id}`),
  requestReturn: (orderId: string, data: { reason: string; images: string[] }) =>
    request(`/orders/${orderId}/return`, { method: 'POST', body: JSON.stringify(data) }),
};

// ══════ SELLER ═══════════════════════════════════════════════
export const SellerAPI = {
  // Dashboard
  stats: () => request<any>('/seller/analytics'),

  // Products
  products: () => request<{ products: any[] }>('/seller/products'),
  createProduct: (data: any) =>
    request('/seller/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) =>
    request(`/seller/products`, { method: 'PUT', body: JSON.stringify({ id, ...data }) }),

  // Orders
  orders: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return request<{ orders: any[] }>(`/seller/orders${qs}`);
  },
  updateOrderStatus: (id: string, status: string) =>
    request(`/seller/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Chat
  conversations: () => request<any>('/seller/conversations'),
  messages: (id: string) => request<any>(`/seller/conversations/${id}/messages`),
  sendMessage: (id: string, content: string) =>
    request(`/seller/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Revenue
  revenue: (period?: string) => {
    const qs = period ? `?period=${period}` : '';
    return request<any>(`/seller/analytics${qs}`);
  },

  // Catalog (shared products)
  catalog: () => request<any>('/seller/shared-products'),

  // Leaderboard
  leaderboard: (period?: string) => {
    const qs = period ? `?period=${period}` : '';
    return request<any>(`/seller/leaderboard${qs}`);
  },

  // Influencer profile
  updateInfluencer: (data: { followers: number; platform: string }) =>
    request('/seller/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Upload image
  uploadImage: async (uri: string) => {
    const token = await getToken();
    const form = new FormData();
    form.append('file', { uri, type: 'image/jpeg', name: 'upload.jpg' } as any);
    const res = await fetch(`${CONFIG.API_URL}/upload`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: form,
    });
    return res.json();
  },
};

// ══════ DRIVER ═══════════════════════════════════════════════
export const DriverAPI = {
  deliveries: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return request<{ orders: any[] }>(`/buyer/orders${qs}`); // TODO: driver-specific endpoint
  },
  updateDeliveryStatus: (id: string, status: string) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  confirmDelivery: (id: string, method: string, data: any) =>
    request(`/orders/${id}/confirm`, { method: 'POST', body: JSON.stringify({ confirmMethod: method, ...data }) }),
  earnings: (period?: string) => {
    const qs = period ? `?period=${period}` : '';
    return request<any>(`/driver/revenue${qs}`);
  },
  updateLocation: (lat: number, lng: number) =>
    request('/tracking/location', { method: 'POST', body: JSON.stringify({ lat, lng }) }),
  availableDrivers: (lat?: number, lng?: number) => {
    const params: string[] = [];
    if (lat) params.push(`lat=${lat}`);
    if (lng) params.push(`lng=${lng}`);
    const qs = params.length ? '?' + params.join('&') : '';
    return request<any>(`/driver/available${qs}`);
  },
  assignOrder: (orderId: string, driverId: string) =>
    request(`/orders/${orderId}/assign-driver`, { method: 'PUT', body: JSON.stringify({ driverId }) }),
};

// ══════ POS ══════════════════════════════════════════════════
export const POSAPI = {
  products: (search?: string) => {
    const params: Record<string, string> = { limit: '100' };
    if (search) params.search = search;
    return SellerAPI.products(); // reuse seller products
  },
  createSale: (data: { items: any[]; total: number; paymentMethod: string; vat: number }) =>
    request('/checkout/create-invoice', { method: 'POST', body: JSON.stringify(data) }),
};

// ══════ PUSH NOTIFICATIONS ═══════════════════════════════════
export const PushAPI = {
  registerToken: (pushToken: string, platform: string) =>
    request('/push/register', { method: 'POST', body: JSON.stringify({ token: pushToken, platform }) }),
};

// ══════ WISHLIST ═════════════════════════════════════════════
export const WishlistAPI = {
  list: () => request<any>('/wishlist'),
  add: (productId: string) =>
    request(`/wishlist/${productId}`, { method: 'POST' }),
  remove: (productId: string) =>
    request(`/wishlist/${productId}`, { method: 'DELETE' }),
};

// ══════ USER SETTINGS ════════════════════════════════════════
export const UserAPI = {
  updateSettings: (data: any) =>
    request('/user/settings', { method: 'PUT', body: JSON.stringify(data) }),
  addresses: () => request<any>('/user/addresses'),
  addAddress: (data: any) =>
    request('/user/addresses', { method: 'POST', body: JSON.stringify(data) }),
};

// ══════ FLASH SALE ══════════════════════════════════════════
export const FlashSaleAPI = {
  active: () => request<any>('/flash-sales/active'),
  upcoming: () => request<any>('/flash-sales/upcoming'),
};

// ══════ ADDRESS (BUYER) ═════════════════════════════════════
export const AddressAPI = {
  list: () => request<any>('/buyer/addresses'),
  create: (data: any) =>
    request('/buyer/addresses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/buyer/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/buyer/addresses/${id}`, { method: 'DELETE' }),
};
