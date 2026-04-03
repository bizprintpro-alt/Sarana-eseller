'use client';

import type { StorefrontHero, StorefrontTheme } from '@/lib/types/storefront';
import { RADIUS_MAP } from '@/lib/types/storefront';

export default function HeroFullscreen({ hero, theme }: { hero: StorefrontHero; theme: StorefrontTheme }) {
  const bgStyle: React.CSSProperties = hero.backgroundType === 'image'
    ? { backgroundImage: `url(${hero.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : hero.backgroundType === 'gradient'
    ? { background: hero.backgroundValue }
    : { background: hero.backgroundValue || theme.primaryColor };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden" style={bgStyle}>
      {hero.overlayOpacity > 0 && (
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${hero.overlayOpacity})` }} />
      )}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-5" style={{ fontFamily: 'var(--sf-font-display)' }}>
          {hero.headline}
        </h1>
        {hero.subheadline && (
          <p className="text-lg md:text-xl text-white/75 max-w-xl mx-auto mb-8 leading-relaxed" style={{ fontFamily: 'var(--sf-font-body)' }}>
            {hero.subheadline}
          </p>
        )}
        {hero.ctaText && (
          <a href={hero.ctaUrl || '#products'} className="inline-flex items-center px-8 py-4 text-base font-bold no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: theme.accentColor, color: '#fff', borderRadius: RADIUS_MAP[theme.borderRadius] }}>
            {hero.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
