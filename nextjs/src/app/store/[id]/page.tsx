'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductsAPI, AffiliateAPI, type Product } from '@/lib/api';
import { formatPrice, discountPercent, CATEGORIES, DEMO_PRODUCTS } from '@/lib/utils';
import { useCartStore } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/shared/Toast';
import EsellerLogo from '@/components/shared/EsellerLogo';
import CartDrawer from '@/components/store/CartDrawer';
import Footer from '@/components/shared/Footer';
import MobileNav from '@/components/shared/MobileNav';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();
  const addToCart = useCartStore((s) => s.add);
  const cartCount = useCartStore((s) => s.count());

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    try {
      const p = await ProductsAPI.get(id);
      setProduct(p);
    } catch {
      const demo = DEMO_PRODUCTS.find((d) => d._id === id);
      setProduct(demo || null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-[#94A3B8] text-sm">Ачааллаж байна...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">📭</div>
        <p className="text-[#94A3B8] font-bold">Бараа олдсонгүй</p>
        <Link href="/store" className="text-brand font-bold text-sm no-underline">
          ← Дэлгүүр рүү буцах
        </Link>
      </div>
    );
  }

  const px = product.salePrice || product.price;
  const disc = discountPercent(product.price, product.salePrice);
  const stars = product.rating ? '⭐'.repeat(Math.min(5, Math.round(product.rating))) : '';

  async function handleShare() {
    if (!user) return;
    const refCode = user.username || user.email?.split('@')[0] || user._id;
    const shareUrl = `${window.location.origin}/store/${product!._id}?ref=${encodeURIComponent(refCode)}`;

    try {
      await AffiliateAPI.createLink(product!._id);
    } catch {}

    if (navigator.share) {
      try {
        await navigator.share({ title: product!.name + ' — eseller.mn', url: shareUrl });
        toast.show('📢 Амжилттай хуваалцлаа!');
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.show('📋 Линк хуулагдлаа!');
    } catch {
      prompt('Линкээ хуулна уу:', shareUrl);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-5 gap-3 shadow-sm">
        <button onClick={() => router.back()} className="text-[#475569] bg-transparent border-none cursor-pointer text-sm font-bold">
          ← Буцах
        </button>
        <div className="flex-1" />
        <Link href="/" className="flex items-center gap-1.5 no-underline">
          <EsellerLogo size={20} />
          <span className="text-sm font-black text-brand">eseller</span>
        </Link>
        <div className="flex-1" />
        <button onClick={() => setCartOpen(true)} className="relative bg-transparent border-none cursor-pointer p-2">
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-5 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden relative">
            {disc > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                -{disc}%
              </span>
            )}
            <div className="aspect-square flex items-center justify-center bg-[#F1F5F9]">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">{product.emoji || '📦'}</span>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <span className="inline-block text-xs font-bold bg-[#F1F5F9] text-[#475569] px-3 py-1 rounded-lg mb-3">
              {CATEGORIES[product.category || ''] || '📦 Бусад'}
            </span>

            <h1 className="text-2xl font-black text-[#0F172A] mb-2">{product.name}</h1>

            {product.store?.name && (
              <div className="text-sm text-[#94A3B8] mb-3">
                🏪 {product.store.name}
                {stars && ` · ${stars} (${product.reviewCount || 0})`}
              </div>
            )}

            <p className="text-sm text-[#475569] leading-relaxed mb-6">
              {product.description || 'Тайлбар байхгүй.'}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-black text-brand">{formatPrice(px)}</span>
              {disc > 0 && (
                <>
                  <span className="text-lg text-[#94A3B8] line-through">{formatPrice(product.price)}</span>
                  <span className="bg-brand/10 text-brand text-xs font-bold px-2 py-1 rounded-lg">-{disc}%</span>
                </>
              )}
            </div>

            {/* Qty + Add */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-0 bg-[#F1F5F9] rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 bg-transparent border-none text-lg cursor-pointer hover:bg-[#E2E8F0] transition font-bold"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-bold">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 bg-transparent border-none text-lg cursor-pointer hover:bg-[#E2E8F0] transition font-bold"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => {
                  addToCart(product, qty);
                  setCartOpen(true);
                }}
                className="flex-1 bg-brand text-white py-3 rounded-xl font-bold text-sm border-none cursor-pointer shadow-[0_2px_8px_rgba(204,0,0,.25)] hover:bg-brand-dark transition-all"
              >
                🛒 Сагсанд нэмэх — {formatPrice(px * qty)}
              </button>
            </div>

            {/* Affiliate share */}
            {isLoggedIn && user?.role === 'affiliate' && (
              <button
                onClick={handleShare}
                className="w-full bg-amber-50 text-amber-600 border border-amber-200 py-3 rounded-xl text-sm font-bold cursor-pointer hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
              >
                📢 Борлуулагчаар хуваалцах
              </button>
            )}

            {!isLoggedIn && (
              <div className="text-center mt-3">
                <Link href="/login#register" className="text-xs text-amber-600 font-semibold no-underline">
                  📢 Борлуулагч болж комисс олох →
                </Link>
              </div>
            )}

            {/* Info badges */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {[
                { ic: '🚚', t: 'Хурдан хүргэлт', d: '2-4 цагт' },
                { ic: '🔒', t: 'Аюулгүй төлбөр', d: 'QPay' },
                { ic: '🔄', t: 'Буцаалт', d: '7 хоногийн дотор' },
                { ic: '✅', t: 'Баталгаат', d: 'Чанарын баталгаа' },
              ].map((b) => (
                <div key={b.t} className="bg-[#F1F5F9] rounded-xl px-3 py-2.5 text-center">
                  <div className="text-lg mb-0.5">{b.ic}</div>
                  <div className="text-[10px] font-bold text-[#0F172A]">{b.t}</div>
                  <div className="text-[9px] text-[#94A3B8]">{b.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <MobileNav />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
