'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Star, Shield, ShoppingBag, Users, Share2 } from 'lucide-react';
import { ShareModal } from '@/components/shared/ShareModal';

interface ShopData {
  id: string; name: string; slug: string; logo?: string | null; phone?: string | null;
  address?: string | null; industry?: string | null; district?: string | null;
  allowSellers?: boolean; sellerCommission?: number;
  storefrontConfig?: Record<string, unknown> | null;
  user?: { name: string; avatar?: string | null };
}

interface ProductData {
  _id: string; name: string; price: number; salePrice?: number | null;
  images?: string[]; emoji?: string | null; category?: string | null;
  rating?: number | null; reviewCount?: number | null; stock?: number | null;
}

const ENTITY_BADGES: Record<string, { label: string; emoji: string; color: string }> = {
  store: { label: 'Онлайн дэлгүүр', emoji: '🏪', color: '#3B82F6' },
  service: { label: 'Үйлчилгээ', emoji: '🛎️', color: '#888780' },
  agent: { label: 'ҮХХ агент', emoji: '🏠', color: '#7F77DD' },
  company: { label: 'Барилгын компани', emoji: '🏗️', color: '#22C55E' },
  auto_dealer: { label: 'Авто худалдаа', emoji: '🚗', color: '#F59E0B' },
};

function formatPrice(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + ' сая₮';
  return n.toLocaleString() + '₮';
}

function discountPct(price: number, sale?: number | null) {
  if (!sale || sale >= price) return 0;
  return Math.round((1 - sale / price) * 100);
}

export default function StorefrontClient({ shop, products }: { shop: ShopData; products: ProductData[] }) {
  const badge = ENTITY_BADGES[shop.industry || 'store'] || ENTITY_BADGES.store;
  const [shareOpen, setShareOpen] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/${shop.slug}` : `https://eseller.mn/${shop.slug}`;

  return (
    <div className="min-h-screen" style={{ background: 'var(--esl-bg-page)' }}>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 50%, #E8242C 150%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(232,36,44,0.3),transparent)]" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-start gap-5 mb-6">
            {shop.logo ? (
              <img loading="lazy" src={shop.logo} alt={shop.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8242C] to-[#FF6B6B] flex items-center justify-center text-2xl font-black text-white shadow-lg">
                {shop.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: badge.color + '33', color: '#fff', border: `1px solid ${badge.color}66` }}>
                  {badge.emoji} {badge.label}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/90 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Баталгаажсан
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{shop.name}</h1>
            </div>
          </div>

          {shop.address && (
            <p className="text-white/70 text-sm mb-6 max-w-xl">{shop.address}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap mb-8">
            {shop.district && (
              <span className="flex items-center gap-1 text-white/60 text-xs"><MapPin className="w-3 h-3" /> {shop.district}</span>
            )}
            {shop.phone && (
              <span className="flex items-center gap-1 text-white/60 text-xs"><Phone className="w-3 h-3" /> {shop.phone}</span>
            )}
            <span className="flex items-center gap-1 text-white/60 text-xs"><ShoppingBag className="w-3 h-3" /> {products.length} бараа</span>
          </div>

          <div className="flex gap-3 flex-wrap">
            <a href="#products" className="bg-white text-[#E8242C] px-7 py-3.5 rounded-xl font-bold text-sm no-underline hover:bg-white/90 transition shadow-lg">
              Захиалах
            </a>
            {shop.phone && (
              <a href={`tel:${shop.phone}`} className="bg-white/10 border border-white/30 text-white px-6 py-3.5 rounded-xl font-semibold text-sm no-underline hover:bg-white/20 transition backdrop-blur-sm">
                Холбоо барих
              </a>
            )}
            <button onClick={() => setShareOpen(true)} className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-5 py-3.5 rounded-xl font-semibold text-sm cursor-pointer hover:bg-white/20 transition backdrop-blur-sm">
              <Share2 className="w-4 h-4" /> Хуваалцах
            </button>
          </div>

          {shop.allowSellers && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-white/90">Борлуулагч болох боломжтой — <strong className="text-amber-400">{shop.sellerCommission || 10}% комисс</strong></span>
            </div>
          )}
        </div>
      </section>

      {/* ═══ PRODUCTS ═══ */}
      <section id="products" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-xl font-black mb-6" style={{ color: 'var(--esl-text-primary)' }}>
          Бүтээгдэхүүн
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">📦</span>
            <p className="font-bold" style={{ color: 'var(--esl-text-primary)' }}>Бараа байхгүй байна</p>
            <p className="text-sm mt-1" style={{ color: 'var(--esl-text-muted)' }}>Удахгүй нэмэгдэнэ</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => {
              const disc = discountPct(p.price, p.salePrice);
              const px = p.salePrice || p.price;
              const img = p.images?.[0];
              return (
                <Link key={p._id} href={`/store/${p._id}`} className="group no-underline block">
                  <div className="rounded-xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
                    <div className="relative aspect-square" style={{ background: 'var(--esl-bg-section)' }}>
                      {img ? (
                        <img loading="lazy" src={img} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">{p.emoji || '📦'}</div>
                      )}
                      {disc > 0 && (
                        <span className="absolute top-2 left-2 bg-[#E8242C] text-white text-[10px] font-bold px-2 py-0.5 rounded">-{disc}%</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs line-clamp-2 font-medium mb-1.5 leading-snug" style={{ color: 'var(--esl-text-primary)' }}>{p.name}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-[#E8242C]">{formatPrice(px)}</span>
                        {disc > 0 && <span className="text-[10px] line-through" style={{ color: 'var(--esl-text-muted)' }}>{formatPrice(p.price)}</span>}
                      </div>
                      {p.rating != null && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px]" style={{ color: 'var(--esl-text-muted)' }}>{p.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ ABOUT ═══ */}
      {shop.address && (
        <section className="max-w-6xl mx-auto px-6 py-12 border-t" style={{ borderColor: 'var(--esl-border)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--esl-text-primary)' }}>Тухай</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-xl p-5 border" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--esl-text-secondary)' }}>{shop.address}</p>
              {shop.district && (
                <p className="text-xs mt-3 flex items-center gap-1" style={{ color: 'var(--esl-text-muted)' }}>
                  <MapPin className="w-3 h-3" /> {shop.district} дүүрэг
                </p>
              )}
            </div>
            {shop.phone && (
              <div className="rounded-xl p-5 border" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--esl-text-primary)' }}>Холбоо барих</p>
                <a href={`tel:${shop.phone}`} className="text-sm text-[#E8242C] no-underline flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {shop.phone}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t py-8 text-center" style={{ borderColor: 'var(--esl-border)', background: 'var(--esl-bg-section)' }}>
        <p className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>
          © {new Date().getFullYear()} {shop.name} — eseller.mn дээр
        </p>
      </footer>

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} url={shareUrl} title={shop.name} description={`${shop.name} — eseller.mn дэлгүүр`} />
    </div>
  );
}
