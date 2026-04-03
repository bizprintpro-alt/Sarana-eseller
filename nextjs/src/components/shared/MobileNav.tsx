'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Search, User } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Нүүр' },
  { href: '/store', icon: ShoppingBag, label: 'Дэлгүүр' },
  { href: '/store?focus=search', icon: Search, label: 'Хайх' },
  { href: '/login', icon: User, label: 'Профайл' },
];

export default function MobileNav() {
  const pathname = usePathname();

  // Hide on dashboard pages
  if (pathname.startsWith('/dashboard')) return null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0]/80 z-[9999] pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,.05)]">
        <div className="flex items-stretch h-14">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 no-underline text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-[#CC0000]' : 'text-[#94A3B8]'
                }`}
              >
                <div className={`relative ${isActive ? '' : ''}`}>
                  <tab.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#CC0000]" />
                  )}
                </div>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      {/* Spacer for mobile */}
      <div className="h-14 md:hidden" />
    </>
  );
}
