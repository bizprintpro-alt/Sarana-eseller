'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import EsellerLogo from '@/components/shared/EsellerLogo';
import MobileNav from '@/components/shared/MobileNav';
import {
  Search, MapPin, Star, Clock, ChevronRight, Package, Scissors,
  ShoppingBag, Filter, ArrowRight, Verified,
} from 'lucide-react';

/* ═══ Types ═══ */
type ShopType = 'all' | 'product' | 'service';
type ShopCategory = string;

interface ShopCard {
  id: string;
  name: string;
  slug: string;
  type: 'product' | 'service';
  logo?: string;
  emoji: string;
  description: string;
  category: string;
  categoryLabel: string;
  address?: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  isVerified: boolean;
  isOpen?: boolean;
}

/* ═══ Demo Data ═══ */
const DEMO_SHOPS: ShopCard[] = [
  { id: '1', name: 'FashionMN', slug: 'fashionmn', type: 'product', emoji: '👗', description: 'Загварлаг хувцас, гутал, гоёл чимэглэл. Бүх насныханд.', category: 'fashion', categoryLabel: 'Хувцас', rating: 4.8, reviewCount: 324, productCount: 156, isVerified: true },
  { id: '2', name: 'TechUB', slug: 'techub', type: 'product', emoji: '📱', description: 'Гар утас, зүүлт, чихэвч, техник хэрэгсэл. Жинхэнэ бараа.', category: 'electronics', categoryLabel: 'Электроник', rating: 4.6, reviewCount: 189, productCount: 230, isVerified: true },
  { id: '3', name: 'Sarana Beauty Salon', slug: 'demo-salon', type: 'service', emoji: '💇', description: 'Мэргэжлийн үсчин, гоо сайхан, маникюр. 10+ жилийн туршлага.', category: 'salon', categoryLabel: 'Салон', rating: 4.9, reviewCount: 412, productCount: 8, isVerified: true, isOpen: true },
  { id: '4', name: 'BurgerMN', slug: 'burgermn', type: 'product', emoji: '🍔', description: 'Шинэхэн бургер, пицца, хоол. Хурдан хүргэлттэй.', category: 'food', categoryLabel: 'Хоол хүнс', rating: 4.7, reviewCount: 567, productCount: 42, isVerified: false },
  { id: '5', name: 'BeautyMN', slug: 'beautymn', type: 'product', emoji: '💄', description: 'K-beauty, органик гоо сайхан, арьс арчилгааны бүтээгдэхүүн.', category: 'beauty', categoryLabel: 'Гоо сайхан', rating: 4.5, reviewCount: 201, productCount: 89, isVerified: true },
  { id: '6', name: 'SportsMN', slug: 'sportsmn', type: 'product', emoji: '⚽', description: 'Спорт хувцас, хэрэгсэл, фитнесс тоног төхөөрөмж.', category: 'sports', categoryLabel: 'Спорт', rating: 4.4, reviewCount: 98, productCount: 67, isVerified: false },
  { id: '7', name: 'Nail Art Studio', slug: 'nailart', type: 'service', emoji: '💅', description: 'Хумс засалт, маникюр, педикюр. Урлагийн түвшинд.', category: 'beauty_service', categoryLabel: 'Гоо сайхан', rating: 4.8, reviewCount: 156, productCount: 12, isVerified: true, isOpen: true },
  { id: '8', name: 'Fix Master', slug: 'fixmaster', type: 'service', emoji: '🔧', description: 'Гар утас, компьютер засвар. Баталгаатай, хурдан.', category: 'repair', categoryLabel: 'Засвар', rating: 4.3, reviewCount: 87, productCount: 6, isVerified: false, isOpen: false },
  { id: '9', name: 'LuxuryMN', slug: 'luxurymn', type: 'product', emoji: '👜', description: 'Жинхэнэ арьсан цүнх, бүс, түрийвч. Премиум бараа.', category: 'fashion', categoryLabel: 'Хувцас', rating: 4.9, reviewCount: 78, productCount: 34, isVerified: true },
  { id: '10', name: 'Green Spa', slug: 'greenspa', type: 'service', emoji: '🧖', description: 'Массаж, спа, арьс арчилгаа. Тайвширлын оргил.', category: 'spa', categoryLabel: 'Спа', rating: 4.7, reviewCount: 234, productCount: 15, isVerified: true, isOpen: true },
  { id: '11', name: 'Print House', slug: 'printhouse', type: 'service', emoji: '🖨️', description: 'Хэвлэл, визит карт, poster, баннер. 24 цагийн дотор.', category: 'printing', categoryLabel: 'Хэвлэл', rating: 4.2, reviewCount: 45, productCount: 8, isVerified: false },
  { id: '12', name: 'GreenMN', slug: 'greenmn', type: 'product', emoji: '🌿', description: 'Гэрийн ургамал, тэжээл, сав суулга. Байгальд ээлтэй.', category: 'home', categoryLabel: 'Гэр ахуй', rating: 4.6, reviewCount: 112, productCount: 45, isVerified: false },
];

const CATEGORY_FILTERS = [
  { key: 'all', label: 'Бүгд' },
  { key: 'fashion', label: 'Хувцас' },
  { key: 'electronics', label: 'Электроник' },
  { key: 'food', label: 'Хоол хүнс' },
  { key: 'beauty', label: 'Гоо сайхан' },
  { key: 'salon', label: 'Салон' },
  { key: 'repair', label: 'Засвар' },
  { key: 'sports', label: 'Спорт' },
  { key: 'home', label: 'Гэр ахуй' },
];

const TYPE_TABS = [
  { key: 'all' as ShopType, label: 'Бүгд', icon: ShoppingBag },
  { key: 'product' as ShopType, label: 'Дэлгүүр', icon: Package },
  { key: 'service' as ShopType, label: 'Үйлчилгээ', icon: Scissors },
];

/* ═══ Page ═══ */
export default function ShopsPage() {
  const [shops, setShops] = useState(DEMO_SHOPS);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<ShopType>('all');
  const [activeCat, setActiveCat] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'newest'>('rating');

  // Fetch real shops from DB, fallback to demo
  useEffect(() => {
    fetch('/api/shops').then(r => r.json()).then(data => {
      if (data.shops?.length > 0) setShops(data.shops);
    }).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = shops;
    if (activeType !== 'all') list = list.filter((s) => s.type === activeType);
    if (activeCat !== 'all') list = list.filter((s) => s.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.categoryLabel.toLowerCase().includes(q));
    }
    if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'reviews') list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    return list;
  }, [activeType, activeCat, search, sortBy]);

  const totalProduct = shops.filter((s) => s.type === 'product').length;
  const totalService = shops.filter((s) => s.type === 'service').length;

  return (
    <div className="min-h-screen bg-[var(--esl-bg-section)]">
      {/* ═══ Header ═══ */}
      <header className="sticky top-0 z-50 bg-[var(--esl-bg-card)] shadow-sm">
        <div className="max-w-[1320px] mx-auto px-4 h-16 flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
            <EsellerLogo size={30} />
            <span className="text-xl font-black text-[var(--esl-text-primary)] tracking-tight hidden sm:block">
              eseller<span className="text-[#E31E24]">.mn</span>
            </span>
          </Link>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--esl-text-muted)]" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Дэлгүүр, үйлчилгээ хайх..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--esl-bg-section)] border-2 border-transparent rounded-xl text-sm outline-none focus:border-[#E31E24] focus:bg-[var(--esl-bg-card)] transition-all"
            />
          </div>

          <Link href="/store" className="text-sm font-semibold text-[var(--esl-text-secondary)] hover:text-[#E31E24] no-underline transition hidden sm:inline">
            Marketplace →
          </Link>
        </div>
      </header>

      {/* ═══ Hero ═══ */}
      <section className="bg-gradient-to-br from-[#1A1A2E] to-[#2D2B55] text-white py-12 md:py-16">
        <div className="max-w-[1320px] mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Бүх дэлгүүр & үйлчилгээ
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-base text-white/60 max-w-lg mx-auto mb-6">
            {DEMO_SHOPS.length} дэлгүүр, үйлчилгээний байгууллага нэг дор
          </motion.p>

          {/* Type tabs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2">
            {TYPE_TABS.map((t) => (
              <button key={t.key} onClick={() => setActiveType(t.key)}
                className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all',
                  activeType === t.key ? 'bg-white text-[var(--esl-text-primary)]' : 'bg-white/10 text-white/70 hover:bg-white/20')}>
                <t.icon className="w-4 h-4" />
                {t.label}
                <span className="text-xs opacity-60">
                  {t.key === 'all' ? DEMO_SHOPS.length : t.key === 'product' ? totalProduct : totalService}
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Filters + Grid ═══ */}
      <div className="max-w-[1320px] mx-auto px-4 py-8">
        {/* Category filter + sort */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {CATEGORY_FILTERS.map((c) => (
              <button key={c.key} onClick={() => setActiveCat(c.key)}
                className={cn('shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all whitespace-nowrap',
                  activeCat === c.key ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'bg-[var(--esl-bg-card)] text-[var(--esl-text-secondary)] border-[var(--esl-border)] hover:border-[var(--esl-border-strong)]')}>
                {c.label}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-[var(--esl-border)] rounded-lg text-xs font-semibold text-[var(--esl-text-secondary)] bg-[var(--esl-bg-card)] cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-[#E31E24]">
            <option value="rating">Үнэлгээгээр</option>
            <option value="reviews">Сэтгэгдлээр</option>
            <option value="newest">Шинээр</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-[var(--esl-text-secondary)] mb-4">{filtered.length} дэлгүүр олдлоо</div>

        {/* Shop grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3 opacity-30">🏪</div>
            <p className="text-sm font-semibold text-[var(--esl-text-muted)]">Дэлгүүр олдсонгүй</p>
            <button onClick={() => { setSearch(''); setActiveCat('all'); setActiveType('all'); }}
              className="mt-3 text-sm text-[#E31E24] font-semibold bg-transparent border-none cursor-pointer hover:underline">
              Шүүлтүүр цэвэрлэх
            </button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          >
            {filtered.map((shop) => (
              <motion.div key={shop.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
                <Link
                  href={shop.type === 'service' ? `/s/${shop.slug}` : `/u/${shop.slug}`}
                  className="block bg-[var(--esl-bg-card)] rounded-2xl border border-[var(--esl-border)] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all no-underline group"
                >
                  {/* Card header — gradient bg */}
                  <div className={cn('h-28 relative flex items-center justify-center',
                    shop.type === 'service'
                      ? 'bg-gradient-to-br from-[var(--esl-bg-section)] to-[var(--esl-bg-card-hover)]'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100'
                  )}>
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{shop.emoji}</span>

                    {/* Type badge */}
                    <span className={cn('absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full',
                      shop.type === 'service' ? 'bg-[rgba(232,36,44,0.1)] text-[#E8242C]' : 'bg-[var(--esl-bg-section)] text-[var(--esl-text-secondary)]')}>
                      {shop.type === 'service' ? '🛎️ Үйлчилгээ' : '📦 Дэлгүүр'}
                    </span>

                    {/* Open badge for services */}
                    {shop.type === 'service' && shop.isOpen !== undefined && (
                      <span className={cn('absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1',
                        shop.isOpen ? 'bg-green-100 text-green-700' : 'bg-[var(--esl-bg-section)] text-[var(--esl-text-secondary)]')}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', shop.isOpen ? 'bg-green-500' : 'bg-gray-400')} />
                        {shop.isOpen ? 'Нээлттэй' : 'Хаалттай'}
                      </span>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-[var(--esl-text-primary)] group-hover:text-[#E31E24] transition-colors">{shop.name}</h3>
                        {shop.isVerified && (
                          <Verified className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[var(--esl-text-secondary)] line-clamp-2 leading-relaxed mb-3">{shop.description}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-[var(--esl-text-muted)] mb-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-[var(--esl-text-primary)]">{shop.rating}</span>
                        <span>({shop.reviewCount})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        {shop.type === 'service' ? <Scissors className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                        {shop.productCount} {shop.type === 'service' ? 'үйлчилгээ' : 'бараа'}
                      </span>
                    </div>

                    {/* Category + CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[var(--esl-text-secondary)] bg-[var(--esl-bg-section)] px-2.5 py-1 rounded-full">
                        {shop.categoryLabel}
                      </span>
                      <span className="text-xs font-bold text-[#E31E24] flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        Зочлох <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ═══ Footer ═══ */}
      <footer className="bg-[#1A1A2E] text-white/40 py-8 text-center mt-8">
        <p className="text-xs">&copy; 2026 eseller.mn — Бүх эрх хуулиар хамгаалагдсан</p>
      </footer>

      <MobileNav />
    </div>
  );
}
