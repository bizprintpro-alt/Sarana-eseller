'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ProductsAPI, type Product } from '@/lib/api';
import { useCartStore } from '@/lib/cart';
import { formatPrice, DEMO_PRODUCTS, CATEGORIES, cn, discountPercent } from '@/lib/utils';
import { useAuth, roleHome } from '@/lib/auth';
import { DEMO_SERVICES, type Service } from '@/lib/types/service';
import type { ItemType } from '@/lib/marketplace';
import ProductCard from '@/components/store/ProductCard';
import CartDrawer from '@/components/store/CartDrawer';
import MobileNav from '@/components/shared/MobileNav';
import EsellerLogo from '@/components/shared/EsellerLogo';
import Toast, { useToast } from '@/components/shared/Toast';
import MegaMenu from '@/components/store/MegaMenu';
import ModalBody from '@/components/store/ModalBody';
import {
  Search, ShoppingCart, User, ChevronRight, MapPin, Truck,
  Shield, Clock, Tag, Sparkles, ChevronDown, X, Minus, Plus, Share2,
  Scissors, Package,
} from 'lucide-react';

/* ═══════════ Constants ═══════════ */
const NAV_CATEGORIES = [
  { key: 'all', label: 'Ангилал', icon: ChevronDown },
  { key: 'food', label: 'Хоол хүнс' },
  { key: 'fashion', label: 'Хувцас' },
  { key: 'electronics', label: 'Электроник' },
  { key: 'beauty', label: 'Гоо сайхан' },
  { key: 'home', label: 'Гэр ахуй' },
  { key: 'sports', label: 'Спорт' },
  { key: 'salon', label: 'Салон & Гоо сайхан' },
  { key: 'repair', label: 'Засвар' },
];

const TYPE_TABS = [
  { key: 'all' as const, label: 'Бүгд', icon: Sparkles },
  { key: 'product' as const, label: 'Бараа', icon: Package },
  { key: 'service' as const, label: 'Үйлчилгээ', icon: Scissors },
];

const FILTER_CATEGORIES = [
  { key: 'all', label: 'Бүгд', emoji: '🛍' },
  { key: 'food', label: 'Хоол', emoji: '🍔' },
  { key: 'fashion', label: 'Хувцас', emoji: '👗' },
  { key: 'electronics', label: 'Электроник', emoji: '📱' },
  { key: 'beauty', label: 'Гоо сайхан', emoji: '💄' },
  { key: 'home', label: 'Гэр', emoji: '🏡' },
  { key: 'sports', label: 'Спорт', emoji: '⚽' },
  { key: 'other', label: 'Бусад', emoji: '📦' },
];

const FEATURES = [
  { icon: Truck, title: 'Үнэгүй хүргэлт', sub: '50,000₮-с дээш', color: '#059669' },
  { icon: Shield, title: 'Аюулгүй төлбөр', sub: 'QPay & Карт', color: '#0891B2' },
  { icon: Clock, title: 'Хурдан хүргэлт', sub: '2-4 цагийн дотор', color: '#D97706' },
  { icon: Sparkles, title: 'Шинэ ирэлтүүд', sub: 'Долоо хоног бүр', color: '#7C3AED' },
];

const CATEGORY_CARDS = [
  { key: 'fashion', emoji: '👗', label: 'Хувцас', gradient: 'from-rose-500 to-pink-600' },
  { key: 'food', emoji: '🍔', label: 'Хоол', gradient: 'from-orange-500 to-red-500' },
  { key: 'electronics', emoji: '📱', label: 'Электроник', gradient: 'from-blue-500 to-indigo-600' },
  { key: 'beauty', emoji: '💄', label: 'Гоо сайхан', gradient: 'from-fuchsia-500 to-purple-600' },
  { key: 'home', emoji: '🏡', label: 'Гэр ахуй', gradient: 'from-emerald-500 to-teal-600' },
  { key: 'sports', emoji: '⚽', label: 'Спорт', gradient: 'from-sky-500 to-cyan-600' },
];


const WISHLIST_KEY = 'eseller_wishlist';

/* ═══════════ Helpers ═══════════ */
function loadWishlist(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function saveWishlist(ids: Set<string>) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify([...ids]));
}

/* ═══════════════════════════════════════════
   STORE PAGE
   ═══════════════════════════════════════════ */
export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeType, setActiveType] = useState<'all' | ItemType>('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const cart = useCartStore();
  const cartCount = useCartStore((s) => s.count());
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();

  useEffect(() => {
    cart.load();
    setWishlist(loadWishlist());
    (async () => {
      try {
        // Fetch products and services in parallel
        const [prodRes, svcRes] = await Promise.allSettled([
          ProductsAPI.list({ limit: '60' }),
          fetch('/api/services?shopId=all').then((r) => r.json()).catch(() => ({ data: [] })),
        ]);
        const prodList = prodRes.status === 'fulfilled' && prodRes.value.products?.length
          ? prodRes.value.products
          : (DEMO_PRODUCTS as unknown as Product[]);
        setProducts(prodList);

        const svcList = svcRes.status === 'fulfilled' && Array.isArray(svcRes.value?.data)
          ? svcRes.value.data
          : (DEMO_SERVICES as unknown as Service[]);
        setServices(svcList);
      } catch {
        setProducts(DEMO_PRODUCTS as unknown as Product[]);
        setServices(DEMO_SERVICES as unknown as Service[]);
      } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 320);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    let list = activeType === 'service'
      ? services.filter((s) => s.isActive).map((s) => ({ ...s, _id: s._id, name: s.name, price: s.price, salePrice: s.salePrice, description: s.description, category: s.category, emoji: s.emoji, images: s.images, rating: s.rating, reviewCount: s.reviewCount, store: undefined }) as unknown as Product)
      : activeType === 'product'
      ? products
      : [...products, ...services.filter((s) => s.isActive).map((s) => ({ _id: s._id, name: s.name, price: s.price, salePrice: s.salePrice, description: s.description, category: s.category, emoji: s.emoji, images: s.images, rating: s.rating, reviewCount: s.reviewCount, store: undefined }) as unknown as Product)];

    if (activeCat !== 'all') list = list.filter((p) => p.category === activeCat);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.store?.name || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, services, activeCat, debouncedSearch, activeType]);

  const saleProducts = useMemo(
    () => products.filter((p) => p.salePrice && p.salePrice < p.price),
    [products]
  );

  const handleQuickAdd = useCallback((p: Product) => {
    cart.add(p, 1);
    toast.show(`${p.name} сагсанд нэмэгдлээ`, 'ok');
  }, [cart, toast]);

  const toggleWish = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.show('Хүслийн жагсаалтаас хасагдлаа', 'warn'); }
      else { next.add(id); toast.show('Хүслийн жагсаалтад нэмэгдлээ', 'ok'); }
      saveWishlist(next);
      return next;
    });
  }, [toast]);

  const openModal = useCallback((id: string) => {
    setSelectedProduct(products.find((x) => x._id === id) || null);
    setModalQty(1);
  }, [products]);

  const addFromModal = useCallback(() => {
    if (!selectedProduct) return;
    cart.add(selectedProduct, modalQty);
    toast.show(`${selectedProduct.name} x${modalQty} сагсанд нэмэгдлээ`, 'ok');
    setSelectedProduct(null);
  }, [selectedProduct, modalQty, cart, toast]);

  const handleShare = useCallback(() => {
    if (!selectedProduct) return;
    const url = `${window.location.origin}/store/${selectedProduct._id}?ref=${user?.username || user?._id || ''}`;
    navigator.clipboard.writeText(url).then(() => toast.show('Линк хуулагдлаа!', 'ok'));
  }, [selectedProduct, user, toast]);

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Toast />

      {/* ════════════════════════════════════════
          TOP BAR — announcement + auth
          ════════════════════════════════════════ */}
      <div className="bg-[#1A1A2E] text-white/80 text-xs">
        <div className="max-w-[1320px] mx-auto px-4 h-9 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-3 h-3 text-white/40" />
            <span>Улаанбаатар хот</span>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-[#FCD34D]">🚚 50,000₮+ үнэгүй хүргэлт</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {isLoggedIn ? (
              <Link href={roleHome(user?.role)} className="text-white/80 hover:text-white no-underline transition font-medium">
                {user?.name || 'Профайл'}
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-white/80 hover:text-white no-underline transition">Нэвтрэх</Link>
                <span className="text-white/20">|</span>
                <Link href="/login#register" className="text-[#FCD34D] hover:text-yellow-300 no-underline transition font-medium">Бүртгүүлэх</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          MAIN HEADER — logo, search, icons
          ════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white shadow-[0_2px_12px_rgba(0,0,0,.06)]">
        <div className="max-w-[1320px] mx-auto px-4 h-[64px] flex items-center gap-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <EsellerLogo size={32} />
            <span className="text-xl font-black text-[#1A1A2E] tracking-tight hidden sm:block">
              eseller<span className="text-[#E31E24]">.mn</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl">
            <div className="relative flex">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Бараа, дэлгүүр хайх..."
                className="w-full h-11 pl-4 pr-12 rounded-xl bg-[#F5F5F5] border-2 border-transparent text-sm outline-none focus:border-[#E31E24] focus:bg-white transition-all placeholder:text-[#94A3B8]"
              />
              <button className="absolute right-1 top-1 bottom-1 px-3 bg-[#E31E24] text-white rounded-lg border-none cursor-pointer hover:bg-[#C41A1F] transition flex items-center justify-center">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <Link
                href={roleHome(user?.role)}
                className="hidden md:flex w-10 h-10 rounded-xl hover:bg-[#F5F5F5] items-center justify-center text-[#475569] hover:text-[#E31E24] no-underline transition"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-10 h-10 rounded-xl hover:bg-[#F5F5F5] border-none cursor-pointer bg-transparent flex items-center justify-center text-[#475569] hover:text-[#E31E24] transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#E31E24] text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Red Category Nav */}
        <div className="bg-[#E31E24] relative">
          <div className="max-w-[1320px] mx-auto px-4">
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-none h-10">
              {/* Mega Menu trigger */}
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={cn(
                  'shrink-0 h-full px-4 text-sm font-semibold border-none cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5',
                  megaMenuOpen ? 'bg-white/25 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                )}
              >
                Ангилал
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', megaMenuOpen && 'rotate-180')} />
              </button>

              {NAV_CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                <button
                  key={c.key}
                  onClick={() => { setActiveCat(c.key); setMegaMenuOpen(false); }}
                  className={cn(
                    'shrink-0 h-full px-4 text-sm font-semibold border-none cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5',
                    activeCat === c.key
                      ? 'bg-white/20 text-white'
                      : 'bg-transparent text-white/85 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {c.label}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={() => { setActiveCat('all'); setMegaMenuOpen(false); }}
                className="shrink-0 h-full px-4 text-sm font-bold border-none cursor-pointer bg-transparent text-[#FCD34D] hover:text-yellow-200 transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <Tag className="w-3.5 h-3.5" />
                Хямдралтай
              </button>
            </div>
          </div>

          {/* Mega Menu */}
          <MegaMenu
            open={megaMenuOpen}
            onClose={() => setMegaMenuOpen(false)}
            onSelectCategory={(cat) => { setActiveCat(cat); }}
            onSelectType={(type) => { setActiveType(type); }}
          />
        </div>
      </header>

      {/* ════════════════════════════════════════
          HERO BANNER
          ════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-[#E31E24] via-[#C41A1F] to-[#8B0000] text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-100px] right-[-80px] w-[400px] h-[400px] rounded-full bg-white/[.06]" />
        <div className="absolute bottom-[-60px] left-[-40px] w-[250px] h-[250px] rounded-full bg-white/[.04]" />
        <div className="absolute top-[40%] left-[60%] w-[150px] h-[150px] rounded-full bg-white/[.03]" />

        <div className="max-w-[1320px] mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-semibold mb-5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FCD34D] animate-pulse" />
              Шинэ хямдрал эхэллээ
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-4"
            >
              Монголын хамгийн том<br />
              онлайн дэлгүүр
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/80 text-base md:text-lg mb-8 max-w-md leading-relaxed"
            >
              5,000+ бараа, 500+ дэлгүүр, хурдан хүргэлт, баталгаатай чанар
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <button
                onClick={() => searchRef.current?.focus()}
                className="bg-white text-[#E31E24] font-bold px-7 py-3 rounded-xl border-none cursor-pointer text-sm hover:shadow-[0_8px_24px_rgba(0,0,0,.15)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Бараа хайх
              </button>
              <button
                onClick={() => setActiveCat('all')}
                className="bg-white/15 backdrop-blur-sm text-white font-semibold px-7 py-3 rounded-xl border border-white/20 cursor-pointer text-sm hover:bg-white/25 transition-all"
              >
                Бүгд харах
                <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURE BAR — light yellow
          ════════════════════════════════════════ */}
      <section className="bg-[#FFFBEB] border-b border-[#FDE68A]/50">
        <div className="max-w-[1320px] mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: f.color + '12', color: f.color }}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1A1A2E]">{f.title}</div>
                  <div className="text-xs text-[#92400E]/60">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PROMO BANNER
          ════════════════════════════════════════ */}
      <div className="bg-[#1A1A2E]">
        <div className="max-w-[1320px] mx-auto px-4 py-2.5 flex items-center justify-center gap-6 flex-wrap text-xs text-white/70">
          <span className="flex items-center gap-1.5"><span className="text-[#FCD34D]">🔥</span> 50% хямдрал электроник бараанд</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:flex items-center gap-1.5"><span className="text-[#FCD34D]">🎁</span> Шинэ хэрэглэгчдэд 10,000₮ купон</span>
          <span className="hidden md:inline text-white/20">|</span>
          <span className="hidden md:flex items-center gap-1.5"><span className="text-[#FCD34D]">🚚</span> 50,000₮+ үнэгүй хүргэлт</span>
          <span className="hidden lg:inline text-white/20">|</span>
          <span className="hidden lg:flex items-center gap-1.5"><span className="text-[#FCD34D]">⭐</span> 5,000+ баталгаат бараа</span>
        </div>
      </div>

      {/* ════════════════════════════════════════
          SALE PRODUCTS — horizontal scroll
          ════════════════════════════════════════ */}
      {saleProducts.length > 0 && (
        <section className="bg-white">
          <div className="max-w-[1320px] mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-[#E31E24]" />
                <h2 className="text-xl font-black text-[#1A1A2E]">Хямдралтай бараа</h2>
                <span className="bg-[#E31E24] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Sale</span>
              </div>
              <button
                onClick={() => setActiveCat('all')}
                className="text-sm font-semibold text-[#E31E24] bg-transparent border-none cursor-pointer hover:underline flex items-center gap-1"
              >
                Бүгд <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4">
              {saleProducts.map((p) => (
                <div key={p._id} className="shrink-0 w-56">
                  <ProductCard
                    product={p}
                    onQuickAdd={handleQuickAdd}
                    onClick={openModal}
                    isWished={wishlist.has(p._id)}
                    onToggleWish={toggleWish}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          CATEGORY CARDS
          ════════════════════════════════════════ */}
      <section className="max-w-[1320px] mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full bg-[#E31E24]" />
          <h2 className="text-xl font-black text-[#1A1A2E]">Ангилалууд</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORY_CARDS.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCat(c.key)}
              className={cn(
                'relative bg-gradient-to-br text-white rounded-2xl p-5 border-none cursor-pointer text-left transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden group',
                c.gradient,
                activeCat === c.key && 'ring-2 ring-offset-2 ring-[#E31E24]'
              )}
            >
              <div className="absolute top-[-10px] right-[-10px] w-16 h-16 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
              <div className="text-3xl mb-2 relative">{c.emoji}</div>
              <div className="text-sm font-bold relative">{c.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          ALL PRODUCTS GRID
          ════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-[1320px] mx-auto px-4 py-8">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-[#E31E24]" />
              <h2 className="text-xl font-black text-[#1A1A2E]">
                {activeType === 'service' ? 'Үйлчилгээ' : activeType === 'product' ? 'Бараа бүтээгдэхүүн' : activeCat === 'all' ? 'Бүх бараа & үйлчилгээ' : FILTER_CATEGORIES.find((c) => c.key === activeCat)?.label || ''}
              </h2>
            </div>
            <span className="text-sm text-[#94A3B8] font-medium bg-[#F5F5F5] px-3 py-1 rounded-lg">
              {filtered.length} {activeType === 'service' ? 'үйлчилгээ' : 'бараа'}
            </span>
          </div>

          {/* Type tabs — Бүгд / Бараа / Үйлчилгээ */}
          <div className="flex items-center gap-2 mb-4">
            {TYPE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveType(t.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all',
                  activeType === t.key
                    ? 'bg-[#1A1A2E] text-white shadow-sm'
                    : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F5F5F5]'
                )}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
            {FILTER_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-xs font-semibold border cursor-pointer transition-all whitespace-nowrap',
                  activeCat === c.key
                    ? 'bg-[#E31E24] text-white border-[#E31E24] shadow-[0_2px_8px_rgba(227,30,36,.25)]'
                    : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#E31E24] hover:text-[#E31E24]'
                )}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                  <div className="h-48 bg-[#F5F5F5] animate-pulse" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-3 bg-[#F5F5F5] rounded-full w-1/3 animate-pulse" />
                    <div className="h-4 bg-[#F5F5F5] rounded-full w-4/5 animate-pulse" />
                    <div className="h-5 bg-[#F5F5F5] rounded-full w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#CBD5E1]" />
              </div>
              <h3 className="text-base font-bold text-[#475569] mb-1">Бараа олдсонгүй</h3>
              <p className="text-sm text-[#94A3B8] mb-4">Өөр хайлтаар дахин оролдоно уу</p>
              <button
                onClick={() => { setSearch(''); setActiveCat('all'); }}
                className="text-sm font-bold text-[#E31E24] bg-[#FEF2F2] px-5 py-2.5 rounded-xl border-none cursor-pointer hover:bg-[#FEE2E2] transition"
              >
                Шүүлтүүр цэвэрлэх
              </button>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }}
            >
              {filtered.map((p) => (
                <motion.div
                  key={p._id}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                >
                  <ProductCard
                    product={p}
                    onQuickAdd={handleQuickAdd}
                    onClick={openModal}
                    isWished={wishlist.has(p._id)}
                    onToggleWish={toggleWish}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRODUCT MODAL
          ════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl z-[999] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            >
              {/* Image */}
              <div className="h-64 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center relative shrink-0">
                {selectedProduct.images?.[0] ? (
                  <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-8xl">{selectedProduct.emoji || '📦'}</span>
                )}
                {selectedProduct.salePrice && selectedProduct.salePrice < selectedProduct.price && (
                  <span className="absolute top-4 left-4 bg-[#E31E24] text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                    -{discountPercent(selectedProduct.price, selectedProduct.salePrice)}%
                  </span>
                )}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm border-none cursor-pointer flex items-center justify-center hover:bg-white transition shadow-sm"
                >
                  <X className="w-4 h-4 text-[#475569]" />
                </button>
              </div>

              {/* Body */}
              <ModalBody
                product={selectedProduct}
                qty={modalQty}
                setQty={setModalQty}
                onAddToCart={(modifiers, addOns) => {
                  cart.add(selectedProduct, modalQty, modifiers, addOns);
                  toast.show(`${selectedProduct.name} сагсанд нэмэгдлээ`, 'ok');
                  setSelectedProduct(null);
                }}
                isAffiliate={isLoggedIn && user?.role === 'affiliate'}
                onShare={handleShare}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════ */}
      <footer className="bg-[#1A1A2E] text-white pt-12 pb-24 md:pb-12">
        <div className="max-w-[1320px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <EsellerLogo size={28} />
                <span className="text-lg font-black tracking-tight">
                  eseller<span className="text-[#E31E24]">.mn</span>
                </span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Монголын хамгийн том онлайн худалдааны платформ. Баталгаатай бараа, хурдан хүргэлт.
              </p>
            </div>
            {[
              { title: 'Дэлгүүр', items: ['Бүх бараа', 'Хямдрал', 'Шинэ ирэлт', 'Шилдэг бараа'] },
              { title: 'Тусламж', items: ['Хүргэлтийн мэдээлэл', 'Буцаалтын бодлого', 'Нууцлалын бодлого', 'Холбоо барих'] },
              { title: 'Бидний тухай', items: ['Компанийн тухай', 'Борлуулагч болох', 'Affiliate програм', 'Хүргэгч болох'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-white/70 mb-3 uppercase tracking-wider">{col.title}</h4>
                <ul className="list-none space-y-2">
                  {col.items.map((t) => (
                    <li key={t}><span className="text-xs text-white/35 hover:text-white cursor-pointer transition">{t}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-xs text-white/25">&copy; 2026 eseller.mn — Бүх эрх хуулиар хамгаалагдсан</span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/25">Төлбөр:</span>
              <span className="text-xs font-bold text-white/40">QPay</span>
              <span className="text-xs font-bold text-white/40">Visa</span>
              <span className="text-xs font-bold text-white/40">Mastercard</span>
            </div>
          </div>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}
