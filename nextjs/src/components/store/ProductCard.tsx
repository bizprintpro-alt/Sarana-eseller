'use client';

import { formatPrice, discountPercent } from '@/lib/utils';
import type { Product } from '@/lib/api';
import { ShoppingCart, Heart } from 'lucide-react';

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
  const stars = p.rating ? Math.min(5, Math.round(p.rating)) : 0;

  return (
    <div
      className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 relative"
      style={{
        background: 'var(--esl-bg-card)',
        border: '1px solid var(--esl-border)',
        boxShadow: 'var(--esl-shadow-card)',
      }}
      onClick={() => onClick?.(p._id)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {disc > 0 && (
          <span className="bg-[#E8242C] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            -{disc}%
          </span>
        )}
        {!disc && isNew && (
          <span className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
            Шинэ
          </span>
        )}
      </div>

      {/* Wishlist */}
      {onToggleWish && (
        <button
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center border-none cursor-pointer transition-all duration-200 hover:scale-110 ${
            isWished
              ? 'bg-[rgba(232,36,44,0.2)] text-[#FF4D53]'
              : 'bg-black/60 text-white/60 hover:text-[#FF4D53] hover:bg-[rgba(232,36,44,0.2)]'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWish(p._id);
          }}
        >
          <Heart className="w-4 h-4" fill={isWished ? 'currentColor' : 'none'} />
        </button>
      )}

      {/* Image */}
      <div className="relative h-48 flex items-center justify-center overflow-hidden" style={{ background: 'var(--esl-bg-section)' }}>
        {p.images?.[0] ? (
          <img
            src={p.images[0]}
            alt={p.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">{p.emoji || '📦'}</span>
        )}

        {/* Quick add overlay */}
        {onQuickAdd && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
            <button
              className="w-full bg-[#E8242C] text-white text-xs font-bold py-2.5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 hover:bg-[#CC0000] transition-colors shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(p);
              }}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Сагсанд нэмэх
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {p.store?.name && (
          <div className="text-[11px] font-medium mb-1 truncate" style={{ color: 'var(--esl-text-muted)' }}>{p.store.name}</div>
        )}
        <div className="text-sm font-bold mb-2 line-clamp-2 leading-snug group-hover:text-[#FF4D53] transition-colors" style={{ color: 'var(--esl-text-primary)' }}>
          {p.name}
        </div>

        {/* Rating */}
        {stars > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex gap-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-3 h-3 ${i < stars ? 'text-amber-400' : ''}`} style={i >= stars ? { color: 'var(--esl-border)' } : undefined} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[10px]" style={{ color: 'var(--esl-text-muted)' }}>({p.reviewCount || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-[#E8242C]">{formatPrice(px)}</span>
          {disc > 0 && (
            <span className="text-xs line-through" style={{ color: 'var(--esl-text-disabled)' }}>{formatPrice(p.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
