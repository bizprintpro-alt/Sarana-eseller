// ══════════════════════════════════════════════════════════════
// eseller.mn — Shared API Client (React Native + Web compatible)
// ══════════════════════════════════════════════════════════════

import type { AuthUser, AuthTokens, Product, Order, Service, Booking, Shipment } from '../../shared-types/src';

const API_BASE = 'https://sarana-backend.onrender.com/api';

type TokenGetter = () => Promise<string | null>;
let getToken: TokenGetter = async () => null;

export function setTokenGetter(fn: TokenGetter) {
  getToken = fn;
}

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, message: data.message || 'Алдаа гарлаа', data };
  return data as T;
}

// ═══ Auth ═══
export const AuthAPI = {
  register: (name: string, email: string, password: string, role: string) =>
    apiFetch<{ token: string; user: AuthUser }>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) }),
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => apiFetch<AuthUser>('/auth/me'),
};

// ═══ Products ═══
export const ProductsAPI = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch<{ products: Product[] }>('/products' + (qs ? '?' + qs : ''));
  },
  get: (id: string) => apiFetch<Product>('/products/' + id),
  create: (data: Partial<Product>) => apiFetch<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Product>) => apiFetch<Product>('/products/' + id, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch('/products/' + id, { method: 'DELETE' }),
};

// ═══ Orders ═══
export const OrdersAPI = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch<{ orders: Order[] }>('/orders' + (qs ? '?' + qs : ''));
  },
  create: (data: Record<string, unknown>) => apiFetch<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => apiFetch('/orders/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ═══ Payment ═══
export const PaymentAPI = {
  createQPay: (data: Record<string, unknown>) => apiFetch('/payment/qpay/create', { method: 'POST', body: JSON.stringify(data) }),
  checkQPay: (invoiceId: string) => apiFetch('/payment/qpay/check/' + invoiceId),
};

// ═══ Search ═══
export const SearchAPI = {
  suggest: (q: string) => apiFetch<{ suggestions: any[] }>(`/search/suggest?q=${encodeURIComponent(q)}`),
};

// ═══ Delivery ═══
export const DeliveryAPI = {
  getActiveShipments: () => apiFetch<{ shipments: Shipment[] }>('/delivery/active'),
  updateLocation: (data: { lat: number; lng: number; heading?: number }) =>
    apiFetch('/delivery/location', { method: 'POST', body: JSON.stringify(data) }),
  confirmDelivery: (shipmentId: string, method: string, proof?: string) =>
    apiFetch(`/delivery/${shipmentId}/confirm`, { method: 'POST', body: JSON.stringify({ method, proof }) }),
};

// ═══ Chat ═══
export const ChatAPI = {
  getThreads: () => apiFetch<{ threads: any[] }>('/chat/threads'),
  getMessages: (threadId: string) => apiFetch<{ messages: any[] }>(`/chat/${threadId}/messages`),
  sendMessage: (threadId: string, content: string) =>
    apiFetch(`/chat/${threadId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
};
