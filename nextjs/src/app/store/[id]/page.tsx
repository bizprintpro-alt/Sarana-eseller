'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProductsAPI, type Product } from '@/lib/api';
import { formatPrice, discountPercent, CATEGORIES, DEMO_PRODUCTS, cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/shared/Toast';
import Toast from '@/components/shared/Toast';
import EsellerLogo from '@/components/shared/EsellerLogo';
import CartDrawer from '@/components/store/CartDrawer';
import MobileNav from '@/components/shared/MobileNav';
import {
  ShoppingCart, Heart, Share2, ChevronLeft, Minus, Plus, Star,
  Truck, Shield, RotateCcw, Store, ChevronRight,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  useAuth(); // keep auth context active
  const toast = useToast();
  const cart = useCartStore();
  const cartCount = useCartStore((s) => s.count());

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('desc');
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const p = await ProductsAPI.get(id);
        setProduct(p);
        // Fetch reviews
        fetch(`/api/products/${id}/reviews`).then(r => r.json()).then(d => setReviews(d.data?.reviews || [])).catch(() => {});
        // Fetch related
        if (p.category) {
          ProductsAPI.list({ category: p.category, limit: '6' }).then(r => setRelatedProducts((r.products || []).filter((x: Product) => x._id !== id).slice(0, 4))).catch(() => {});
        }
      } catch {
        const demo = DEMO_PRODUCTS.find((p) => p._id === id) || DEMO_PRODUCTS[0];
        setProduct(demo as unknown as Product);
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--esl-bg-page)' }}>
      <div className="w-8 h-8 border-[3px] border-[#E31E24] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--esl-bg-page)' }}>
      <p style={{ color: 'var(--esl-text-muted)' }}>Бараа олдсонгүй</p>
    </div>
  );

  const disc = discountPercent(product.price, product.salePrice);
  const images = product.images?.length ? product.images : [];
  const price = product.salePrice || product.price;

  const handleAddToCart = () => {
    cart.add(product, qty);
    toast.show(`${product.name} сагсанд нэмэгдлээ`, 'ok');
  };

  // JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'MNT',
      availability: (product.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(product.rating && product.reviewCount ? {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount },
    } : {}),
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--esl-bg-page)' }}>
      <Toast />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="sticky top-0 z-40 shadow-sm" style={{ background: 'var(--esl-bg-card)', borderBottom: '1px solid var(--esl-border)' }}>
        <div className="max-w-6xl mx-auto h-14 flex items-center px-4 gap-3">
          <Link href="/store" className="flex items-center gap-1 text-sm no-underline transition" style={{ color: 'var(--esl-text-muted)' }}>
            <ChevronLeft className="w-4 h-4" /> Буцах
          </Link>
          <div className="flex-1" />
          <Link href="/" className="flex items-center gap-2 no-underline">
            <EsellerLogo size={22} />
            <span className="text-base font-black hidden sm:block" style={{ color: 'var(--esl-text-primary)' }}>eseller<span className="text-[#E31E24]">.mn</span></span>
          </Link>
          <div className="flex-1" />
          <button onClick={() => setCartOpen(true)} className="relative w-9 h-9 rounded-lg border-none cursor-pointer bg-transparent flex items-center justify-center" style={{ color: 'var(--esl-text-secondary)' }}>
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-[#E31E24] text-white text-[9px] font-bold flex items-center justify-center px-1">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-3 text-xs flex items-center gap-1.5" style={{ color: 'var(--esl-text-muted)' }}>
        <Link href="/store" className="no-underline" style={{ color: 'var(--esl-text-muted)' }}>Дэлгүүр</Link>
        <ChevronRight className="w-3 h-3" />
        {product.category && <><span style={{ color: 'var(--esl-text-muted)' }}>{CATEGORIES[product.category] || product.category}</span><ChevronRight className="w-3 h-3" /></>}
        <span className="font-medium truncate max-w-[200px]" style={{ color: 'var(--esl-text-secondary)' }}>{product.name}</span>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ═══ LEFT: Gallery ═══ */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)' }}>
              {images[activeImg] ? (
                <img src={images[activeImg]} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-8xl">{product.emoji || '📦'}</span>
              )}
              {disc > 0 && <span className="absolute top-4 left-4 bg-[#E31E24] text-white text-sm font-bold px-3 py-1 rounded-lg">-{disc}%</span>}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={cn('w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition',
                      activeImg === i ? 'border-[#E31E24]' : 'opacity-60 hover:opacity-100')}
                    style={activeImg !== i ? { borderColor: 'var(--esl-border)' } : undefined}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ═══ RIGHT: Product info ═══ */}
          <div className="space-y-5">
            {/* Seller */}
            {product.store?.name && (
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4" style={{ color: 'var(--esl-text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--esl-text-muted)' }}>{product.store.name}</span>
              </div>
            )}

            <h1 className="text-2xl font-black leading-tight" style={{ color: 'var(--esl-text-primary)' }}>{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('w-4 h-4', i < Math.round(product.rating!) ? 'text-amber-400 fill-amber-400' : 'text-[var(--esl-text-disabled)]')} />
                  ))}
                </div>
                <span className="text-sm" style={{ color: 'var(--esl-text-muted)' }}>{product.rating} ({product.reviewCount || 0} үнэлгээ)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#E31E24]">{formatPrice(price)}</span>
              {disc > 0 && <span className="text-base line-through" style={{ color: 'var(--esl-text-muted)' }}>{formatPrice(product.price)}</span>}
              {disc > 0 && <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">-{disc}% хямдарсан</span>}
            </div>

            {/* Loyalty points earn preview */}
            <p className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>
              <span role="img" aria-label="star">⭐</span> Энэ барааг авбал {Math.floor(price / 100)} оноо авна
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Truck, text: 'Хурдан хүргэлт' },
                { icon: Shield, text: 'Баталгаатай' },
                { icon: RotateCcw, text: '7 хоног буцаалт' },
              ].map((b) => (
                <span key={b.text} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                  style={{ color: 'var(--esl-text-muted)', background: 'var(--esl-bg-section)' }}>
                  <b.icon className="w-3.5 h-3.5" /> {b.text}
                </span>
              ))}
              {/* eBarimt badge */}
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ color: '#16a34a', background: 'rgba(22,163,74,0.08)' }}>
                <span role="img" aria-label="receipt">🧾</span> еБаримт
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--esl-text-secondary)' }}>{product.description}</p>
            )}

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--esl-border)', background: 'var(--esl-bg-card)' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center border-none cursor-pointer" style={{ background: 'var(--esl-bg-card)', color: 'var(--esl-text-primary)' }}><Minus className="w-4 h-4" /></button>
                <span className="w-12 h-10 flex items-center justify-center text-sm font-bold" style={{ borderLeft: '1px solid var(--esl-border)', borderRight: '1px solid var(--esl-border)', color: 'var(--esl-text-primary)' }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center border-none cursor-pointer" style={{ background: 'var(--esl-bg-card)', color: 'var(--esl-text-primary)' }}><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={handleAddToCart}
                className="flex-1 bg-[#E31E24] text-white py-3 rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-[#C41A1F] transition flex items-center justify-center gap-2 shadow-sm">
                <ShoppingCart className="w-4 h-4" /> Сагсанд нэмэх — {formatPrice(price * qty)}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm cursor-pointer transition"
                style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)', color: 'var(--esl-text-secondary)' }}>
                <Heart className="w-4 h-4" /> Хадгалах
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.show('Линк хуулагдлаа', 'ok'); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm cursor-pointer transition"
                style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)', color: 'var(--esl-text-secondary)' }}>
                <Share2 className="w-4 h-4" /> Хуваалцах
              </button>
            </div>
          </div>
        </div>

        {/* ═══ Tabs ═══ */}
        <div className="mt-10">
          <div className="flex gap-1 rounded-xl p-1 mb-6" style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)' }}>
            {[
              { key: 'desc', label: 'Тайлбар' },
              { key: 'reviews', label: `Үнэлгээ (${product.reviewCount || 0})` },
            ].map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition',
                  activeTab === t.key ? 'bg-[#E31E24] text-white' : 'bg-transparent')}
                style={activeTab !== t.key ? { color: 'var(--esl-text-muted)' } : undefined}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'desc' && (
            <div className="rounded-2xl p-6" style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--esl-text-secondary)' }}>{product.description || 'Тайлбар оруулаагүй байна.'}</p>
              {product.category && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--esl-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>Ангилал:</span>
                  <span className="text-xs font-semibold ml-2" style={{ color: 'var(--esl-text-primary)' }}>{CATEGORIES[product.category] || product.category}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="rounded-2xl p-6" style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)' }}>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r: any, i: number) => (
                    <div key={i} className="last:border-0 pb-4 last:pb-0" style={{ borderBottom: '1px solid var(--esl-border)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={cn('w-3 h-3', j < r.rating ? 'text-amber-400 fill-amber-400' : 'text-[var(--esl-text-disabled)]')} />)}</div>
                        <span className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>{r.buyerName || 'Хэрэглэгч'}</span>
                      </div>
                      {r.comment && <p className="text-sm" style={{ color: 'var(--esl-text-secondary)' }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-8" style={{ color: 'var(--esl-text-muted)' }}>Үнэлгээ байхгүй байна</p>
              )}
            </div>
          )}
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--esl-text-primary)' }}>Төстэй бараа</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link key={p._id} href={`/store/${p._id}`} className="rounded-xl overflow-hidden no-underline hover:shadow-md transition"
                  style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)' }}>
                  <div className="h-32 flex items-center justify-center text-3xl" style={{ background: 'var(--esl-bg-section)' }}>{p.emoji || '📦'}</div>
                  <div className="p-3">
                    <div className="text-xs font-bold line-clamp-2" style={{ color: 'var(--esl-text-primary)' }}>{p.name}</div>
                    <div className="text-sm font-black text-[#E31E24] mt-1">{formatPrice(p.salePrice || p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileNav />
    </div>
  );
}
