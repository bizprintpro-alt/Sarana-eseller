'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ProductsAPI, type Product } from '@/lib/api';
import { useCartStore } from '@/lib/cart';
import { formatPrice, DEMO_PRODUCTS, CATEGORIES, cn, discountPercent } from '@/lib/utils';
import { useAuth, roleHome } from '@/lib/auth';
import ProductCard from '@/components/store/ProductCard';
import CartDrawer from '@/components/store/CartDrawer';
import MobileNav from '@/components/shared/MobileNav';
import EsellerLogo from '@/components/shared/EsellerLogo';
import Toast, { useToast } from '@/components/shared/Toast';

/* ═══════════ Constants ═══════════ */
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

const PROMO_ITEMS = [
  { icon: '🏷', title: 'Хямдралтай бараа', sub: 'Өдөр бүр шинэ' },
  { icon: '🚀', title: 'Хурдан хүргэлт', sub: '24 цагийн дотор' },
  { icon: '✨', title: 'Шинэ ирэлтүүд', sub: 'Долоо хоног бүр' },
  { icon: '🔒', title: 'Аюулгүй төлбөр', sub: 'QPay & Картаар' },
];

const CATEGORY_CARDS = [
  { key: 'fashion', emoji: '👗', label: 'Хувцас', color: 'from-pink-500 to-rose-600' },
  { key: 'food', emoji: '🍔', label: 'Хоол', color: 'from-orange-500 to-amber-600' },
  { key: 'electronics', emoji: '📱', label: 'Электроник', color: 'from-blue-500 to-indigo-600' },
  { key: 'beauty', emoji: '💄', label: 'Гоо сайхан', color: 'from-purple-500 to-fuchsia-600' },
  { key: 'home', emoji: '🏡', label: 'Гэр ахуй', color: 'from-emerald-500 to-teal-600' },
  { key: 'sports', emoji: '⚽', label: 'Спорт', color: 'from-cyan-500 to-sky-600' },
];

const MARQUEE_TEXT =
  '🔥 FLASH SALE: 50% хямдрал бүх электроник бараанд! | 🎁 Шинэ хэрэглэгчдэд 10,000₮ купон | 🚚 50,000₮-с дээш захиалгад ҮНЭГҮЙ хүргэлт | ⭐ 5,000+ баталгаат бараа | ';

const WISHLIST_KEY = 'eseller_wishlist';

/* ═══════════ Wishlist helpers ═══════════ */
function loadWishlist(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveWishlist(ids: Set<string>) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify([...ids]));
}

/* ═══════════ Main Page ═══════════ */
export default function StorePage() {
  /* ── State ── */
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState(1);

  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Stores & Auth ── */
  const cart = useCartStore();
  const cartCount = useCartStore((s) => s.count());
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();

  /* ── Load products ── */
  useEffect(() => {
    cart.load();
    setWishlist(loadWishlist());

    (async () => {
      try {
        const res = await ProductsAPI.list({ limit: '60' });
        const list = res.products?.length ? res.products : (DEMO_PRODUCTS as unknown as Product[]);
        setProducts(list);
      } catch {
        setProducts(DEMO_PRODUCTS as unknown as Product[]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Debounced search ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 320);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Filtered products ── */
  const filtered = useMemo(() => {
    let list = products;
    if (activeCat !== 'all') {
      list = list.filter((p) => p.category === activeCat);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.store?.name || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, activeCat, debouncedSearch]);

  /* ── Sale products ── */
  const saleProducts = useMemo(
    () => products.filter((p) => p.salePrice && p.salePrice < p.price),
    [products]
  );

  /* ── Handlers ── */
  const handleQuickAdd = useCallback(
    (p: Product) => {
      cart.add(p, 1);
      toast.show(`${p.name} сагсанд нэмэгдлээ`, 'ok');
    },
    [cart, toast]
  );

  const toggleWish = useCallback(
    (id: string) => {
      setWishlist((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          toast.show('Хүслийн жагсаалтаас хасагдлаа', 'warn');
        } else {
          next.add(id);
          toast.show('Хүслийн жагсаалтад нэмэгдлээ', 'ok');
        }
        saveWishlist(next);
        return next;
      });
    },
    [toast]
  );

  const openModal = useCallback((id: string) => {
    const p = products.find((x) => x._id === id) || null;
    setSelectedProduct(p);
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
    navigator.clipboard.writeText(url).then(() => {
      toast.show('Линк хуулагдлаа!', 'ok');
    });
  }, [selectedProduct, user, toast]);

  /* ═══════════ Render ═══════════ */
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Toast />

      {/* ── Top Strip ── */}
      <div className="bg-[#0F172A] text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
            <span className="whitespace-nowrap">📍 Улаанбаатар</span>
            <span className="hidden sm:inline whitespace-nowrap text-[#94A3B8]">|</span>
            <span className="hidden sm:inline whitespace-nowrap">🚚 50,000₮+ ҮНЭГҮЙ хүргэлт</span>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link href={roleHome(user?.role)} className="text-white/80 hover:text-white no-underline transition">
                  {user?.name || 'Профайл'}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white/80 hover:text-white no-underline transition">
                  Нэвтрэх
                </Link>
                <span className="text-[#475569]">|</span>
                <Link href="/register" className="text-white/80 hover:text-white no-underline transition">
                  Бүртгүүлэх
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Nav ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
            <EsellerLogo size={30} />
            <span className="text-lg font-black text-[#0F172A] tracking-tight hidden sm:block">
              eseller<span className="text-brand">.mn</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm pointer-events-none">
              🔍
            </span>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Бараа хайх..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
            />
          </div>

          {/* User */}
          {isLoggedIn && (
            <Link
              href={roleHome(user?.role)}
              className="hidden md:flex items-center gap-1.5 text-sm text-[#475569] hover:text-brand no-underline transition"
            >
              <span className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-xs font-bold">
                👤
              </span>
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-10 h-10 rounded-xl bg-[#F1F5F9] border-none cursor-pointer hover:bg-[#E2E8F0] transition flex items-center justify-center text-lg"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Category Bar ── */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none">
            {FILTER_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-xs font-bold border-none cursor-pointer transition-all whitespace-nowrap',
                  activeCat === c.key
                    ? 'bg-brand text-white shadow-[0_2px_8px_rgba(204,0,0,.25)]'
                    : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                )}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <section className="bg-gradient-to-r from-[#CC0000] via-[#A30000] to-[#7F0000] text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-[10%] text-6xl">🛒</div>
          <div className="absolute top-12 right-[15%] text-4xl">📦</div>
          <div className="absolute bottom-8 left-[30%] text-5xl">🎁</div>
          <div className="absolute bottom-4 right-[25%] text-3xl">⭐</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-black mb-4 leading-tight"
          >
            Монголын хамгийн том
            <br />
            онлайн дэлгүүр
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-white/80 text-base md:text-lg mb-6 max-w-lg mx-auto"
          >
            5,000+ бараа, 500+ дэлгүүр, хурдан хүргэлт
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => searchRef.current?.focus()}
            className="bg-white text-brand font-bold px-8 py-3 rounded-xl border-none cursor-pointer text-sm hover:shadow-lg hover:scale-105 transition-all"
          >
            🔍 Бараа хайх
          </motion.button>
        </div>
      </section>

      {/* ── Promo Strip ── */}
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PROMO_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">{item.title}</div>
                  <div className="text-[10px] text-[#94A3B8]">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scrolling Announcement ── */}
      <div className="bg-[#FFFBEB] border-b border-[#FDE68A] py-2 overflow-hidden">
        <div className="whitespace-nowrap" style={{ animation: 'scrollMarquee 25s linear infinite' }}>
          <span className="inline-block text-xs font-semibold text-[#92400E]">
            {MARQUEE_TEXT}{MARQUEE_TEXT}
          </span>
        </div>
      </div>

      {/* ── Sale Section ── */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-[#0F172A]">🔥 Хямдралтай бараа</h2>
            <button
              onClick={() => setActiveCat('all')}
              className="text-xs font-bold text-brand bg-transparent border-none cursor-pointer hover:underline"
            >
              Бүгдийг харах &rarr;
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {saleProducts.map((p) => (
              <div key={p._id} className="shrink-0 w-52">
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
        </section>
      )}

      {/* ── Category Cards ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-black text-[#0F172A] mb-5">📂 Ангилалууд</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORY_CARDS.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCat(c.key)}
              className={cn(
                'bg-gradient-to-br text-white rounded-2xl p-5 border-none cursor-pointer text-left transition-all hover:scale-105 hover:shadow-lg',
                c.color
              )}
            >
              <div className="text-3xl mb-2">{c.emoji}</div>
              <div className="text-sm font-bold">{c.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── All Products Grid ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-[#0F172A]">
            {activeCat === 'all'
              ? '🛍 Бүх бараа'
              : `${FILTER_CATEGORIES.find((c) => c.key === activeCat)?.emoji || ''} ${FILTER_CATEGORIES.find((c) => c.key === activeCat)?.label || ''}`}
          </h2>
          <span className="text-xs text-[#94A3B8] font-semibold">
            {filtered.length} бараа
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse"
              >
                <div className="h-44 bg-[#F1F5F9]" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#F1F5F9] rounded w-2/3" />
                  <div className="h-4 bg-[#F1F5F9] rounded w-1/2" />
                  <div className="h-8 bg-[#F1F5F9] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3 opacity-40 animate-float">🔍</div>
            <p className="text-sm font-bold text-[#94A3B8]">Бараа олдсонгүй</p>
            <button
              onClick={() => {
                setSearch('');
                setActiveCat('all');
              }}
              className="mt-3 text-xs font-bold text-brand bg-transparent border-none cursor-pointer hover:underline"
            >
              Шүүлтүүр цэвэрлэх
            </button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.04 } },
            }}
          >
            {filtered.map((p) => (
              <motion.div
                key={p._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
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
      </section>

      {/* ── Product Modal ── */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-[998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl z-[999] overflow-hidden flex flex-col max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Modal Header Image */}
              <div className="h-56 bg-[#F1F5F9] flex items-center justify-center relative shrink-0">
                {selectedProduct.images?.[0] ? (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-7xl">{selectedProduct.emoji || '📦'}</span>
                )}
                {selectedProduct.salePrice && selectedProduct.salePrice < selectedProduct.price && (
                  <span className="absolute top-4 left-4 bg-brand text-white text-xs font-bold px-3 py-1 rounded-lg">
                    -{discountPercent(selectedProduct.price, selectedProduct.salePrice)}%
                  </span>
                )}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border-none cursor-pointer text-lg flex items-center justify-center hover:bg-white transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedProduct.store?.name && (
                  <div className="text-xs text-[#94A3B8] mb-1">🏪 {selectedProduct.store.name}</div>
                )}
                <h3 className="text-xl font-black text-[#0F172A] mb-2">{selectedProduct.name}</h3>
                {selectedProduct.rating && (
                  <div className="text-sm mb-3">
                    {'⭐'.repeat(Math.min(5, Math.round(selectedProduct.rating)))}{' '}
                    <span className="text-[#94A3B8] text-xs">
                      {selectedProduct.rating} ({selectedProduct.reviewCount || 0} үнэлгээ)
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl font-black text-brand">
                    {formatPrice(selectedProduct.salePrice || selectedProduct.price)}
                  </span>
                  {selectedProduct.salePrice && selectedProduct.salePrice < selectedProduct.price && (
                    <span className="text-sm text-[#94A3B8] line-through">
                      {formatPrice(selectedProduct.price)}
                    </span>
                  )}
                </div>
                {selectedProduct.description && (
                  <p className="text-sm text-[#475569] leading-relaxed mb-4">
                    {selectedProduct.description}
                  </p>
                )}
                {selectedProduct.category && CATEGORIES[selectedProduct.category] && (
                  <div className="inline-block text-xs font-semibold text-[#475569] bg-[#F1F5F9] px-3 py-1.5 rounded-lg mb-4">
                    {CATEGORIES[selectedProduct.category]}
                  </div>
                )}

                {/* Qty controls */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-sm font-bold text-[#475569]">Тоо ширхэг:</span>
                  <div className="flex items-center gap-0 border border-[#E2E8F0] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                      className="w-10 h-10 bg-[#F8FAFC] border-none cursor-pointer text-lg hover:bg-[#E2E8F0] transition"
                    >
                      −
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center text-sm font-bold border-x border-[#E2E8F0]">
                      {modalQty}
                    </span>
                    <button
                      onClick={() => setModalQty(modalQty + 1)}
                      className="w-10 h-10 bg-[#F8FAFC] border-none cursor-pointer text-lg hover:bg-[#E2E8F0] transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 pt-0 space-y-2 shrink-0">
                <button
                  onClick={addFromModal}
                  className="w-full bg-brand text-white py-3.5 rounded-xl font-bold text-sm border-none cursor-pointer shadow-[0_2px_8px_rgba(204,0,0,.25)] hover:bg-brand-dark transition-all"
                >
                  🛒 Сагсанд нэмэх — {formatPrice((selectedProduct.salePrice || selectedProduct.price) * modalQty)}
                </button>
                {isLoggedIn && user?.role === 'affiliate' && (
                  <button
                    onClick={handleShare}
                    className="w-full bg-[#F1F5F9] text-[#475569] py-3 rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-[#E2E8F0] transition"
                  >
                    🔗 Хуваалцах линк хуулах
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Cart Drawer ── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ── Footer ── */}
      <footer className="bg-[#0F172A] text-white pt-12 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <EsellerLogo size={28} />
                <span className="text-lg font-black tracking-tight">
                  eseller<span className="text-brand">.mn</span>
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Монголын хамгийн том онлайн худалдааны платформ. Баталгаатай бараа, хурдан хүргэлт.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-bold text-white/80 mb-3 uppercase tracking-wider">Дэлгүүр</h4>
              <ul className="list-none space-y-2">
                {['Бүх бараа', 'Хямдрал', 'Шинэ ирэлт', 'Шилдэг бараа'].map((t) => (
                  <li key={t}>
                    <span className="text-xs text-white/40 hover:text-white cursor-pointer transition">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white/80 mb-3 uppercase tracking-wider">Тусламж</h4>
              <ul className="list-none space-y-2">
                {['Хүргэлтийн мэдээлэл', 'Буцаалтын бодлого', 'Нууцлалын бодлого', 'Холбоо барих'].map((t) => (
                  <li key={t}>
                    <span className="text-xs text-white/40 hover:text-white cursor-pointer transition">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white/80 mb-3 uppercase tracking-wider">Бидний тухай</h4>
              <ul className="list-none space-y-2">
                {['Компанийн тухай', 'Борлуулагч болох', 'Affiliate програм', 'Хүргэгч болох'].map((t) => (
                  <li key={t}>
                    <span className="text-xs text-white/40 hover:text-white cursor-pointer transition">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-xs text-white/30">
              &copy; 2026 eseller.mn — Бүх эрх хуулиар хамгаалагдсан
            </span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/30">Төлбөрийн хэрэгсэл:</span>
              <span className="text-sm">💳</span>
              <span className="text-xs font-bold text-white/50">QPay</span>
              <span className="text-xs font-bold text-white/50">Visa</span>
              <span className="text-xs font-bold text-white/50">MC</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile Nav ── */}
      <MobileNav />
    </div>
  );
}
