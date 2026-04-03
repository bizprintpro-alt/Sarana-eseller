'use client';

import type { StorefrontConfig, Section, SectionType } from '@/lib/types/storefront';
import { RADIUS_MAP, SPACING_MAP } from '@/lib/types/storefront';
import HeroFullscreen from './sections/HeroFullscreen';
import HeroSplit from './sections/HeroSplit';
import HeroCentered from './sections/HeroCentered';
import FeaturedProducts from './sections/FeaturedProducts';
import AboutStory from './sections/AboutStory';
import CtaBanner from './sections/CtaBanner';
import Testimonials from './sections/Testimonials';
import InstagramGrid from './sections/InstagramGrid';

interface StorefrontRendererProps {
  config: StorefrontConfig;
}

function renderSection(section: Section, config: StorefrontConfig) {
  if (!section.visible) return null;

  const { theme, hero } = config;
  const key = section.id;

  switch (section.type) {
    case 'hero_fullscreen':
      return <HeroFullscreen key={key} hero={hero} theme={theme} />;
    case 'hero_split':
      return <HeroSplit key={key} hero={hero} theme={theme} />;
    case 'hero_centered':
      return <HeroCentered key={key} hero={hero} theme={theme} />;
    case 'featured_products':
      return <FeaturedProducts key={key} section={section} theme={theme} />;
    case 'about_story':
      return <AboutStory key={key} section={section} theme={theme} />;
    case 'cta_banner':
      return <CtaBanner key={key} section={section} theme={theme} />;
    case 'testimonials':
      return <Testimonials key={key} section={section} theme={theme} />;
    case 'instagram_grid':
      return <InstagramGrid key={key} section={section} theme={theme} />;
    default:
      return null;
  }
}

// Google Fonts URL for all supported fonts
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Space+Grotesk:wght@400;500;700&family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;700&family=Unbounded:wght@400;700;900&family=Lora:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap';

export default function StorefrontRenderer({ config }: StorefrontRendererProps) {
  const { theme, sections } = config;
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Load fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONT_URL} rel="stylesheet" />

      {/* Apply theme CSS variables */}
      <div
        style={{
          '--sf-primary': theme.primaryColor,
          '--sf-accent': theme.accentColor,
          '--sf-bg': theme.backgroundColor,
          '--sf-text': theme.textColor,
          '--sf-font-display': `'${theme.fontDisplay}', sans-serif`,
          '--sf-font-body': `'${theme.fontBody}', sans-serif`,
          '--sf-radius': RADIUS_MAP[theme.borderRadius],
          '--sf-spacing': SPACING_MAP[theme.spacing],
        } as React.CSSProperties}
        className="min-h-screen"
      >
        {/* Render all visible sections in order */}
        {sorted.map((section) => renderSection(section, config))}

        {/* Footer */}
        <footer className="py-8 text-center" style={{ background: theme.primaryColor, color: 'rgba(255,255,255,0.5)' }}>
          <p className="text-xs" style={{ fontFamily: 'var(--sf-font-body)' }}>
            Powered by <a href="https://eseller.mn" className="text-white/70 no-underline hover:text-white">eseller.mn</a>
          </p>
        </footer>
      </div>
    </>
  );
}
