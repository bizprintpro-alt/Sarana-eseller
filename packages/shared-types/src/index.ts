// ══════════════════════════════════════════════════════════════
// eseller.mn — Shared Types (used by all 4 mobile apps + web)
// ══════════════════════════════════════════════════════════════

// ═══ Auth ═══
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'affiliate' | 'delivery' | 'admin';
  username?: string;
  avatar?: string;
  store?: { name: string };
  danVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ═══ Product ═══
export interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  description?: string;
  category?: string;
  emoji?: string;
  images?: string[];
  stock?: number;
  commission?: number;
  rating?: number;
  reviewCount?: number;
  store?: { name: string };
}

// ═══ Order ═══
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';

export interface Order {
  _id: string;
  orderNumber?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  estimatedMinutes?: number;
  statusHistory?: { status: string; timestamp: string; note?: string }[];
  delivery?: {
    phone?: string;
    address?: { district?: string; street?: string; building?: string };
    lat?: number;
    lng?: number;
  };
  createdAt: string;
}

export interface OrderItem {
  product?: Product;
  name?: string;
  price?: number;
  quantity?: number;
}

// ═══ Cart ═══
export interface CartItem extends Product {
  qty: number;
  selectedModifiers?: SelectedModifier[];
  selectedAddOns?: SelectedAddOn[];
  unitPrice: number;
  lineTotal: number;
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface SelectedAddOn {
  addOnId: string;
  name: string;
  price: number;
  qty: number;
}

// ═══ Service / Booking ═══
export interface Service {
  _id: string;
  name: string;
  duration: number;
  price: number;
  salePrice?: number;
  emoji?: string;
  category?: string;
  isActive: boolean;
}

export interface Booking {
  _id: string;
  serviceId: string;
  serviceName?: string;
  customerName: string;
  customerPhone: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total: number;
}

// ═══ Delivery (Driver app) ═══
export interface Shipment {
  id: string;
  orderId: string;
  trackingCode?: string;
  status: 'awaiting_pickup' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  senderAddress: { name: string; phone: string; address: string; lat?: number; lng?: number };
  recipientAddress: { name: string; phone: string; address: string; lat?: number; lng?: number };
  estimatedAt?: string;
  fee: number;
}

export interface DriverLocation {
  lat: number;
  lng: number;
  heading?: number;
  accuracy?: number;
  timestamp: string;
}

// ═══ Tax (eБаримт) ═══
export interface TaxReceipt {
  id: string;
  orderId: string;
  billId: string;
  qrData: string;
  lottery?: string;
  amount: number;
  vatAmount: number;
  cityTaxAmount: number;
  status: 'sent' | 'failed' | 'cancelled';
}

// ═══ Chat ═══
export interface ChatMessage {
  id: string;
  chatId: string;
  content: string;
  senderId: string;
  senderName?: string;
  direction: 'inbound' | 'outbound';
  platform: 'eseller' | 'messenger' | 'viber';
  createdAt: string;
}

// ═══ Notification ═══
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'chat' | 'promo' | 'system' | 'delivery';
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
}
