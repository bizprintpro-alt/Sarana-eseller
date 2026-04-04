'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Megaphone, Store, User } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Нүүр' },
  { href: '/store', icon: ShoppingBag, label: 'Дэлгүүр' },
  { href: '/feed', icon: Megaphone, label: 'Зар' },
  { href: '/shops', icon: Store, label: 'Дэлгүүрүүд' },
  { href: '/login', icon: User, label: 'Профайл' },
];

export default function MobileNav() {
  const pathname = usePathname();

  if (pathname.startsWith('/dashboard')) return null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--esl-bg-section)]/95 backdrop-blur-xl border-t border-[var(--esl-border)] z-[9999] pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-stretch h-14">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 no-underline text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-[#E8242C]' : 'text-[#666]'
                }`}
              >
                <div className="relative">
                  <tab.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E8242C]" />
                  )}
                </div>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="h-14 md:hidden" />
    </>
  );
}
