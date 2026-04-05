'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Share2, ShoppingBag, Star, Heart, MapPin, QrCode, Copy, Check } from 'lucide-react';

/* ═══ Demo Data ═══ */
const DEMO_SELLER = {
  username: 'bayaraa',
  displayName: 'Б. Баяраа',
  bio: 'Электроник, гоо сайхны бүтээгдэхүүн борлуулагч. Найдвартай бараа, хурдан хүргэлт.',
  avatar: null,
  isVerified: true,
  commissionRate: 15,
  totalSales: 142,
  totalEarned: 4250000,
};

const DEMO_PRODUCTS = [
  { id: 'sp1', name: 'iPhone 15 Pro 256GB', price: 3800000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', store: 'TechUB', rating: 4.8 },
  { id: 'sp2', name: 'Cashmere цамц', price: 89000, salePrice: 65000, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a0a?w=400&q=80', store: 'Gobi Store', rating: 4.6 },
  { id: 'sp3', name: 'Yoga mat pro', price: 55000, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80', store: 'SportsMN', rating: 4.9 },
  { id: 'sp4', name: 'Гоо сайхны багц', price: 45000, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', store: 'Beauty Lab', rating: 4.7 },
  { id: 'sp5', name: 'Wireless earbuds', price: 65000, image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&q=80', store: 'TechUB', rating: 4.5 },
  { id: 'sp6', name: 'Ажлын ширээ', price: 185000, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80', store: 'Home Deco', rating: 4.4 },
];

function formatPrice(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + ' сая₮';
  return n.toLocaleString() + '₮';
}

export default function SellerPage() {
  const seller = DEMO_SELLER;
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://eseller.mn/seller/${seller.username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--esl-bg-page)' }}>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden" style={{ background: '#E8242C' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_120%,rgba(0,0,0,0.4),transparent)]" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-14 text-center">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white/20 border-3 border-white/40 flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 shadow-xl">
            {seller.displayName.charAt(0)}
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl font-black text-white">{seller.displayName}</h1>
            {seller.isVerified && (
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">✓</span>
            )}
          </div>

          <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">{seller.bio}</p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div>
              <p className="text-2xl font-black text-white">{seller.totalSales}</p>
              <p className="text-xs text-white/70">Борлуулалт</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{DEMO_PRODUCTS.length}</p>
              <p className="text-xs text-white/70">Бараа</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{seller.commissionRate}%</p>
              <p className="text-xs text-white/70">Комисс</p>
            </div>
          </div>

          {/* Share */}
          <div className="flex justify-center gap-2">
            <button onClick={handleCopy} className="flex items-center gap-2 bg-white/20 border border-white/30 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-white/30 transition backdrop-blur-sm">
              {copied ? <><Check className="w-3.5 h-3.5" /> Хуулагдлаа</> : <><Copy className="w-3.5 h-3.5" /> Линк хуулах</>}
            </button>
            <button className="flex items-center gap-2 bg-white/20 border border-white/30 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-white/30 transition backdrop-blur-sm">
              <QrCode className="w-3.5 h-3.5" /> QR код
            </button>
            <button className="flex items-center gap-2 bg-white/20 border border-white/30 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-white/30 transition backdrop-blur-sm">
              <Share2 className="w-3.5 h-3.5" /> Хуваалцах
            </button>
          </div>
        </div>
      </section>

      {/* ═══ PRODUCTS ═══ */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--esl-text-primary)' }}>
          <ShoppingBag className="w-5 h-5 inline mr-2" />
          Миний бараа бүтээгдэхүүн
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {DEMO_PRODUCTS.map((p) => {
            const disc = p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
            const px = p.salePrice || p.price;
            return (
              <div key={p.id} className="group rounded-xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
                <div className="relative aspect-square" style={{ background: 'var(--esl-bg-section)' }}>
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  {disc > 0 && (
                    <span className="absolute top-2 left-2 bg-[#E8242C] text-white text-[10px] font-bold px-2 py-0.5 rounded">-{disc}%</span>
                  )}
                  {/* Store badge */}
                  <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                    {p.store}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium line-clamp-2 mb-1.5 leading-snug" style={{ color: 'var(--esl-text-primary)' }}>{p.name}</p>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-sm font-bold text-[#E8242C]">{formatPrice(px)}</span>
                    {disc > 0 && <span className="text-[10px] line-through" style={{ color: 'var(--esl-text-muted)' }}>{formatPrice(p.price)}</span>}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[10px]" style={{ color: 'var(--esl-text-muted)' }}>{p.rating}</span>
                  </div>
                  <button className="w-full py-2 rounded-lg bg-[#E8242C] text-white text-xs font-bold border-none cursor-pointer hover:bg-[#CC0000] transition">
                    Захиалах
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t py-8 text-center" style={{ borderColor: 'var(--esl-border)', background: 'var(--esl-bg-section)' }}>
        <p className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>
          {seller.displayName} — eseller.mn борлуулагч
        </p>
        <Link href="/feed" className="text-xs text-[#E8242C] no-underline mt-2 inline-block">eseller.mn →</Link>
      </footer>
    </div>
  );
}
