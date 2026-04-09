'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Phone, MapPin, Star, Calendar, Gauge, Fuel, Settings2,
  Tag, Clock, Timer, Building2, Ruler,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveEntityType, ENTITY_CARD_CONFIG, formatPrice as entityFormatPrice } from '@/lib/cards/entityCardConfig';
import MediaCarousel, { type MediaItem } from './MediaCarousel';
import ShareWishlistBar from './ShareWishlistBar';
import StartSellingButton from './StartSellingButton';

interface FeedPost {
  _id: string;
  title: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  images: string[];
  entityType: string;
  metadata?: Record<string, any>;
  district?: string;
  province?: string;
  allowAffiliate?: boolean;
  affiliateCommission?: number;
  media: MediaItem[];
  owner?: { name: string; phone?: string } | null;
  createdAt?: string;
}

export default function FeedDetailClient({ post }: { post: FeedPost }) {
  const router = useRouter();
  const et = resolveEntityType(post.entityType);
  const config = ENTITY_CARD_CONFIG[et];
  const meta = post.metadata || {};

  // Merge images into media if media is empty
  const media: MediaItem[] = post.media.length > 0
    ? post.media
    : post.images.map((url, i) => ({ type: 'IMAGE' as const, url, sortOrder: i }));

  return (
    <div className="min-h-screen bg-[var(--esl-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[var(--esl-bg)]/80 backdrop-blur-xl border-b border-[var(--esl-border)]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-[var(--esl-bg-card)] border border-[var(--esl-border)] flex items-center justify-center hover:bg-[var(--esl-bg-muted)] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{post.title}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: config.color }}>{config.badge}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Media */}
        <MediaCarousel
          media={media}
          layout={et === 'REAL_ESTATE' || et === 'CONSTRUCTION' ? 'grid' : 'carousel'}
        />

        {/* Title + Price */}
        <div>
          <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>
          {post.price && (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-black" style={{ color: config.color }}>{entityFormatPrice(post.price)}</span>
              {post.originalPrice && post.originalPrice > post.price && (
                <span className="text-base text-[var(--esl-text-muted)] line-through">{entityFormatPrice(post.originalPrice)}</span>
              )}
            </div>
          )}
        </div>

        {/* Entity-specific fields */}
        <EntityFields et={et} meta={meta} post={post} />

        {/* Description */}
        {post.description && (
          <p className="text-sm text-[var(--esl-text-muted)] leading-relaxed">{post.description}</p>
        )}

        {/* Owner */}
        {post.owner && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--esl-bg-card)] border border-[var(--esl-border)]">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ background: config.color }}>
              {post.owner.name?.[0] || '?'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{post.owner.name}</p>
              <p className="text-xs text-[var(--esl-text-muted)]">Зарын эзэн</p>
            </div>
            {post.owner.phone && (
              <a href={`tel:${post.owner.phone}`} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: config.color }}>
                <Phone size={18} />
              </a>
            )}
          </div>
        )}

        {/* CTA */}
        <button className="w-full h-12 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2" style={{ background: config.color }}>
          <Phone size={18} /> {config.primaryCta}
        </button>

        {/* Share + Wishlist */}
        <ShareWishlistBar title={post.title} />

        {/* Affiliate */}
        {post.allowAffiliate && (
          <StartSellingButton productId={post._id} productName={post.title} commission={post.affiliateCommission} />
        )}
      </div>
    </div>
  );
}

function EntityFields({ et, meta, post }: { et: string; meta: Record<string, any>; post: FeedPost }) {
  const pills: { icon: React.ReactNode; value: string }[] = [];

  if (et === 'REAL_ESTATE') {
    if (meta.sqm || meta.area) pills.push({ icon: <Ruler size={14} />, value: `${meta.sqm || meta.area}м²` });
    if (meta.rooms) pills.push({ icon: '🛏', value: `${meta.rooms} өрөө` });
    if (meta.floor) pills.push({ icon: <Building2 size={14} />, value: `${meta.floor}-р давхар` });
    if (post.district) pills.push({ icon: <MapPin size={14} />, value: post.district });
  } else if (et === 'AUTO') {
    if (meta.year) pills.push({ icon: <Calendar size={14} />, value: `${meta.year}` });
    if (meta.mileage) pills.push({ icon: <Gauge size={14} />, value: `${(meta.mileage/1000).toFixed(0)}мян км` });
    if (meta.fuelType) pills.push({ icon: <Fuel size={14} />, value: meta.fuelType });
    if (meta.transmission) pills.push({ icon: <Settings2 size={14} />, value: meta.transmission });
    if (meta.brand) pills.push({ icon: <Tag size={14} />, value: meta.brand });
  } else if (et === 'SERVICE') {
    if (meta.duration) pills.push({ icon: <Timer size={14} />, value: `${meta.duration} мин` });
    if (meta.rating) pills.push({ icon: <Star size={14} className="text-amber-400" />, value: `${meta.rating}` });
    if (post.district) pills.push({ icon: <MapPin size={14} />, value: post.district });
  } else if (et === 'CONSTRUCTION') {
    if (meta.pricePerSqm) pills.push({ icon: <Ruler size={14} />, value: `${Number(meta.pricePerSqm).toLocaleString()}₮/м²` });
    if (meta.completionDate) pills.push({ icon: <Clock size={14} />, value: meta.completionDate });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((p, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--esl-bg-card)] border border-[var(--esl-border)] text-xs font-medium">
          {p.icon} {p.value}
        </span>
      ))}
    </div>
  );
}
