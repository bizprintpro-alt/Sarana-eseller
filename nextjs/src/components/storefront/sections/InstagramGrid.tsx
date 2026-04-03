'use client';

import type { StorefrontTheme, Section } from '@/lib/types/storefront';
import { SPACING_MAP } from '@/lib/types/storefront';
import { DEMO_PRODUCTS } from '@/lib/utils';

export default function InstagramGrid({ section, theme }: { section: Section; theme: StorefrontTheme }) {
  const title = (section.content.title as string) || 'Галерей';
  const items = DEMO_PRODUCTS.slice(0, 6);

  return (
    <section className="py-16" style={{ background: theme.backgroundColor, padding: `${SPACING_MAP[theme.spacing]} 0` }}>
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ color: theme.textColor, fontFamily: 'var(--sf-font-display)' }}>
          {title}
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
          {items.map((p, i) => (
            <div key={i} className="aspect-square flex items-center justify-center text-4xl overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
              style={{ background: `${theme.primaryColor}08`, borderRadius: i === 0 || i === 5 ? '0' : '0' }}>
              {p.emoji}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
