'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { getInitials } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingCart, Package, FolderTree, Tag,
  BarChart3, Users, Gift, CreditCard, Star, PenSquare,
  Megaphone, Palette, Sparkles, Brain, Bot, Wallet,
  Globe, Building2, UserCog, Settings, Bell, ScrollText,
  ChevronDown, ExternalLink, LogOut, Crown, Zap,
} from 'lucide-react';

// ═══ Icon Map ═══
const ICON_MAP: Record<string, React.ElementType> = {
  '📊': LayoutDashboard, '📋': ShoppingCart, '📦': Package, '📂': FolderTree,
  '🏷️': Tag, '📊 ': BarChart3, '👥': Users, '🎁': Gift, '💳': CreditCard,
  '⭐': Star, '📝': PenSquare, '📢': Megaphone, '🎨': Palette,
  '✨': Sparkles, '🤖': Bot, '💰': Wallet, '💵': Wallet,
  '🌐': Globe, '🏪': Building2, '👔': UserCog, '⚙️': Settings,
  '🔔': Bell, '👑': Crown, '📈': BarChart3,
};

// ═══ Types ═══
export interface SidebarItem {
  href: string;
  icon: string;
  label: string;
  badge?: string | number;
  external?: boolean;
  isNew?: boolean;
}

export interface SidebarSection {
  title: string;
  collapsed?: boolean;
  items: SidebarItem[];
}

interface SidebarProps {
  sections: SidebarSection[];
  storeInfo?: {
    name: string;
    url?: string;
    plan?: string;
    planBadge?: string;
  };
}

export default function Sidebar({ sections, storeInfo }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('sb-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sb-collapsed', String(next));
  };

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white flex flex-col transition-all duration-200 z-40 ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
      style={{ borderRight: '1px solid #eef0f4' }}
    >
      {/* ═══ Logo ═══ */}
      <div className={`flex items-center h-[56px] border-b border-gray-100 shrink-0 ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-bold text-slate-900 tracking-tight">
              eseller<span className="text-indigo-600">.mn</span>
            </span>
          )}
        </Link>
      </div>

      {/* ═══ Store Info ═══ */}
      {storeInfo && !collapsed && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              {getInitials(storeInfo.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-800 truncate leading-tight">{storeInfo.name}</div>
              {storeInfo.url && (
                <div className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">{storeInfo.url}</div>
              )}
            </div>
            <Link
              href="/store"
              target="_blank"
              className="w-6 h-6 rounded-md bg-slate-50 hover:bg-indigo-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors no-underline"
            >
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          {storeInfo.plan && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: '100%' }} />
              </div>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                {storeInfo.planBadge || storeInfo.plan}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ═══ Menu ═══ */}
      <nav className="flex-1 overflow-y-auto py-2 px-2.5">
        {sections.map((section, si) => {
          const isCollapsed = collapsedSections[section.title];
          return (
            <div key={section.title} className={si > 0 ? 'mt-1' : ''}>
              {/* Section Header */}
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 mt-1 mb-0.5 cursor-pointer bg-transparent border-none group"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 group-hover:text-slate-500 transition-colors">
                    {section.title}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-300 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>
              )}

              {/* Items */}
              {!isCollapsed && section.items.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = ICON_MAP[item.icon] || Package;

                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    className={`group flex items-center gap-2.5 h-9 rounded-lg text-[13px] no-underline transition-all duration-150 mb-px ${
                      collapsed ? 'justify-center px-0 mx-0.5' : 'px-2.5'
                    } ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-[inset_0_0_0_1px_rgba(79,70,229,0.1)]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <IconComponent className={`shrink-0 transition-colors duration-150 ${
                      collapsed ? 'w-[18px] h-[18px]' : 'w-4 h-4'
                    } ${
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'
                    }`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className={`text-[10px] font-semibold px-1.5 py-px rounded-md leading-tight ${
                            typeof item.badge === 'number' && item.badge > 0
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {item.isNew && (
                          <span className="text-[9px] font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-1.5 py-px rounded uppercase">
                            new
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}

              {/* Section divider */}
              {si < sections.length - 1 && !collapsed && (
                <div className="mx-3 mt-1 border-b border-slate-100" />
              )}
            </div>
          );
        })}
      </nav>

      {/* ═══ Upgrade CTA ═══ */}
      {!collapsed && storeInfo?.plan === 'Үнэгүй' && (
        <div className="mx-3 mb-2">
          <Link
            href="/dashboard/seller/package"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[12px] font-semibold no-underline shadow-sm hover:shadow-md hover:from-indigo-700 hover:to-violet-700 transition-all"
          >
            <Crown className="w-3.5 h-3.5" />
            Багц шинэчлэх
          </Link>
        </div>
      )}

      {/* ═══ User ═══ */}
      <div className="border-t border-gray-100 p-3 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-[11px] font-semibold shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-slate-700 truncate leading-tight">{user?.name || '...'}</div>
              <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">{user?.email || ''}</div>
            </div>
            <button
              onClick={logout}
              className="w-7 h-7 rounded-md bg-transparent hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors border-none cursor-pointer"
              title="Гарах"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="flex items-center justify-center w-full py-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors border-none bg-transparent cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ═══ Collapse Toggle ═══ */}
      <button
        onClick={toggle}
        className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer text-[10px] transition-all z-50 shadow-xs"
      >
        {collapsed ? '→' : '←'}
      </button>
    </aside>
  );
}
