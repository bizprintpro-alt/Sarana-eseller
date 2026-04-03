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

  if (loading) return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-[#E31E24] border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center"><p className="text-gray-400">Бараа олдсонгүй</p></div>;

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
    <div className="min-h-screen bg-[#F5F5F5]">
      <Toast />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto h-14 flex items-center px-4 gap-3">
          <Link href="/store" className="flex items-center gap-1 text-sm text-gray-500 no-underline hover:text-gray-900 transition">
            <ChevronLeft className="w-4 h-4" /> Буцах
          </Link>
          <div className="flex-1" />
          <Link href="/" className="flex items-center gap-2 no-underline">
            <EsellerLogo size={22} />
            <span className="text-base font-black text-gray-900 hidden sm:block">eseller<span className="text-[#E31E24]">.mn</span></span>
          </Link>
          <div className="flex-1" />
          <button onClick={() => setCartOpen(true)} className="relative w-9 h-9 rounded-lg hover:bg-gray-100 border-none cursor-pointer bg-transparent flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-[#E31E24] text-white text-[9px] font-bold flex items-center justify-center px-1">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-gray-400 flex items-center gap-1.5">
        <Link href="/store" className="no-underline text-gray-400 hover:text-gray-600">Дэлгүүр</Link>
        <ChevronRight className="w-3 h-3" />
        {product.category && <><span className="text-gray-400">{CATEGORIES[product.category] || product.category}</span><ChevronRight className="w-3 h-3" /></>}
        <span className="text-gray-600 font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ═══ LEFT: Gallery ═══ */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center">
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
                      activeImg === i ? 'border-[#E31E24]' : 'border-gray-200 opacity-60 hover:opacity-100')}>
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
                <Store className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">{product.store.name}</span>
              </div>
            )}

            <h1 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('w-4 h-4', i < Math.round(product.rating!) ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.rating} ({product.reviewCount || 0} үнэлгээ)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#E31E24]">{formatPrice(price)}</span>
              {disc > 0 && <span className="text-base text-gray-400 line-through">{formatPrice(product.price)}</span>}
              {disc > 0 && <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">-{disc}% хямдарсан</span>}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Truck, text: 'Хурдан хүргэлт' },
                { icon: Shield, text: 'Баталгаатай' },
                { icon: RotateCcw, text: '7 хоног буцаалт' },
              ].map((b) => (
                <span key={b.text} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <b.icon className="w-3.5 h-3.5" /> {b.text}
                </span>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center border-none cursor-pointer bg-white hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                <span className="w-12 h-10 flex items-center justify-center text-sm font-bold border-x border-gray-200">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center border-none cursor-pointer bg-white hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={handleAddToCart}
                className="flex-1 bg-[#E31E24] text-white py-3 rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-[#C41A1F] transition flex items-center justify-center gap-2 shadow-sm">
                <ShoppingCart className="w-4 h-4" /> Сагсанд нэмэх — {formatPrice(price * qty)}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition">
                <Heart className="w-4 h-4" /> Хадгалах
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.show('Линк хуулагдлаа', 'ok'); }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition">
                <Share2 className="w-4 h-4" /> Хуваалцах
              </button>
            </div>
          </div>
        </div>

        {/* ═══ Tabs ═══ */}
        <div className="mt-10">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6">
            {[
              { key: 'desc', label: 'Тайлбар' },
              { key: 'reviews', label: `Үнэлгээ (${product.reviewCount || 0})` },
            ].map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition',
                  activeTab === t.key ? 'bg-[#E31E24] text-white' : 'bg-transparent text-gray-500 hover:bg-gray-50')}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'desc' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 leading-relaxed">{product.description || 'Тайлбар оруулаагүй байна.'}</p>
              {product.category && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Ангилал:</span>
                  <span className="text-xs font-semibold text-gray-700 ml-2">{CATEGORIES[product.category] || product.category}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r: any, i: number) => (
                    <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={cn('w-3 h-3', j < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />)}</div>
                        <span className="text-xs text-gray-400">{r.buyerName || 'Хэрэглэгч'}</span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">Үнэлгээ байхгүй байна</p>
              )}
            </div>
          )}
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Төстэй бараа</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link key={p._id} href={`/store/${p._id}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden no-underline hover:shadow-md transition">
                  <div className="h-32 bg-gray-50 flex items-center justify-center text-3xl">{p.emoji || '📦'}</div>
                  <div className="p-3">
                    <div className="text-xs font-bold text-gray-900 line-clamp-2">{p.name}</div>
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
