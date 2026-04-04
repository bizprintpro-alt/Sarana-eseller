'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import EsellerLogo from '@/components/shared/EsellerLogo';
import MobileNav from '@/components/shared/MobileNav';
import {
  Search, MapPin, Eye, Clock, Plus, Filter, ChevronDown,
  Home, Car, Smartphone, ShoppingBag, Wrench, Sofa, Baby,
  Dumbbell, Sparkles, Package, Crown, Star, Flame, ArrowUpDown,
  X, Heart,
} from 'lucide-react';

/* ═══ Types ═══ */
type ItemTier = 'vip' | 'featured' | 'discounted' | 'normal';
type EntityType = 'store' | 'agent' | 'company' | 'auto_dealer' | 'service' | 'user';

const TIER_CONFIG: Record<ItemTier, { label: string; badge: string; color: string; border: string; bg: string }> = {
  vip: { label: 'ВИП', badge: '👑', color: '#D4AF37', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
  featured: { label: 'Онцлох', badge: '⭐', color: '#3B82F6', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
  discounted: { label: 'Хямдрал', badge: '🔥', color: '#EF4444', border: 'border-red-500/30', bg: 'bg-red-500/5' },
  normal: { label: 'Энгийн', badge: '', color: '#6B7280', border: 'border-[#2A2A2A]', bg: '' },
};

const ENTITY_LABELS: Record<EntityType, { label: string; emoji: string }> = {
  store: { label: 'Дэлгүүр', emoji: '🏪' },
  agent: { label: 'Агент', emoji: '🏠' },
  company: { label: 'Компани', emoji: '🏗️' },
  auto_dealer: { label: 'Авто', emoji: '🚗' },
  service: { label: 'Үйлчилгээ', emoji: '🛎️' },
  user: { label: 'Хэрэглэгч', emoji: '👤' },
};

const CATEGORIES = [
  { key: 'all', label: 'Бүгд', Icon: Package },
  { key: 'apartment', label: 'Орон сууц', Icon: Home },
  { key: 'auto', label: 'Авто', Icon: Car },
  { key: 'electronics', label: 'Электроник', Icon: Smartphone },
  { key: 'fashion', label: 'Хувцас', Icon: ShoppingBag },
  { key: 'services', label: 'Үйлчилгээ', Icon: Wrench },
  { key: 'furniture', label: 'Тавилга', Icon: Sofa },
  { key: 'kids', label: 'Хүүхэд', Icon: Baby },
  { key: 'sports', label: 'Спорт', Icon: Dumbbell },
  { key: 'beauty', label: 'Гоо сайхан', Icon: Sparkles },
];

const DISTRICTS = ['Бүгд', 'СБД', 'ХУД', 'БЗД', 'ЧД', 'БГД', 'СХД', 'НД', 'БНД'];
const SORT_OPTIONS = [
  { key: 'newest', label: 'Шинэ' },
  { key: 'price_asc', label: 'Үнэ ↑' },
  { key: 'price_desc', label: 'Үнэ ↓' },
  { key: 'popular', label: 'Эрэлттэй' },
];

/* ═══ Demo Data ═══ */
const DEMO_FEED = [
  { id: '1', refId: 'VIP-AGT-001', title: '3 өрөө байр, 13-р хороолол', description: '78мкв, 5 давхарт, шинэ засвартай, тавилгатай. Цонх нар руу харсан, 2 ариун цэврийн өрөөтэй.', price: 280000000, images: [], category: 'apartment', entityType: 'agent' as EntityType, entityName: 'Голден Риэлти', verified: true, tier: 'vip' as ItemTier, viewCount: 1245, district: 'СБД', metadata: { sqm: 78, rooms: 3, floor: 5 }, createdAt: '2026-04-01' },
  { id: '2', refId: 'VIP-AUTO-001', title: 'Toyota Prius 2022', description: '45,000км, хар өнгө, чипээр ороогүй, татвар төлсөн. Full option.', price: 58000000, images: [], category: 'auto', entityType: 'auto_dealer' as EntityType, entityName: 'AutoMall', verified: true, tier: 'vip' as ItemTier, viewCount: 892, district: 'ХУД', metadata: { year: 2022, mileage: 45000, fuel: 'Hybrid' }, createdAt: '2026-04-02' },
  { id: '3', refId: 'VIP-CMP-001', title: 'Шинэ барилга, 19-р хороолол', description: '45-95мкв, 1-3 өрөө, 2027 он хүлээлгэж өгнө. Банкны зээлтэй.', price: 95000000, originalPrice: 110000000, images: [], category: 'apartment', entityType: 'company' as EntityType, entityName: 'МАК Констракшн', verified: true, tier: 'vip' as ItemTier, viewCount: 3456, district: 'НД', metadata: { sqm: 65, rooms: 2 }, createdAt: '2026-03-30' },
  { id: '4', refId: 'FTR-SVC-001', title: 'Вэбсайт хийж өгнө', description: 'React, Next.js, Mobile app хөгжүүлэлт. 3-5 хоногт бэлэн болно.', price: 2500000, images: [], category: 'services', entityType: 'service' as EntityType, entityName: 'TechPro', verified: false, tier: 'featured' as ItemTier, viewCount: 567, district: 'СБД', createdAt: '2026-04-01' },
  { id: '5', refId: 'FTR-USR-001', title: 'iPhone 15 Pro Max 256GB', description: 'Хэрэглээгүй шинэ, баталгаатай. Утасны хайрцагтай, бүрэн комплект.', price: 3800000, images: [], category: 'electronics', entityType: 'user' as EntityType, entityName: 'Бат', verified: false, tier: 'featured' as ItemTier, viewCount: 432, district: 'БЗД', createdAt: '2026-04-02' },
  { id: '6', refId: 'DSC-STR-001', title: 'Cashmere цамц 70% OFF', description: '100% монгол ноолуур. XS-XXL хэмжээтэй. Өвөлд тохиромжтой.', price: 45000, originalPrice: 150000, images: [], category: 'fashion', entityType: 'store' as EntityType, entityName: 'Gobi Store', verified: true, tier: 'discounted' as ItemTier, viewCount: 2341, district: 'СБД', createdAt: '2026-03-28' },
  { id: '7', refId: 'NRM-USR-001', title: 'Буцлуур зарна', description: 'Хэрэглэсэн, хэвийн ажилладаг. Тээвэрлэлт хийнэ.', price: 35000, images: [], category: 'electronics', entityType: 'user' as EntityType, entityName: 'Сараа', verified: false, tier: 'normal' as ItemTier, viewCount: 89, district: 'ЧД', createdAt: '2026-04-03' },
  { id: '8', refId: 'NRM-USR-002', title: '2 өрөө байр түрээслүүлнэ', description: 'Хотын төвд, шинэ засвартай. Сар бүр 1.2 сая.', price: 1200000, images: [], category: 'apartment', entityType: 'user' as EntityType, entityName: 'Дорж', verified: false, tier: 'normal' as ItemTier, viewCount: 234, district: 'СБД', metadata: { sqm: 55, rooms: 2 }, createdAt: '2026-04-02' },
  { id: '9', refId: 'NRM-AUTO-001', title: 'Hyundai Tucson 2019', description: '85,000км, цагаан, бензин. Осолд ороогүй.', price: 42000000, images: [], category: 'auto', entityType: 'user' as EntityType, entityName: 'Ганаа', verified: false, tier: 'normal' as ItemTier, viewCount: 156, district: 'БГД', metadata: { year: 2019, mileage: 85000, fuel: 'Бензин' }, createdAt: '2026-04-01' },
  { id: '10', refId: 'NRM-USR-003', title: 'Диван + ширээ комплект', description: 'Хэрэглэсэн, L хэлбэрийн диван, кофены ширээ', price: 850000, images: [], category: 'furniture', entityType: 'user' as EntityType, entityName: 'Оюука', verified: false, tier: 'normal' as ItemTier, viewCount: 67, district: 'БНД', createdAt: '2026-04-03' },
  { id: '11', refId: 'NRM-USR-004', title: 'Гэрийн цэвэрлэгээ хийнэ', description: 'Мэргэжлийн цэвэрлэгээ, 1-4 өрөө гэрт.', price: 80000, images: [], category: 'services', entityType: 'user' as EntityType, entityName: 'Цэвэр Гэр', verified: false, tier: 'normal' as ItemTier, viewCount: 312, district: 'СХД', createdAt: '2026-04-03' },
  { id: '12', refId: 'NRM-USR-005', title: 'Samsung Galaxy S24 Ultra', description: '12/256GB, хэрэглэсэн 3 сар, бүрэн комплект', price: 2800000, images: [], category: 'electronics', entityType: 'user' as EntityType, entityName: 'Тэмүүжин', verified: false, tier: 'normal' as ItemTier, viewCount: 198, district: 'ХУД', createdAt: '2026-04-03' },
];

function formatPrice(n: number) {
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + ' тэрбум₮';
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + ' сая₮';
  return n.toLocaleString() + '₮';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Өнөөдөр';
  if (days === 1) return 'Өчигдөр';
  if (days < 7) return `${days} өдрийн өмнө`;
  return dateStr;
}

function categoryEmoji(cat: string) {
  const map: Record<string, string> = { apartment: '🏠', auto: '🚗', electronics: '📱', fashion: '👗', services: '🔧', furniture: '🛋️', kids: '🧸', sports: '⚽', beauty: '💄' };
  return map[cat] || '📦';
}

/* ═══ Feed Card ═══ */
function FeedCard({ item }: { item: typeof DEMO_FEED[0] }) {
  const tier = TIER_CONFIG[item.tier];
  const entity = ENTITY_LABELS[item.entityType];
  const isVip = item.tier === 'vip';
  const disc = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;

  return (
    <div className={`group rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,.3)] hover:-translate-y-0.5 cursor-pointer ${tier.border} ${tier.bg || 'bg-[#1A1A1A]'}`}>
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className={`relative h-48 sm:h-auto sm:w-56 shrink-0 flex items-center justify-center ${isVip ? 'bg-[#1A1500]' : 'bg-[#2A2A2A]'}`}>
          <span className="text-6xl transition-transform duration-300 group-hover:scale-110">{categoryEmoji(item.category)}</span>
          {item.tier !== 'normal' && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold" style={{ backgroundColor: tier.color + '20', color: tier.color }}>
              {tier.badge} {tier.label}
            </div>
          )}
          {disc > 0 && (
            <div className="absolute top-3 right-3 bg-[#E8242C] text-white text-xs font-bold px-2 py-1 rounded-md">-{disc}%</div>
          )}
          <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5">
          {/* Entity + district */}
          <div className="flex items-center gap-2 text-xs text-[#A0A0A0] mb-2">
            <span>{entity.emoji} {item.entityName}</span>
            {item.verified && <span className="text-blue-400">✓</span>}
            {item.district && (
              <>
                <span className="text-[#3D3D3D]">·</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.district}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className={`text-base font-extrabold mb-1.5 line-clamp-2 leading-snug ${isVip ? 'text-[#FFD700]' : 'text-white'} group-hover:text-[#FF4D53] transition-colors`}>
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#888] line-clamp-2 mb-3">{item.description}</p>

          {/* Metadata chips */}
          {item.metadata && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.metadata.sqm && <span className="text-[11px] font-semibold text-[#D0D0D0] bg-[#2A2A2A] px-2 py-1 rounded">{item.metadata.sqm}м²</span>}
              {item.metadata.rooms && <span className="text-[11px] font-semibold text-[#D0D0D0] bg-[#2A2A2A] px-2 py-1 rounded">{item.metadata.rooms} өрөө</span>}
              {item.metadata.year && <span className="text-[11px] font-semibold text-[#D0D0D0] bg-[#2A2A2A] px-2 py-1 rounded">{item.metadata.year} он</span>}
              {item.metadata.mileage && <span className="text-[11px] font-semibold text-[#D0D0D0] bg-[#2A2A2A] px-2 py-1 rounded">{(item.metadata.mileage / 1000).toFixed(0)}мян км</span>}
              {item.metadata.fuel && <span className="text-[11px] font-semibold text-[#D0D0D0] bg-[#2A2A2A] px-2 py-1 rounded">{item.metadata.fuel}</span>}
            </div>
          )}

          {/* Price + stats */}
          <div className="flex items-end justify-between">
            <div>
              <span className={`text-xl font-black ${isVip ? 'text-[#FFD700]' : 'text-[#E8242C]'}`}>{formatPrice(item.price)}</span>
              {disc > 0 && <span className="text-xs text-[#555] line-through ml-2">{formatPrice(item.originalPrice!)}</span>}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#555]">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.viewCount}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(item.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Main Page ═══ */
export default function FeedPage() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [activeDistrict, setActiveDistrict] = useState('Бүгд');
  const [activeSort, setActiveSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...DEMO_FEED];
    if (activeCat !== 'all') list = list.filter(i => i.category === activeCat);
    if (activeDistrict !== 'Бүгд') list = list.filter(i => i.district === activeDistrict);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    // Sort: VIP first always, then by sort option
    const tierOrder: Record<ItemTier, number> = { vip: 0, featured: 1, discounted: 2, normal: 3 };
    list.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
    return list;
  }, [search, activeCat, activeDistrict, activeSort]);

  const vipCount = filtered.filter(i => i.tier === 'vip').length;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#111111] border-b border-[#2A2A2A]">
        <div className="max-w-[1320px] mx-auto px-4 h-16 flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <EsellerLogo size={32} />
            <span className="text-xl font-black text-white hidden sm:block">eseller<span className="text-[#E31E24]">.mn</span></span>
          </Link>
          <div className="flex-1" />
          <Link href="/store" className="text-sm font-semibold text-[#A0A0A0] hover:text-white no-underline transition">Дэлгүүр</Link>
          <Link href="/shops" className="text-sm font-semibold text-[#A0A0A0] hover:text-white no-underline transition">Дэлгүүрүүд</Link>
          <Link href="/feed" className="text-sm font-bold text-[#E8242C] no-underline">Зарын булан</Link>
        </div>
      </header>

      <div className="max-w-[1320px] mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              📋 Зарын булан
            </h1>
            <p className="text-sm text-[#777] mt-1">Бараа, үйлчилгээ, орон сууц, авто — бүгдийг нэг дор</p>
          </div>
          <Link href="/feed/post" className="flex items-center gap-2 px-5 py-3 bg-[#E8242C] text-white text-sm font-bold rounded-xl no-underline hover:bg-[#CC0000] transition-colors">
            <Plus className="w-4 h-4" /> Зар оруулах
          </Link>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Зар хайх..."
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#1A1A1A] border border-[#3D3D3D] text-white text-sm outline-none focus:border-[#E8242C] placeholder:text-[#555] transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] bg-transparent border-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* District */}
          <select
            value={activeDistrict}
            onChange={(e) => setActiveDistrict(e.target.value)}
            className="h-11 px-4 rounded-xl bg-[#1A1A1A] border border-[#3D3D3D] text-[#E0E0E0] text-sm outline-none cursor-pointer"
          >
            {DISTRICTS.map(d => <option key={d} value={d}>{d === 'Бүгд' ? '📍 Бүх дүүрэг' : d}</option>)}
          </select>
          {/* Sort */}
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value)}
            className="h-11 px-4 rounded-xl bg-[#1A1A1A] border border-[#3D3D3D] text-[#E0E0E0] text-sm outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => {
            const Icon = c.Icon;
            const isActive = activeCat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E8242C] border-[#E8242C] text-white'
                    : 'bg-[#1A1A1A] border-[#3D3D3D] text-[#A0A0A0] hover:border-[#555] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Result bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#777]">
            <span className="font-extrabold text-white">{filtered.length}</span> зар олдлоо
            {vipCount > 0 && <span className="text-[#D4AF37]"> · 👑 {vipCount} ВИП</span>}
          </p>
        </div>

        {/* Feed grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">📋</span>
            <p className="text-lg font-bold text-white">Зар олдсонгүй</p>
            <p className="text-sm text-[#777] mt-2">Шүүлтүүрээ өөрчилнө үү</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#111111] border-t border-[#2A2A2A] py-8 mt-12">
        <div className="max-w-[1320px] mx-auto px-4 text-center">
          <p className="text-xs text-[#555]">© 2026 eseller.mn — Зарын булан</p>
        </div>
      </footer>
      <MobileNav />
    </div>
  );
}
