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
import ProductCard from '@/components/store/ProductCard';
import SaleSlider from '@/components/store/SaleSlider';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { Search, ShoppingCart, User, ChevronDown, Tag, ChevronRight } from 'lucide-react';

const NAV_CATS = [
  { key: 'food', label: 'Хоол хүнс' }, { key: 'fashion', label: 'Хувцас' },
  { key: 'electronics', label: 'Электроник' }, { key: 'beauty', label: 'Гоо сайхан' },
  { key: 'home', label: 'Гэр ахуй' }, { key: 'sports', label: 'Спорт' },
  { key: 'salon', label: 'Салон' }, { key: 'repair', label: 'Засвар' },
];

const WL_KEY = 'eseller_wishlist';
function loadWL(): Set<string> { try { const r = localStorage.getItem(WL_KEY); return r ? new Set(JSON.parse(r)) : new Set(); } catch { return new Set(); } }

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
        <div className="bg-[#1A1A2E] text-white/80 text-xs"><div className="max-w-[1320px] mx-auto px-4 h-9 flex items-center justify-between"><span>🚚 50,000₮+ үнэгүй хүргэлт</span>{isLoggedIn ? <Link href={roleHome(user?.role)} className="text-white/80 no-underline">{user?.name}</Link> : <Link href="/login" className="text-[#FCD34D] no-underline font-medium">Нэвтрэх</Link>}</div></div>

        <header className="sticky top-0 z-50 bg-[#111111] border-b border-[#2A2A2A]">
          <div className="max-w-[1320px] mx-auto px-4 h-16 flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0"><EsellerLogo size={32} /><span className="text-xl font-black text-white hidden sm:block">eseller<span className="text-[#E31E24]">.mn</span></span></Link>
            <div className="flex-1 max-w-2xl relative flex"><input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Бараа хайх..." className="w-full h-11 pl-4 pr-12 rounded-xl bg-[#2A2A2A] border border-[#3D3D3D] text-white text-sm outline-none focus:border-[#E8242C] placeholder:text-[#A0A0A0] transition-all" /><button className="absolute right-1 top-1 bottom-1 px-3 bg-[#E31E24] text-white rounded-lg border-none cursor-pointer"><Search className="w-4 h-4" /></button></div>
            <div className="flex items-center gap-2">
              {isLoggedIn && <Link href={roleHome(user?.role)} className="hidden md:flex w-10 h-10 rounded-xl hover:bg-[#F5F5F5] items-center justify-center text-[#475569] no-underline"><User className="w-5 h-5" /></Link>}
              <button onClick={() => setCartOpen(true)} className="relative w-10 h-10 rounded-xl hover:bg-[#F5F5F5] border-none cursor-pointer bg-transparent flex items-center justify-center text-[#475569]"><ShoppingCart className="w-5 h-5" />{cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#E31E24] text-white text-[10px] font-bold flex items-center justify-center px-1">{cartCount}</span>}</button>
            </div>
          </div>
          <div className="bg-[#E31E24] relative"><div className="max-w-[1320px] mx-auto px-4 flex items-center h-10 overflow-x-auto scrollbar-none">
            <button onClick={() => setMegaOpen(!megaOpen)} className={cn('shrink-0 h-full px-4 text-sm font-semibold border-none cursor-pointer flex items-center gap-1.5 text-white', megaOpen ? 'bg-white/25' : 'bg-white/10')}>Ангилал <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', megaOpen && 'rotate-180')} /></button>
            {NAV_CATS.map(c => <button key={c.key} onClick={() => { setActiveCat(c.key); setMegaOpen(false); }} className={cn('shrink-0 h-full px-4 text-sm font-semibold border-none cursor-pointer whitespace-nowrap', activeCat === c.key ? 'bg-white/20 text-white' : 'bg-transparent text-white/85 hover:bg-white/10')}>{c.label}</button>)}
            <div className="flex-1" /><button onClick={() => setActiveCat('all')} className="shrink-0 h-full px-4 text-sm font-bold border-none cursor-pointer bg-transparent text-[#FCD34D] flex items-center gap-1.5 whitespace-nowrap"><Tag className="w-3.5 h-3.5" />Хямдралтай</button>
          </div><MegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} onSelectCategory={setActiveCat} onSelectType={setActiveType} /></div>
        </header>

        <HeroBanner onSearch={() => searchRef.current?.focus()} />

        {saleProducts.length > 0 && <SaleSlider products={saleProducts} quickAdd={quickAdd} findProduct={findProduct} setSelProduct={setSelProduct} wishlist={wishlist} toggleWL={toggleWL} setActiveCat={setActiveCat} />}

        <ProductGrid products={filtered} loading={loading} activeType={activeType} activeCat={activeCat} onTypeChange={setActiveType} onCatChange={setActiveCat} onProductClick={id => setSelProduct(findProduct(id))} onQuickAdd={quickAdd} wishlist={wishlist} onToggleWish={toggleWL} />

        {selProduct && <ProductModal product={selProduct} onClose={() => setSelProduct(null)} isAffiliate={isLoggedIn && user?.role === 'affiliate'} onShare={() => { navigator.clipboard.writeText(`${window.location.origin}/store/${selProduct._id}?ref=${user?.username || ''}`).then(() => toast.show('Линк хуулагдлаа!', 'ok')); }} />}

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <footer className="bg-[#1A1A2E] text-white pt-10 pb-24 md:pb-10">
          <div className="max-w-[1320px] mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3"><EsellerLogo size={22} /><span className="text-base font-black">eseller<span className="text-[#E31E24]">.mn</span></span></div>
                <p className="text-xs text-white/40 leading-relaxed">Монголын хамгийн том онлайн marketplace.</p>
              </div>
              <div><h4 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Дэлгүүр</h4><ul className="list-none space-y-1.5">{['Бүх бараа', 'Хямдрал', 'Шинэ ирэлт'].map(t => <li key={t}><span className="text-xs text-white/35 hover:text-white cursor-pointer transition">{t}</span></li>)}</ul></div>
              <div><h4 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Платформ</h4><ul className="list-none space-y-1.5">{[{t:'Бүх дэлгүүрүүд',h:'/shops'},{t:'Борлуулагч болох',h:'/become-seller'},{t:'Нэвтрэх',h:'/login'}].map(l => <li key={l.t}><Link href={l.h} className="text-xs text-white/35 hover:text-white no-underline transition">{l.t}</Link></li>)}</ul></div>
              <div><h4 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Тусламж</h4><ul className="list-none space-y-1.5">{['Холбоо барих', 'Нөхцөл', 'Нууцлал'].map(t => <li key={t}><span className="text-xs text-white/35 hover:text-white cursor-pointer transition">{t}</span></li>)}</ul></div>
            </div>
            <div className="border-t border-white/10 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
              <span className="text-xs text-white/25">&copy; 2026 eseller.mn — Бүх эрх хуулиар хамгаалагдсан</span>
              <div className="flex items-center gap-4"><span className="text-xs font-bold text-white/40">QPay</span><span className="text-xs font-bold text-white/40">Visa</span><span className="text-xs font-bold text-white/40">Mastercard</span></div>
            </div>
          </div>
        </footer>
        <MobileNav />
      </div>
    </ErrorBoundary>
  );
}
