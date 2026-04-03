'use client';

import { formatPrice, discountPercent } from '@/lib/utils';
import type { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  onQuickAdd?: (product: Product) => void;
  onClick?: (id: string) => void;
  isWished?: boolean;
  onToggleWish?: (id: string) => void;
}

export default function ProductCard({
  product: p,
  onQuickAdd,
  onClick,
  isWished,
  onToggleWish,
}: ProductCardProps) {
  const px = p.salePrice || p.price;
  const disc = discountPercent(p.price, p.salePrice);
  const isNew = p.createdAt && Date.now() - new Date(p.createdAt).getTime() < 7 * 864e5;
  const stars = p.rating ? '⭐'.repeat(Math.min(5, Math.round(p.rating))) : '';

  return (
    <div
      className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0_8px_25px_rgba(0,0,0,.08)] hover:border-[#6366F1]/20 relative group"
      onClick={() => onClick?.(p._id)}
    >
      {/* Flags */}
      {disc > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-brand text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
          -{disc}%
        </span>
      )}
      {!disc && isNew && (
        <span className="absolute top-3 left-3 z-10 bg-dash-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
          Шинэ
        </span>
      )}

      {/* Wishlist */}
      {onToggleWish && (
        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-sm border-none cursor-pointer hover:scale-110 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWish(p._id);
          }}
        >
          {isWished ? '❤️' : '♡'}
        </button>
      )}

      {/* Image */}
      <div className="h-44 bg-[#F1F5F9] flex items-center justify-center overflow-hidden">
        {p.images?.[0] ? (
          <img
            src={p.images[0]}
            alt={p.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl">{p.emoji || '📦'}</span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {p.store?.name && (
          <div className="text-xs text-[#94A3B8] mb-1 truncate">🏪 {p.store.name}</div>
        )}
        <div className="text-sm font-bold text-[#0F172A] mb-2 line-clamp-2 leading-snug">
          {p.name}
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-base font-black text-brand">{formatPrice(px)}</span>
          {disc > 0 && (
            <span className="text-xs text-[#94A3B8] line-through">{formatPrice(p.price)}</span>
          )}
        </div>
        {stars && (
          <div className="text-xs mb-2">
            {stars}{' '}
            <span className="text-[#94A3B8] text-[10px]">({p.reviewCount || 0})</span>
          </div>
        )}
        {onQuickAdd && (
          <button
            className="w-full bg-[#F1F5F9] text-[#0F172A] text-xs font-bold py-2.5 rounded-xl border-none cursor-pointer hover:bg-brand hover:text-white transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(p);
            }}
          >
            + Сагсанд нэмэх
          </button>
        )}
      </div>
    </div>
  );
}
