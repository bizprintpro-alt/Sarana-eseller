'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar, { type SidebarSection } from '@/components/dashboard/Sidebar';

// ═══════════════════════════════════════════════════════
// Menu definitions per role (shop.mn-inspired)
// ═══════════════════════════════════════════════════════

const SELLER_SECTIONS: SidebarSection[] = [
  {
    title: 'Самбар',
    items: [
      { href: '/dashboard/seller', icon: '📊', label: 'Самбар' },
      { href: '/dashboard/seller/orders', icon: '📋', label: 'Захиалга' },
    ],
  },
  {
    title: 'Бараа удирдлага',
    items: [
      { href: '/dashboard/seller/products', icon: '📦', label: 'Бүтээгдэхүүн' },
      { href: '/dashboard/seller/categories', icon: '📂', label: 'Ангилал' },
      { href: '/dashboard/seller/brands', icon: '🏷️', label: 'Брэнд' },
      { href: '/dashboard/seller/inventory', icon: '📊', label: 'Нөөцийн удирдлага' },
    ],
  },
  {
    title: 'Хэрэглэгч & Борлуулалт',
    items: [
      { href: '/dashboard/seller/customers', icon: '👥', label: 'Хэрэглэгч' },
      { href: '/dashboard/seller/promotions', icon: '🎁', label: 'Урамшуулал' },
      { href: '/dashboard/seller/promo-codes', icon: '🏷️', label: 'Промо код' },
      { href: '/dashboard/seller/giftcards', icon: '💳', label: 'Бэлгийн карт' },
      { href: '/dashboard/seller/reviews', icon: '⭐', label: 'Сэтгэгдэл' },
    ],
  },
  {
    title: 'Контент',
    items: [
      { href: '/dashboard/seller/blog', icon: '📝', label: 'Нийтлэл' },
      { href: '/dashboard/seller/marketing', icon: '📢', label: 'Маркетинг' },
    ],
  },
  {
    title: 'AI Инноваци',
    items: [
      { href: '/dashboard/seller/ai-poster', icon: '🎨', label: 'AI Постер үүсгэгч' },
      { href: '/dashboard/seller/ai-logo', icon: '✨', label: 'AI Лого үүсгэгч' },
      { href: '/dashboard/seller/ai-description', icon: '📝', label: 'AI Тайлбар бичигч' },
      { href: '/dashboard/seller/ai-analytics', icon: '🤖', label: 'AI Зөвлөгч' },
    ],
  },
  {
    title: 'Санхүү & Тайлан',
    items: [
      { href: '/dashboard/seller/revenue', icon: '💵', label: 'Орлого' },
      { href: '/dashboard/seller/wallet', icon: '💰', label: 'Хэтэвч' },
      { href: '/dashboard/seller/analytics', icon: '📈', label: 'Хандалт & Тайлан' },
    ],
  },
  {
    title: 'Дэлгүүрийн тохиргоо',
    items: [
      { href: '/dashboard/seller/store-settings', icon: '🎨', label: 'Нүүр хуудас & Дизайн' },
      { href: '/dashboard/seller/domain', icon: '🌐', label: 'Домайн нэр' },
      { href: '/dashboard/seller/branches', icon: '🏪', label: 'Салбар удирдах' },
      { href: '/dashboard/seller/staff', icon: '👔', label: 'Ажилтан' },
      { href: '/dashboard/seller/settings', icon: '⚙️', label: 'Ерөнхий тохиргоо' },
    ],
  },
  {
    title: 'Багц & Төлбөр',
    items: [
      { href: '/dashboard/seller/package', icon: '👑', label: 'Миний багц' },
      { href: '/dashboard/seller/logs', icon: '📋', label: 'Лог бүртгэл' },
    ],
  },
];

const ADMIN_SECTIONS: SidebarSection[] = [
  {
    title: 'Платформ',
    items: [
      { href: '/dashboard/admin', icon: '📊', label: 'Самбар' },
      { href: '/dashboard/admin/users', icon: '👥', label: 'Хэрэглэгчид' },
      { href: '/dashboard/admin/orders', icon: '📦', label: 'Бүх захиалга' },
      { href: '/dashboard/admin/stores', icon: '🏪', label: 'Дэлгүүрүүд' },
      { href: '/dashboard/admin/commission', icon: '💰', label: 'Комисс' },
      { href: '/dashboard/admin/analytics', icon: '📈', label: 'Аналитик' },
    ],
  },
  {
    title: 'Тохиргоо',
    items: [
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

const ROLE_SECTIONS: Record<string, SidebarSection[]> = {
  seller: SELLER_SECTIONS,
  admin: ADMIN_SECTIONS,
  affiliate: AFFILIATE_SECTIONS,
  delivery: DELIVERY_SECTIONS,
  buyer: BUYER_SECTIONS,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
      } else {
        setReady(true);
      }
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Ачааллаж байна...</div>
      </div>
    );
  }

  const sections = ROLE_SECTIONS[user?.role || 'buyer'] || BUYER_SECTIONS;

  // Store info for seller sidebar (shop.mn style)
  const storeInfo = user?.role === 'seller'
    ? {
        name: user?.store?.name || user?.name + 'ийн дэлгүүр',
        url: (user?.store?.name || user?.name || 'store').toLowerCase().replace(/\s+/g, '-') + '.eseller.mn',
        plan: 'Үнэгүй',
        planBadge: 'Үнэгүй туршилт',
      }
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sections={sections} storeInfo={storeInfo} />
      <main className="ml-[260px] min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
