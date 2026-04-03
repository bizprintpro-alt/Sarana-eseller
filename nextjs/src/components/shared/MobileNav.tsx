'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Search, User } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Нүүр' },
  { href: '/store', icon: ShoppingBag, label: 'Дэлгүүр' },
  { href: '/store', icon: Search, label: 'Хайх' },
  { href: '/login', icon: User, label: 'Профайл' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E2E8F0] shadow-[0_-4px_20px_rgba(0,0,0,.08)] z-[9999] pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-stretch h-full">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 no-underline text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-brand' : 'text-[#94A3B8]'
                }`}
              >
                <tab.icon size={22} strokeWidth={1.8} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      {/* Spacer for mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
}
