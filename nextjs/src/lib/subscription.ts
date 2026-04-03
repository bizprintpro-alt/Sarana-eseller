// ══════════════════════════════════════════════════════════════
// eseller.mn — Subscription / Package System
// Standard, Ultimate, AI Pro багцуудын хязгаарлалтын логик
// ══════════════════════════════════════════════════════════════

export type PlanId = 'free' | 'standard' | 'ultimate' | 'ai_pro';

export interface PlanLimits {
  maxProducts: number;       // Барааны дээд тоо
  maxStaff: number;          // Ажилчдын тоо
  maxBranches: number;       // Салбарын тоо
  maxCategories: number;     // Ангилалын тоо
  maxBrands: number;         // Брэндийн тоо
  maxStorage: number;        // Хадгалах зай (MB)
  aiCredits: number;         // AI кредит (сар бүр)
  customDomain: boolean;     // Хувийн домайн
  removeBranding: boolean;   // eseller.mn лого арилгах
  analytics: boolean;        // Дэлгэрэнгүй аналитик
  prioritySupport: boolean;  // Тэргүүлэх дэмжлэг
  blogPosts: number;         // Нийтлэлийн тоо
  promoCodesLimit: number;   // Промо кодын тоо
  giftCards: boolean;        // Бэлгийн карт
  multiLanguage: boolean;    // Олон хэлний дэмжлэг
  apiAccess: boolean;        // API хандалт
  exportData: boolean;       // Дата экспорт
  seoTools: boolean;         // SEO хэрэгсэл
}

export interface Plan {
  id: PlanId;
  name: string;
  nameEn: string;
  price: number;            // ₮/сар
  yearlyPrice: number;      // ₮/жил
  description: string;
  badge?: string;
  color: string;
  limits: PlanLimits;
  features: string[];       // Үзүүлэх боломжуудын жагсаалт
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Үнэгүй',
    nameEn: 'Free',
    price: 0,
    yearlyPrice: 0,
    description: 'Эхлэгчдэд зориулсан үнэгүй багц',
    color: '#94A3B8',
    limits: {
      maxProducts: 20,
      maxStaff: 1,
      maxBranches: 1,
      maxCategories: 5,
      maxBrands: 3,
      maxStorage: 500,
      aiCredits: 0,
      customDomain: false,
      removeBranding: false,
      analytics: false,
      prioritySupport: false,
      blogPosts: 3,
      promoCodesLimit: 2,
      giftCards: false,
      multiLanguage: false,
      apiAccess: false,
      exportData: false,
      seoTools: false,
    },
    features: [
      '20 бараа хүртэл',
      '1 ажилтан',
      '500MB хадгалах зай',
      'Үндсэн дэлгүүрийн хуудас',
      'eseller.mn субдомайн',
      'QPay төлбөр',
    ],
  },
  {
    id: 'standard',
    name: 'Стандарт',
    nameEn: 'Standard',
    price: 29900,
    yearlyPrice: 299000,
    description: 'Жижиг, дунд бизнест тохиромжтой',
    badge: 'Түгээмэл',
    color: '#6366F1',
    limits: {
      maxProducts: 500,
      maxStaff: 5,
      maxBranches: 3,
      maxCategories: 30,
      maxBrands: 20,
      maxStorage: 5000,
      aiCredits: 50,
      customDomain: true,
      removeBranding: true,
      analytics: true,
      prioritySupport: false,
      blogPosts: 50,
      promoCodesLimit: 20,
      giftCards: true,
      multiLanguage: false,
      apiAccess: false,
      exportData: true,
      seoTools: true,
    },
    features: [
      '500 бараа хүртэл',
      '5 ажилтан',
      '3 салбар',
      '5GB хадгалах зай',
      'Хувийн домайн',
      'Лого арилгах',
      'Дэлгэрэнгүй аналитик',
      '50 AI кредит/сар',
      'Бэлгийн карт',
      'SEO хэрэгсэл',
      'Дата экспорт',
    ],
  },
  {
    id: 'ultimate',
    name: 'Алтимэйт',
    nameEn: 'Ultimate',
    price: 59900,
    yearlyPrice: 599000,
    description: 'Том бизнес, enterprise шийдэл',
    badge: 'Хамгийн сайн',
    color: '#D97706',
    limits: {
      maxProducts: 5000,
      maxStaff: 20,
      maxBranches: 10,
      maxCategories: 100,
      maxBrands: 100,
      maxStorage: 50000,
      aiCredits: 200,
      customDomain: true,
      removeBranding: true,
      analytics: true,
      prioritySupport: true,
      blogPosts: -1,  // unlimited
      promoCodesLimit: -1,
      giftCards: true,
      multiLanguage: true,
      apiAccess: true,
      exportData: true,
      seoTools: true,
    },
    features: [
      '5,000 бараа хүртэл',
      '20 ажилтан',
      '10 салбар',
      '50GB хадгалах зай',
      'Хувийн домайн',
      '200 AI кредит/сар',
      'Олон хэлний дэмжлэг',
      'API хандалт',
      'Тэргүүлэх дэмжлэг',
      'Бүх боломжууд',
    ],
  },
  {
    id: 'ai_pro',
    name: 'AI Pro',
    nameEn: 'AI Pro',
    price: 99900,
    yearlyPrice: 999000,
    description: 'AI-д суурилсан бүрэн автоматжуулалт',
    badge: 'AI Хүчирхэг',
    color: '#EC4899',
    limits: {
      maxProducts: -1,  // unlimited
      maxStaff: -1,
      maxBranches: -1,
      maxCategories: -1,
      maxBrands: -1,
      maxStorage: 200000,
      aiCredits: -1,   // unlimited
      customDomain: true,
      removeBranding: true,
      analytics: true,
      prioritySupport: true,
      blogPosts: -1,
      promoCodesLimit: -1,
      giftCards: true,
      multiLanguage: true,
      apiAccess: true,
      exportData: true,
      seoTools: true,
    },
    features: [
      'Хязгааргүй бараа',
      'Хязгааргүй ажилтан',
      'Хязгааргүй AI кредит',
      '200GB хадгалах зай',
      'AI Постер үүсгэгч',
      'AI Лого үүсгэгч',
      'AI Тайлбар бичигч',
      'AI Зөвлөгч (борлуулалт)',
      'Бүх Ultimate боломжууд',
      '24/7 Дэмжлэг',
    ],
  },
];

// ══════ Subscription State ══════
const SUB_KEY = 'eseller_subscription';

export interface SubscriptionState {
  planId: PlanId;
  startDate: string;
  endDate: string;
  aiCreditsUsed: number;
  productsCount: number;
  staffCount: number;
  branchesCount: number;
  storageUsed: number;  // MB
}

export function getSubscription(): SubscriptionState {
  if (typeof window === 'undefined') {
    return getDefaultSubscription();
  }
  try {
    const raw = localStorage.getItem(SUB_KEY);
    return raw ? JSON.parse(raw) : getDefaultSubscription();
  } catch {
    return getDefaultSubscription();
  }
}

function getDefaultSubscription(): SubscriptionState {
  return {
    planId: 'free',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    aiCreditsUsed: 0,
    productsCount: 0,
    staffCount: 1,
    branchesCount: 1,
    storageUsed: 0,
  };
}

export function saveSubscription(sub: SubscriptionState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUB_KEY, JSON.stringify(sub));
  }
}

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) || PLANS[0];
}

export function getCurrentPlan(): Plan {
  return getPlan(getSubscription().planId);
}

// ══════ Check Logic ══════
export type CheckResult = { allowed: boolean; message?: string; current: number; limit: number };

export function checkLimit(field: keyof PlanLimits, currentCount: number): CheckResult {
  const plan = getCurrentPlan();
  const limit = plan.limits[field];

  if (typeof limit === 'boolean') {
    return { allowed: limit as boolean, current: currentCount, limit: limit ? 1 : 0, message: limit ? undefined : `${plan.name} багцад энэ боломж байхгүй. Багцаа шинэчлэнэ үү.` };
  }

  const numLimit = limit as number;
  if (numLimit === -1) return { allowed: true, current: currentCount, limit: -1 }; // unlimited

  if (currentCount >= numLimit) {
    return {
      allowed: false,
      current: currentCount,
      limit: numLimit,
      message: `${plan.name} багцын хязгаарт хүрлээ (${currentCount}/${numLimit}). Багцаа шинэчлэнэ үү.`,
    };
  }

  return { allowed: true, current: currentCount, limit: numLimit };
}

export function canAddProduct(): CheckResult {
  const sub = getSubscription();
  return checkLimit('maxProducts', sub.productsCount);
}

export function canAddStaff(): CheckResult {
  const sub = getSubscription();
  return checkLimit('maxStaff', sub.staffCount);
}

export function canUseAI(): CheckResult {
  const sub = getSubscription();
  return checkLimit('aiCredits', sub.aiCreditsUsed);
}

export function canAddBranch(): CheckResult {
  const sub = getSubscription();
  return checkLimit('maxBranches', sub.branchesCount);
}

export function getRemainingDays(): number {
  const sub = getSubscription();
  const end = new Date(sub.endDate);
  const diff = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function getUsagePercent(field: 'products' | 'staff' | 'storage' | 'aiCredits'): number {
  const sub = getSubscription();
  const plan = getCurrentPlan();

  const map: Record<string, [number, number]> = {
    products: [sub.productsCount, plan.limits.maxProducts],
    staff: [sub.staffCount, plan.limits.maxStaff],
    storage: [sub.storageUsed, plan.limits.maxStorage],
    aiCredits: [sub.aiCreditsUsed, plan.limits.aiCredits],
  };

  const [current, limit] = map[field] || [0, 1];
  if (limit === -1) return 0; // unlimited
  return Math.min(100, Math.round((current / limit) * 100));
}
