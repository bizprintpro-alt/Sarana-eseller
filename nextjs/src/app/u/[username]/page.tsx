'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AffiliateAPI, ProductsAPI, type Product } from '@/lib/api';
import { formatPrice, DEMO_PRODUCTS, getInitials } from '@/lib/utils';
import { useCartStore } from '@/lib/cart';
import ProductCard from '@/components/store/ProductCard';
import CartDrawer from '@/components/store/CartDrawer';
import EsellerLogo from '@/components/shared/EsellerLogo';
import Footer from '@/components/shared/Footer';
import MobileNav from '@/components/shared/MobileNav';

export default function CreatorProfile() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = useCartStore((s) => s.count());
  const addToCart = useCartStore((s) => s.add);

  useEffect(() => {
    // Save referral
    if (username) {
      sessionStorage.setItem('eseller_ref', username);
      localStorage.setItem('eseller_ref', username);
      document.cookie = `eseller_ref=${encodeURIComponent(username)};path=/;max-age=${30 * 24 * 60 * 60};SameSite=Lax`;
    }
    loadData();
  }, [username]);

  async function loadData() {
    try {
      const [p, prods] = await Promise.all([
        AffiliateAPI.getProfile(username).catch(() => null),
        ProductsAPI.list({ limit: '20' }).catch(() => ({ products: [] })),
      ]);
      setProfile(p);
      const prodList = (prods as any)?.products || [];
      setProducts(prodList.length ? prodList : DEMO_PRODUCTS);
    } catch {
      setProducts(DEMO_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-5 gap-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
          <EsellerLogo size={22} />
          <span className="text-base font-black text-brand tracking-tight">eseller</span>
        </Link>
        <div className="flex-1" />
        <Link href="/store" className="text-sm font-semibold text-[#475569] no-underline hover:text-brand transition">
          Дэлгүүр
        </Link>
        <button
          onClick={() => setCartOpen(true)}
          className="relative bg-transparent border-none cursor-pointer p-2"
        >
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] py-12 px-6 text-center text-white">
        <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
          {profile?.avatar ? (
            <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(profile?.name || username)
          )}
        </div>
        <h1 className="text-2xl font-black mb-1">{profile?.name || `@${username}`}</h1>
        <p className="text-white/50 text-sm mb-3">eseller.mn борлуулагч</p>
        {profile?.bio && (
          <p className="text-white/40 text-sm max-w-md mx-auto">{profile.bio}</p>
        )}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="text-center">
            <div className="text-lg font-black">{profile?.salesCount || 0}</div>
            <div className="text-xs text-white/40">Борлуулалт</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-lg font-black">{products.length}</div>
            <div className="text-xs text-white/40">Бараа</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-lg font-black">⭐ {profile?.rating || '4.8'}</div>
            <div className="text-xs text-white/40">Үнэлгээ</div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-5 py-8">
        <h2 className="text-lg font-black text-[#0F172A] mb-6">
          ✨ Санал болгож буй бараанууд
        </h2>

        {loading ? (
          <div className="text-center py-16 text-[#94A3B8] text-sm">Ачааллаж байна...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onQuickAdd={(product) => {
                  addToCart(product);
                  setCartOpen(true);
                }}
                onClick={() => {
                  // Navigate to store with ref
                  window.location.href = `/store?product=${p._id}&ref=${username}`;
                }}
              />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-[#94A3B8] font-semibold">Бараа байхгүй байна</p>
          </div>
        )}
      </div>

      <Footer />
      <MobileNav />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
