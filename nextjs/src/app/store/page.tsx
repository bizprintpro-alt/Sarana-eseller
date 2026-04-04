'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ProductsAPI, type Product } from '@/lib/api';
import { useCartStore } from '@/lib/cart';
import { DEMO_PRODUCTS, cn } from '@/lib/utils';
import { useAuth, roleHome } from '@/lib/auth';
import { DEMO_SERVICES, type Service } from '@/lib/types/service';
import type { ItemType } from '@/lib/marketplace';
import CartDrawer from '@/components/store/CartDrawer';
import MobileNav from '@/components/shared/MobileNav';
import EsellerLogo from '@/components/shared/EsellerLogo';
import Toast, { useToast } from '@/components/shared/Toast';
import MegaMenu from '@/components/store/MegaMenu';
import HeroBanner from '@/components/store/HeroBanner';
import ProductGrid from '@/components/store/ProductGrid';
import ProductModal from '@/components/store/ProductModal';
import SaleSlider from '@/components/store/SaleSlider';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Search, ShoppingCart, User, ChevronDown, Tag, ChevronRight,
  ShieldCheck, Truck, RefreshCw, Lock,
  UtensilsCrossed, Shirt, Cpu, Sparkles, Home, Dumbbell, Scissors, Wrench,
  Store, Newspaper, Crown,
} from 'lucide-react';

/* ─── Constants ─── */
const NAV_CATS = [
  { key: 'food', label: 'Хоол хүнс' }, { key: 'fashion', label: 'Хувцас' },
  { key: 'electronics', label: 'Электроник' }, { key: 'beauty', label: 'Гоо сайхан' },
  { key: 'home', label: 'Гэр ахуй' }, { key: 'sports', label: 'Спорт' },
  { key: 'salon', label: 'Салон' }, { key: 'repair', label: 'Засвар' },
];

const CATEGORY_ICONS = [
  { key: 'food', label: 'Хоол хүнс', icon: UtensilsCrossed, color: '#059669' },
  { key: 'fashion', label: 'Хувцас', icon: Shirt, color: '#7C3AED' },
  { key: 'electronics', label: 'Электроник', icon: Cpu, color: '#0891B2' },
  { key: 'beauty', label: 'Гоо сайхан', icon: Sparkles, color: '#DB2777' },
  { key: 'home', label: 'Гэр ахуй', icon: Home, color: '#D97706' },
  { key: 'sports', label: 'Спорт', icon: Dumbbell, color: '#2563EB' },
  { key: 'salon', label: 'Салон', icon: Scissors, color: '#9333EA' },
  { key: 'repair', label: 'Засвар', icon: Wrench, color: '#DC2626' },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Баталгаат', sub: 'Бүх бараа баталгаатай', color: '#059669' },
  { icon: Truck, label: 'Хурдан хүргэлт', sub: '2-4 цагийн дотор', color: '#0891B2' },
  { icon: RefreshCw, label: '48 цагийн буцаалт', sub: 'Эрсдэлгүй худалдан авалт', color: '#D97706' },
  { icon: Lock, label: 'Аюулгүй төлбөр', sub: 'QPay, Visa, Mastercard', color: '#7C3AED' },
];

const MARQUEE_ITEMS = [
  'Электроник бараанд 50% хямдрал',
  'Шинэ хэрэглэгчдэд 10,000₮ купон',
  '50,000₮-с дээш үнэгүй хүргэлт',
  'Гоо сайхны бүтээгдэхүүн 1+1 урамшуулал',
  'Gold гишүүнчлэлтэй хамт давуу эрх',
  'Долоо хоног бүр шинэ ирэлт',
];

const WL_KEY = 'eseller_wishlist';
function loadWL(): Set<string> { try { const r = localStorage.getItem(WL_KEY); return r ? new Set(JSON.parse(r)) : new Set(); } catch { return new Set(); } }

/* ─── Marquee component ─── */
function AnnouncementMarquee() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{ background: 'var(--esl-bg-card)', borderBottom: '1px solid var(--esl-border)' }} className="overflow-hidden">
      <div className="max-w-full py-2.5 relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 mx-6 text-xs font-medium" style={{ color: 'var(--esl-text-secondary)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8242C] shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 35s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

/* ─── Main page ─── */
export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debSearch, setDebSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [activeType, setActiveType] = useState<'all' | ItemType>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [selProduct, setSelProduct] = useState<Product | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const cart = useCartStore();
  const cartCount = useCartStore((s) => s.count());
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();

  useEffect(() => {
    cart.load(); setWishlist(loadWL());
    (async () => {
      try {
        const [pr, sv] = await Promise.allSettled([ProductsAPI.list({ limit: '60' }), fetch('/api/services?shopId=all').then(r => r.json()).catch(() => ({ data: [] }))]);
        setProducts(pr.status === 'fulfilled' && pr.value.products?.length ? pr.value.products : DEMO_PRODUCTS as unknown as Product[]);
        setServices(sv.status === 'fulfilled' && Array.isArray(sv.value?.data) ? sv.value.data : DEMO_SERVICES as unknown as Service[]);
      } catch { setProducts(DEMO_PRODUCTS as unknown as Product[]); setServices(DEMO_SERVICES as unknown as Service[]); }
      finally { setLoading(false); }
    })();
  }, []); // eslint-disable-line
  useEffect(() => { const t = setTimeout(() => setDebSearch(search), 300); return () => clearTimeout(t); }, [search]);

  const filtered = useMemo(() => {
    let list: Product[] = activeType === 'service'
      ? services.filter(s => s.isActive).map(s => ({ _id: s._id, name: s.name, price: s.price, salePrice: s.salePrice, description: s.description, category: s.category, emoji: s.emoji, images: s.images, rating: s.rating, reviewCount: s.reviewCount } as unknown as Product))
      : activeType === 'product' ? products
      : [...products, ...services.filter(s => s.isActive).map(s => ({ _id: s._id, name: s.name, price: s.price, salePrice: s.salePrice, description: s.description, category: s.category, emoji: s.emoji, images: s.images, rating: s.rating, reviewCount: s.reviewCount } as unknown as Product))];
    if (activeCat !== 'all') list = list.filter(p => p.category === activeCat);
    if (debSearch.trim()) { const q = debSearch.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)); }
    return list;
  }, [products, services, activeCat, debSearch, activeType]);

  const saleProducts = useMemo(() => products.filter(p => p.salePrice && p.salePrice < p.price), [products]);
  const quickAdd = useCallback((p: Product) => { cart.add(p, 1); toast.show(`${p.name} нэмэгдлээ`, 'ok'); }, [cart, toast]);
  const toggleWL = useCallback((id: string) => { setWishlist(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); localStorage.setItem(WL_KEY, JSON.stringify([...n])); return n; }); }, []);
  const findProduct = (id: string) => products.find(p => p._id === id) || null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ background: 'var(--esl-bg-page)' }}>
        <Toast />

        {/* ━━━ Top utility bar ━━━ */}
        <div style={{ background: 'var(--esl-bg-card)', borderBottom: '1px solid var(--esl-border)' }}>
          <div className="max-w-[1320px] mx-auto px-4 h-9 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium" style={{ color: 'var(--esl-text-secondary)' }}>
                <Truck className="w-3 h-3 inline mr-1 opacity-60" />50,000₮+ үнэгүй хүргэлт
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/feed" className="text-xs font-medium no-underline transition-colors hover:opacity-80" style={{ color: 'var(--esl-text-secondary)' }}>
                <Newspaper className="w-3 h-3 inline mr-1 opacity-60" />Зар
              </Link>
              <span className="text-xs" style={{ color: 'var(--esl-border)' }}>|</span>
              <Link href="/gold" className="text-xs font-semibold no-underline" style={{ color: '#D97706' }}>
                <Crown className="w-3 h-3 inline mr-1" />Gold
              </Link>
              <span className="text-xs" style={{ color: 'var(--esl-border)' }}>|</span>
              <Link href="/shops" className="text-xs font-medium no-underline transition-colors hover:opacity-80" style={{ color: 'var(--esl-text-secondary)' }}>
                <Store className="w-3 h-3 inline mr-1 opacity-60" />Дэлгүүрүүд
              </Link>
              <span className="text-xs" style={{ color: 'var(--esl-border)' }}>|</span>
              {isLoggedIn
                ? <Link href={roleHome(user?.role)} className="text-xs font-medium no-underline" style={{ color: 'var(--esl-text-primary)' }}>{user?.name}</Link>
                : <Link href="/login" className="text-xs font-semibold no-underline" style={{ color: '#E8242C' }}>Нэвтрэх</Link>
              }
            </div>
          </div>
        </div>

        {/* ━━━ Sticky header ━━━ */}
        <header className="sticky top-0 z-50" style={{ background: 'var(--esl-bg-card)', borderBottom: '1px solid var(--esl-border)' }}>
          <div className="max-w-[1320px] mx-auto px-4 h-16 flex items-center gap-4 md:gap-5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
              <EsellerLogo size={32} />
              <span className="text-xl font-black hidden sm:block" style={{ color: 'var(--esl-text-primary)' }}>
                eseller<span className="text-[#E8242C]">.mn</span>
              </span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-2xl relative flex">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Бараа, дэлгүүр хайх..."
                className="w-full h-11 pl-4 pr-12 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--esl-bg-input, var(--esl-bg-page))',
                  border: '1.5px solid var(--esl-border)',
                  color: 'var(--esl-text-primary)',
                }}
              />
              <button className="absolute right-1 top-1 bottom-1 px-3 bg-[#E8242C] text-white rounded-lg border-none cursor-pointer hover:bg-[#D31E25] transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              {isLoggedIn && (
                <Link href={roleHome(user?.role)} className="hidden md:flex w-10 h-10 rounded-xl items-center justify-center no-underline transition-colors" style={{ color: 'var(--esl-text-secondary)' }}>
                  <User className="w-5 h-5" />
                </Link>
              )}
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent flex items-center justify-center transition-colors"
                style={{ color: 'var(--esl-text-secondary)' }}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#E8242C] text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category nav strip */}
          <div className="bg-[#E8242C] relative">
            <div className="max-w-[1320px] mx-auto px-4 flex items-center h-10 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setMegaOpen(!megaOpen)}
                className={cn(
                  'shrink-0 h-full px-4 text-sm font-semibold border-none cursor-pointer flex items-center gap-1.5 text-white',
                  megaOpen ? 'bg-white/25' : 'bg-white/10'
                )}
              >
                Ангилал <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', megaOpen && 'rotate-180')} />
              </button>
              {NAV_CATS.map(c => (
                <button
                  key={c.key}
                  onClick={() => { setActiveCat(c.key); setMegaOpen(false); }}
                  className={cn(
                    'shrink-0 h-full px-4 text-sm font-semibold border-none cursor-pointer whitespace-nowrap transition-colors',
                    activeCat === c.key ? 'bg-white/20 text-white' : 'bg-transparent text-white/85 hover:bg-white/10'
                  )}
                >
                  {c.label}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={() => setActiveCat('all')}
                className="shrink-0 h-full px-4 text-sm font-bold border-none cursor-pointer bg-transparent text-[#FCD34D] flex items-center gap-1.5 whitespace-nowrap"
              >
                <Tag className="w-3.5 h-3.5" />Хямдралтай
              </button>
            </div>
            <MegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} onSelectCategory={setActiveCat} onSelectType={setActiveType} />
          </div>
        </header>

        {/* ━━━ Hero ━━━ */}
        <HeroBanner onSearch={() => searchRef.current?.focus()} />

        {/* ━━━ Trust bar ━━━ */}
        <section style={{ background: 'var(--esl-bg-card)', borderBottom: '1px solid var(--esl-border)' }}>
          <div className="max-w-[1320px] mx-auto px-4 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {TRUST_ITEMS.map(item => (
                <div key={item.label} className="flex items-center gap-3 py-1 group cursor-default">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: item.color + '14', color: item.color }}
                  >
                    <item.icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>{item.label}</div>
                    <div className="text-xs" style={{ color: 'var(--esl-text-muted, var(--esl-text-secondary))' }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ Announcement marquee ━━━ */}
        <AnnouncementMarquee />

        {/* ━━━ Sale slider ━━━ */}
        {saleProducts.length > 0 && (
          <SaleSlider
            products={saleProducts}
            quickAdd={quickAdd}
            findProduct={findProduct}
            setSelProduct={setSelProduct}
            wishlist={wishlist}
            toggleWL={toggleWL}
            setActiveCat={setActiveCat}
          />
        )}

        {/* ━━━ Category bar with icons ━━━ */}
        <section className="py-6" style={{ background: 'var(--esl-bg-page)' }}>
          <div className="max-w-[1320px] mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold m-0" style={{ color: 'var(--esl-text-primary)' }}>Ангилалаар хайх</h2>
              <button
                onClick={() => setActiveCat('all')}
                className="text-xs font-semibold border-none bg-transparent cursor-pointer flex items-center gap-1 transition-colors"
                style={{ color: '#E8242C' }}
              >
                Бүгдийг харах <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {CATEGORY_ICONS.map(cat => {
                const isActive = activeCat === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCat(isActive ? 'all' : cat.key)}
                    className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-none cursor-pointer transition-all group"
                    style={{
                      background: isActive ? cat.color + '14' : 'var(--esl-bg-card)',
                      border: isActive ? `1.5px solid ${cat.color}40` : '1.5px solid var(--esl-border)',
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        background: isActive ? cat.color + '22' : cat.color + '10',
                        color: cat.color,
                      }}
                    >
                      <cat.icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <span
                      className="text-xs font-semibold text-center leading-tight"
                      style={{ color: isActive ? cat.color : 'var(--esl-text-primary)' }}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━━ Product grid ━━━ */}
        <ProductGrid
          products={filtered}
          loading={loading}
          activeType={activeType}
          activeCat={activeCat}
          onTypeChange={setActiveType}
          onCatChange={setActiveCat}
          onProductClick={id => setSelProduct(findProduct(id))}
          onQuickAdd={quickAdd}
          wishlist={wishlist}
          onToggleWish={toggleWL}
        />

        {/* ━━━ Product modal ━━━ */}
        {selProduct && (
          <ProductModal
            product={selProduct}
            onClose={() => setSelProduct(null)}
            isAffiliate={isLoggedIn && user?.role === 'affiliate'}
            onShare={() => {
              navigator.clipboard.writeText(`${window.location.origin}/store/${selProduct._id}?ref=${user?.username || ''}`)
                .then(() => toast.show('Линк хуулагдлаа!', 'ok'));
            }}
          />
        )}

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

        {/* ━━━ Footer ━━━ */}
        <footer style={{ background: 'var(--esl-footer-bg, #0A0A0A)' }} className="text-white pt-12 pb-24 md:pb-12">
          <div className="max-w-[1320px] mx-auto px-4">
            {/* Footer top: newsletter + branding */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <EsellerLogo size={26} />
                  <span className="text-lg font-black">eseller<span className="text-[#E8242C]">.mn</span></span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed m-0 max-w-xs">
                  Монголын хамгийн том онлайн marketplace. Баталгаатай бараа, хурдан хүргэлт, найдвартай худалдан авалт.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="И-мэйл хаяг оруулах"
                  className="flex-1 md:w-64 h-10 px-4 rounded-lg text-xs outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
                <button className="h-10 px-5 bg-[#E8242C] text-white text-xs font-bold rounded-lg border-none cursor-pointer hover:bg-[#D31E25] transition-colors shrink-0">
                  Бүртгүүлэх
                </button>
              </div>
            </div>

            {/* Footer columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Дэлгүүр</h4>
                <ul className="list-none p-0 m-0 space-y-2">
                  {[
                    { t: 'Бүх бараа', h: '/store' },
                    { t: 'Хямдрал', h: '/store' },
                    { t: 'Шинэ ирэлт', h: '/store' },
                    { t: 'Зар сурталчилгаа', h: '/feed' },
                  ].map(l => (
                    <li key={l.t}><Link href={l.h} className="text-xs text-white/35 hover:text-white no-underline transition">{l.t}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Платформ</h4>
                <ul className="list-none p-0 m-0 space-y-2">
                  {[
                    { t: 'Бүх дэлгүүрүүд', h: '/shops' },
                    { t: 'Gold гишүүнчлэл', h: '/gold' },
                    { t: 'Борлуулагч болох', h: '/become-seller' },
                    { t: 'Нэвтрэх', h: '/login' },
                  ].map(l => (
                    <li key={l.t}><Link href={l.h} className="text-xs text-white/35 hover:text-white no-underline transition">{l.t}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Тусламж</h4>
                <ul className="list-none p-0 m-0 space-y-2">
                  {['Холбоо барих', 'Түгээмэл асуулт', 'Хүргэлтийн бодлого', 'Буцаалтын бодлого'].map(t => (
                    <li key={t}><span className="text-xs text-white/35 hover:text-white cursor-pointer transition">{t}</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Хууль эрхзүй</h4>
                <ul className="list-none p-0 m-0 space-y-2">
                  {['Үйлчилгээний нөхцөл', 'Нууцлалын бодлого', 'Зохиогчийн эрх'].map(t => (
                    <li key={t}><span className="text-xs text-white/35 hover:text-white cursor-pointer transition">{t}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer bottom */}
            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-xs text-white/25">&copy; 2026 eseller.mn — Бүх эрх хуулиар хамгаалагдсан</span>
              <div className="flex items-center gap-5">
                {['QPay', 'Visa', 'Mastercard', 'SocialPay'].map(name => (
                  <span key={name} className="text-xs font-bold text-white/30 tracking-wide">{name}</span>
                ))}
              </div>
            </div>
          </div>
        </footer>

        <MobileNav />
      </div>
    </ErrorBoundary>
  );
}
