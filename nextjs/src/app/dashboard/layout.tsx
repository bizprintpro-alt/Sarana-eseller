'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useShopTypeStore, type ShopType } from '@/lib/shop-type-store';
import Sidebar, { type SidebarSection } from '@/components/dashboard/Sidebar';

// ═══════════════════════════════════════════════════════
// Shared sections (used by both product and service)
// ═══════════════════════════════════════════════════════

const SAMBAR_PRODUCT: SidebarSection = {
  title: 'Самбар',
  items: [
    { href: '/dashboard/seller', icon: '📊', label: 'Самбар' },
    { href: '/dashboard/seller/orders', icon: '📋', label: 'Захиалга' },
    { href: '/dashboard/seller/chat', icon: '💬', label: 'Чат', isNew: true },
  ],
};

const SAMBAR_SERVICE: SidebarSection = {
  title: 'Самбар',
  items: [
    { href: '/dashboard/seller', icon: '📊', label: 'Самбар' },
    { href: '/dashboard/seller/orders', icon: '📋', label: 'Захиалга' },
    { href: '/dashboard/seller/chat', icon: '💬', label: 'Чат', isNew: true },
  ],
};

const PRODUCT_MANAGEMENT: SidebarSection = {
  title: 'Бараа удирдлага',
  items: [
    { href: '/dashboard/seller/products', icon: '📦', label: 'Бүтээгдэхүүн' },
    { href: '/dashboard/seller/categories', icon: '📂', label: 'Ангилал' },
    { href: '/dashboard/seller/brands', icon: '🏷️', label: 'Брэнд' },
    { href: '/dashboard/seller/inventory', icon: '📊', label: 'Нөөцийн удирдлага' },
  ],
};

const SERVICE_MANAGEMENT: SidebarSection = {
  title: 'Үйлчилгээ удирдлага',
  items: [
    { href: '/dashboard/seller/services', icon: '🛎️', label: 'Үйлчилгээнүүд' },
    { href: '/dashboard/seller/bookings', icon: '📅', label: 'Цаг захиалга' },
    { href: '/dashboard/seller/working-hours', icon: '🕐', label: 'Цагийн хуваарь' },
    { href: '/dashboard/seller/service-categories', icon: '📂', label: 'Ангилал' },
  ],
};

const CUSTOMER_SALES: SidebarSection = {
  title: 'Хэрэглэгч & Борлуулалт',
  items: [
    { href: '/dashboard/seller/customers', icon: '👥', label: 'Хэрэглэгч' },
    { href: '/dashboard/seller/promotions', icon: '🎁', label: 'Урамшуулал' },
    { href: '/dashboard/seller/promo-codes', icon: '🏷️', label: 'Промо код' },
    { href: '/dashboard/seller/giftcards', icon: '💳', label: 'Бэлгийн карт' },
    { href: '/dashboard/seller/reviews', icon: '⭐', label: 'Сэтгэгдэл' },
  ],
};

const CONTENT: SidebarSection = {
  title: 'Контент',
  items: [
    { href: '/dashboard/seller/blog', icon: '📝', label: 'Нийтлэл' },
    { href: '/dashboard/seller/marketing', icon: '📢', label: 'Маркетинг' },
  ],
};

const AI_SECTION: SidebarSection = {
  title: 'AI Инноваци',
  items: [
    { href: '/dashboard/seller/ai-poster', icon: '🎨', label: 'AI Постер үүсгэгч' },
    { href: '/dashboard/seller/ai-logo', icon: '✨', label: 'AI Лого үүсгэгч' },
    { href: '/dashboard/seller/ai-description', icon: '📝', label: 'AI Тайлбар бичигч' },
    { href: '/dashboard/seller/ai-analytics', icon: '🤖', label: 'AI Зөвлөгч' },
  ],
};

const FINANCE: SidebarSection = {
  title: 'Санхүү & Тайлан',
  items: [
    { href: '/dashboard/seller/revenue', icon: '💵', label: 'Орлого' },
    { href: '/dashboard/seller/wallet', icon: '💰', label: 'Хэтэвч' },
    { href: '/dashboard/seller/analytics', icon: '📈', label: 'Хандалт & Тайлан' },
    { href: '/dashboard/seller/integrations', icon: '🔗', label: 'Интеграц', isNew: true },
  ],
};

const STORE_SETTINGS: SidebarSection = {
  title: 'Дэлгүүрийн тохиргоо',
  items: [
    { href: '/dashboard/seller/store-settings', icon: '🎨', label: 'Нүүр хуудас & Дизайн' },
    { href: '/dashboard/seller/storefront-editor', icon: '✨', label: 'AI Дэлгүүр засварлагч', isNew: true },
    { href: '/dashboard/seller/themes', icon: '🎭', label: 'Theme store', isNew: true },
    { href: '/dashboard/seller/settings/shop-type', icon: '🏪', label: 'Дэлгүүрийн төрөл' },
    { href: '/dashboard/seller/settings/domain', icon: '🌐', label: 'Домайн тохиргоо' },
    { href: '/dashboard/seller/locations', icon: '📍', label: 'Байршлууд', isNew: true },
    { href: '/dashboard/seller/branches', icon: '🏪', label: 'Салбар удирдах' },
    { href: '/dashboard/seller/staff', icon: '👔', label: 'Ажилтан' },
    { href: '/dashboard/seller/settings', icon: '⚙️', label: 'Ерөнхий тохиргоо' },
  ],
};

const PACKAGE: SidebarSection = {
  title: 'Багц & Төлбөр',
  items: [
    { href: '/dashboard/seller/package', icon: '👑', label: 'Миний багц' },
    { href: '/dashboard/seller/logs', icon: '📋', label: 'Лог бүртгэл' },
  ],
};

// ═══════════════════════════════════════════════════════
// Entity-specific sidebar sections
// ═══════════════════════════════════════════════════════

const PRE_ORDER_MANAGEMENT: SidebarSection = {
  title: 'Захиалгын удирдлага',
  items: [
    { href: '/dashboard/seller/catalog', icon: '📖', label: 'Бараа каталог' },
    { href: '/dashboard/seller/queue', icon: '📋', label: 'Захиалгын дараалал', isNew: true },
    { href: '/dashboard/seller/batches', icon: '📦', label: 'Багцын захиалга', isNew: true },
    { href: '/dashboard/seller/tracking', icon: '📍', label: 'Ирааны мөрдөлт', isNew: true },
    { href: '/dashboard/seller/deposits', icon: '💳', label: 'Урьдчилгаа', isNew: true },
    { href: '/dashboard/seller/waitlist', icon: '👥', label: 'Хүлээлтийн жагсаалт' },
  ],
};

const AGENT_MANAGEMENT: SidebarSection = {
  title: 'Агентын удирдлага',
  items: [
    { href: '/dashboard/seller/listings', icon: '🏠', label: 'Зарууд' },
    { href: '/dashboard/seller/listings/new', icon: '➕', label: 'Зар нэмэх' },
    { href: '/dashboard/seller/map', icon: '🗺️', label: 'Байршлын зураг' },
    { href: '/dashboard/seller/inquiries', icon: '📩', label: 'Хариу хүсэлт' },
    { href: '/dashboard/seller/profile', icon: '👤', label: 'Профайл' },
  ],
};

const COMPANY_MANAGEMENT: SidebarSection = {
  title: 'Компанийн удирдлага',
  items: [
    { href: '/dashboard/seller/projects', icon: '🏗️', label: 'Төслүүд' },
    { href: '/dashboard/seller/gallery', icon: '🖼️', label: 'Бүтээгдэхүүний галерей' },
    { href: '/dashboard/seller/documents', icon: '📄', label: 'Баримт бичиг' },
    { href: '/dashboard/seller/inquiries', icon: '📩', label: 'Хүсэлт / Inquiry' },
    { href: '/dashboard/seller/promote', icon: '⭐', label: 'VIP байршил' },
  ],
};

const AUTO_DEALER_MANAGEMENT: SidebarSection = {
  title: 'Авто удирдлага',
  items: [
    { href: '/dashboard/seller/vehicles', icon: '🚗', label: 'Машины жагсаалт' },
    { href: '/dashboard/seller/test-drives', icon: '📅', label: 'Тест драйв захиалга' },
    { href: '/dashboard/seller/specs', icon: '📄', label: 'Техник үзүүлэлт' },
    { href: '/dashboard/seller/pricing', icon: '📊', label: 'Үнийн харьцуулалт' },
  ],
};

const DIGITAL_MANAGEMENT: SidebarSection = {
  title: 'Дижитал удирдлага',
  items: [
    { href: '/dashboard/seller/files', icon: '📁', label: 'Файлууд' },
    { href: '/dashboard/seller/downloads', icon: '⬇️', label: 'Татаж авалтууд' },
    { href: '/dashboard/seller/licenses', icon: '🔑', label: 'Лицензүүд' },
  ],
};

// ═══════════════════════════════════════════════════════
// Build seller sidebar based on shopType + entityType
// ═══════════════════════════════════════════════════════

function getSellerSections(shopType: ShopType, entityType?: string): SidebarSection[] {
  // Entity-specific dashboards
  if (entityType === 'pre_order') {
    return [SAMBAR_PRODUCT, PRE_ORDER_MANAGEMENT, CUSTOMER_SALES, AI_SECTION, FINANCE, STORE_SETTINGS, PACKAGE];
  }
  if (entityType === 'agent') {
    return [SAMBAR_PRODUCT, AGENT_MANAGEMENT, AI_SECTION, FINANCE, STORE_SETTINGS, PACKAGE];
  }
  if (entityType === 'company') {
    return [SAMBAR_PRODUCT, COMPANY_MANAGEMENT, CUSTOMER_SALES, AI_SECTION, FINANCE, STORE_SETTINGS, PACKAGE];
  }
  if (entityType === 'auto_dealer') {
    return [SAMBAR_PRODUCT, AUTO_DEALER_MANAGEMENT, CUSTOMER_SALES, AI_SECTION, FINANCE, STORE_SETTINGS, PACKAGE];
  }
  if (entityType === 'digital') {
    return [SAMBAR_PRODUCT, DIGITAL_MANAGEMENT, CUSTOMER_SALES, AI_SECTION, FINANCE, STORE_SETTINGS, PACKAGE];
  }

  // ShopType-based (original logic)
  if (shopType === 'service') {
    return [SAMBAR_SERVICE, SERVICE_MANAGEMENT, CUSTOMER_SALES, CONTENT, AI_SECTION, FINANCE, STORE_SETTINGS, PACKAGE];
  }
  if (shopType === 'hybrid') {
    return [SAMBAR_PRODUCT, PRODUCT_MANAGEMENT, SERVICE_MANAGEMENT, CUSTOMER_SALES, CONTENT, AI_SECTION, FINANCE, STORE_SETTINGS, PACKAGE];
  }

  // product (default)
  return [SAMBAR_PRODUCT, PRODUCT_MANAGEMENT, CUSTOMER_SALES, CONTENT, AI_SECTION, FINANCE, STORE_SETTINGS, PACKAGE];
}

// ═══════════════════════════════════════════════════════
// Other role sidebars
// ═══════════════════════════════════════════════════════

const ADMIN_SECTIONS: SidebarSection[] = [
  {
    title: 'Платформ',
    items: [
      { href: '/dashboard/admin', icon: '📊', label: 'Самбар' },
      { href: '/dashboard/admin/users', icon: '👥', label: 'Хэрэглэгчид' },
      { href: '/dashboard/admin/orders', icon: '📦', label: 'Бүх захиалга' },
      { href: '/dashboard/admin/stores', icon: '🏪', label: 'Дэлгүүрүүд' },
      { href: '/dashboard/admin/entities', icon: '🏢', label: 'Бүх нэгж', isNew: true },
      { href: '/dashboard/admin/locations', icon: '📍', label: 'Байршил удирдлага', isNew: true },
      { href: '/dashboard/admin/revenue', icon: '💵', label: 'Орлого', isNew: true },
      { href: '/dashboard/admin/shops', icon: '🏪', label: 'Дэлгүүрүүд', isNew: true },
      { href: '/dashboard/admin/homepage', icon: '🏠', label: 'Нүүр хуудас', isNew: true },
      { href: '/dashboard/admin/marketing', icon: '📢', label: 'Маркетинг', isNew: true },
      { href: '/dashboard/admin/chat-monitor', icon: '💬', label: 'Чат хяналт', isNew: true },
      { href: '/dashboard/admin/config', icon: '⚙️', label: 'Тохиргоо', isNew: true },
      { href: '/dashboard/admin/ai', icon: '🧠', label: 'Claude AI', isNew: true },
      { href: '/dashboard/admin/analytics-dashboard', icon: '📈', label: 'Аналитик', isNew: true },
    ],
  },
  {
    title: 'Тохиргоо',
    items: [
      { href: '/dashboard/admin/reference-id', icon: '🔢', label: 'Reference ID', isNew: true },
      { href: '/dashboard/admin/announcements', icon: '📢', label: 'Мэдэгдлийн мөр', isNew: true },
      { href: '/dashboard/admin/settings', icon: '⚙️', label: 'Системийн тохиргоо' },
    ],
  },
];

const AFFILIATE_SECTIONS: SidebarSection[] = [
  {
    title: 'Борлуулагч',
    items: [
      { href: '/dashboard/affiliate', icon: '📊', label: 'Самбар' },
      { href: '/dashboard/affiliate/products', icon: '🛍️', label: 'Бараа сонгох' },
      { href: '/dashboard/affiliate/earnings', icon: '💰', label: 'Орлого' },
      { href: '/dashboard/affiliate/wallet', icon: '💳', label: 'Хэтэвч' },
      { href: '/dashboard/affiliate/marketing', icon: '📢', label: 'Маркетинг' },
    ],
  },
];

const DELIVERY_SECTIONS: SidebarSection[] = [
  {
    title: 'Жолооч',
    items: [
      { href: '/dashboard/delivery', icon: '🚚', label: 'Самбар' },
      { href: '/dashboard/delivery/active', icon: '📦', label: 'Идэвхтэй хүргэлт' },
      { href: '/dashboard/delivery/history', icon: '📋', label: 'Түүх' },
      { href: '/dashboard/delivery/earnings', icon: '💰', label: 'Орлого' },
    ],
  },
];

const BUYER_SECTIONS: SidebarSection[] = [
  {
    title: 'Миний данс',
    items: [
      { href: '/dashboard', icon: '📊', label: 'Самбар' },
      { href: '/store', icon: '🛒', label: 'Дэлгүүр' },
      { href: '/dashboard/orders', icon: '📦', label: 'Захиалгууд' },
      { href: '/dashboard/wishlist', icon: '❤️', label: 'Хүслийн жагсаалт' },
      { href: '/dashboard/settings', icon: '⚙️', label: 'Тохиргоо' },
    ],
  },
];

const OTHER_ROLE_SECTIONS: Record<string, SidebarSection[]> = {
  admin: ADMIN_SECTIONS,
  superadmin: ADMIN_SECTIONS,
  affiliate: AFFILIATE_SECTIONS,
  delivery: DELIVERY_SECTIONS,
  buyer: BUYER_SECTIONS,
};

// ═══════════════════════════════════════════════════════
// Layout
// ═══════════════════════════════════════════════════════

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const shopType = useShopTypeStore((s) => s.shopType);
  const loadShopType = useShopTypeStore((s) => s.load);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
      } else {
        setReady(true);
        loadShopType();
      }
    }
  }, [router, loadShopType]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[var(--esl-bg-page)] flex items-center justify-center">
        <div className="text-[var(--esl-text-muted)] text-sm">Ачааллаж байна...</div>
      </div>
    );
  }

  const role = user?.role || 'buyer';
  const userEntityType = (user as any)?.entityType || undefined;
  const sections = role === 'seller'
    ? getSellerSections(shopType, userEntityType)
    : OTHER_ROLE_SECTIONS[role] || BUYER_SECTIONS;

  const storeInfo = user?.role === 'seller'
    ? {
        name: user?.store?.name || user?.name + 'ийн дэлгүүр',
        url: (user?.store?.name || user?.name || 'store').toLowerCase().replace(/\s+/g, '-') + '.eseller.mn',
        plan: 'Үнэгүй',
        planBadge: 'Үнэгүй туршилт',
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[var(--esl-bg-page)]">
      <Sidebar sections={sections} storeInfo={storeInfo} />
      <main className="ml-[260px] min-h-screen transition-all duration-300 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
