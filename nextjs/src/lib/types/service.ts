// ══════════════════════════════════════════════════════════════
// eseller.mn — Service Business Types
// Supports: salons, beauty shops, repair, printing, factories
// ══════════════════════════════════════════════════════════════

export type BusinessType = 'product' | 'service' | 'hybrid';

export interface Service {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  duration: number; // minutes
  price: number;
  salePrice?: number;
  emoji?: string;
  images?: string[];
  staffIds?: string[];
  branchId?: string;
  isActive: boolean;
  maxBookingsPerSlot: number;
  bufferTime: number; // minutes between appointments
  requiresDeposit?: boolean;
  depositAmount?: number;
  commission?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  _id: string;
  serviceId: string;
  serviceName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  staffId?: string;
  staffName?: string;
  branchId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  total: number;
  depositPaid?: number;
  createdAt: string;
}

export interface StaffSchedule {
  staffId: string;
  staffName?: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isOff: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  staffId?: string;
  staffName?: string;
}

export interface BusinessHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface ServiceCategory {
  _id: string;
  name: string;
  emoji?: string;
  description?: string;
  sortOrder: number;
}

// ═══ Demo Data ═══

export const SERVICE_INDUSTRIES = [
  { value: 'salon', emoji: '💇', label: 'Үсчин & Салон' },
  { value: 'beauty_service', emoji: '💅', label: 'Гоо сайхны үйлчилгээ' },
  { value: 'spa', emoji: '🧖', label: 'Спа & Массаж' },
  { value: 'repair', emoji: '🔧', label: 'Засвар үйлчилгээ' },
  { value: 'cobbler', emoji: '👞', label: 'Гутлын засвар' },
  { value: 'printing', emoji: '🖨️', label: 'Хэвлэх үйлчилгээ' },
  { value: 'factory', emoji: '🏭', label: 'Үйлдвэр & Захиалгат' },
  { value: 'cleaning', emoji: '🧹', label: 'Цэвэрлэгээний үйлчилгээ' },
  { value: 'tutoring', emoji: '📚', label: 'Хичээл & Сургалт' },
  { value: 'fitness', emoji: '💪', label: 'Фитнесс & Спорт' },
  { value: 'photo', emoji: '📷', label: 'Зураг авалт' },
  { value: 'other_service', emoji: '🛎️', label: 'Бусад үйлчилгээ' },
];

export const DEMO_SERVICES: Service[] = [
  { _id: 's1', name: 'Үс засалт (Эрэгтэй)', duration: 30, price: 15000, emoji: '💇‍♂️', category: 'haircut', isActive: true, maxBookingsPerSlot: 1, bufferTime: 10, rating: 4.8, reviewCount: 124 },
  { _id: 's2', name: 'Үс засалт (Эмэгтэй)', duration: 60, price: 25000, emoji: '💇‍♀️', category: 'haircut', isActive: true, maxBookingsPerSlot: 1, bufferTime: 15, rating: 4.9, reviewCount: 89 },
  { _id: 's3', name: 'Үс будалт', duration: 120, price: 65000, salePrice: 55000, emoji: '🎨', category: 'coloring', isActive: true, maxBookingsPerSlot: 1, bufferTime: 15, rating: 4.7, reviewCount: 56 },
  { _id: 's4', name: 'Маникюр', duration: 45, price: 20000, emoji: '💅', category: 'nails', isActive: true, maxBookingsPerSlot: 1, bufferTime: 10, rating: 4.6, reviewCount: 78 },
  { _id: 's5', name: 'Педикюр', duration: 60, price: 25000, emoji: '🦶', category: 'nails', isActive: true, maxBookingsPerSlot: 1, bufferTime: 10, rating: 4.5, reviewCount: 45 },
  { _id: 's6', name: 'Нүүрний арьс арчилгаа', duration: 90, price: 45000, emoji: '✨', category: 'facial', isActive: true, maxBookingsPerSlot: 1, bufferTime: 15, rating: 4.9, reviewCount: 112 },
  { _id: 's7', name: 'Массаж (60 мин)', duration: 60, price: 50000, emoji: '💆', category: 'massage', isActive: true, maxBookingsPerSlot: 1, bufferTime: 15, rating: 4.8, reviewCount: 67 },
  { _id: 's8', name: 'Хурууны хумс наалт', duration: 90, price: 35000, emoji: '💎', category: 'nails', isActive: true, maxBookingsPerSlot: 1, bufferTime: 10 },
];

export const DEMO_APPOINTMENTS: Appointment[] = [
  { _id: 'a1', serviceId: 's1', serviceName: 'Үс засалт (Эрэгтэй)', customerName: 'Болд', customerPhone: '9911-2233', staffName: 'Сараа', date: '2026-04-03', startTime: '10:00', endTime: '10:30', status: 'confirmed', total: 15000, createdAt: '2026-04-02T08:00:00Z' },
  { _id: 'a2', serviceId: 's2', serviceName: 'Үс засалт (Эмэгтэй)', customerName: 'Оюунаа', customerPhone: '9922-3344', staffName: 'Туяа', date: '2026-04-03', startTime: '11:00', endTime: '12:00', status: 'confirmed', total: 25000, createdAt: '2026-04-01T14:00:00Z' },
  { _id: 'a3', serviceId: 's3', serviceName: 'Үс будалт', customerName: 'Нараа', customerPhone: '9933-4455', staffName: 'Сараа', date: '2026-04-03', startTime: '13:00', endTime: '15:00', status: 'pending', total: 55000, createdAt: '2026-04-02T20:00:00Z' },
  { _id: 'a4', serviceId: 's6', serviceName: 'Нүүрний арьс арчилгаа', customerName: 'Сэлэнгэ', customerPhone: '9944-5566', staffName: 'Жаргал', date: '2026-04-03', startTime: '14:00', endTime: '15:30', status: 'in_progress', total: 45000, createdAt: '2026-04-01T10:00:00Z' },
  { _id: 'a5', serviceId: 's4', serviceName: 'Маникюр', customerName: 'Ариунаа', customerPhone: '9955-6677', staffName: 'Туяа', date: '2026-04-04', startTime: '10:00', endTime: '10:45', status: 'pending', total: 20000, createdAt: '2026-04-03T09:00:00Z' },
  { _id: 'a6', serviceId: 's7', serviceName: 'Массаж (60 мин)', customerName: 'Ганбаатар', customerPhone: '9966-7788', staffName: 'Жаргал', date: '2026-04-04', startTime: '15:00', endTime: '16:00', status: 'confirmed', total: 50000, createdAt: '2026-04-02T16:00:00Z' },
];

export const DEMO_SERVICE_CATEGORIES: ServiceCategory[] = [
  { _id: 'sc1', name: 'Үс засалт', emoji: '💇', sortOrder: 1 },
  { _id: 'sc2', name: 'Будалт', emoji: '🎨', sortOrder: 2 },
  { _id: 'sc3', name: 'Хумс', emoji: '💅', sortOrder: 3 },
  { _id: 'sc4', name: 'Арьс арчилгаа', emoji: '✨', sortOrder: 4 },
  { _id: 'sc5', name: 'Массаж', emoji: '💆', sortOrder: 5 },
];

export const DEMO_BUSINESS_HOURS: BusinessHours[] = [
  { dayOfWeek: 0, openTime: '00:00', closeTime: '00:00', isClosed: true },
  { dayOfWeek: 1, openTime: '09:00', closeTime: '19:00', isClosed: false },
  { dayOfWeek: 2, openTime: '09:00', closeTime: '19:00', isClosed: false },
  { dayOfWeek: 3, openTime: '09:00', closeTime: '19:00', isClosed: false },
  { dayOfWeek: 4, openTime: '09:00', closeTime: '19:00', isClosed: false },
  { dayOfWeek: 5, openTime: '09:00', closeTime: '19:00', isClosed: false },
  { dayOfWeek: 6, openTime: '10:00', closeTime: '17:00', isClosed: false },
];
