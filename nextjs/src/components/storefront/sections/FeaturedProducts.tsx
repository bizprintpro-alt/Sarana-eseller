'use client';

import type { StorefrontTheme, Section } from '@/lib/types/storefront';
import { RADIUS_MAP, SPACING_MAP } from '@/lib/types/storefront';
import { DEMO_PRODUCTS } from '@/lib/utils';

export default function FeaturedProducts({ section, theme }: { section: Section; theme: StorefrontTheme }) {
  const title = (section.content.title as string) || 'Онцлох бүтээгдэхүүн';
  const count = (section.content.count as number) || 6;
  const products = DEMO_PRODUCTS.slice(0, count);

  return (
    <section id="products" className="py-16" style={{ background: theme.backgroundColor, padding: `${SPACING_MAP[theme.spacing]} 0` }}>
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ color: theme.textColor, fontFamily: 'var(--sf-font-display)' }}>
          {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p._id} className="group overflow-hidden transition-shadow hover:shadow-lg" style={{ background: '#fff', borderRadius: RADIUS_MAP[theme.borderRadius], border: `1px solid ${theme.textColor}10` }}>
              <div className="h-44 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform" style={{ background: theme.backgroundColor }}>
                {p.emoji}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold truncate" style={{ color: theme.textColor }}>{p.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-extrabold" style={{ color: theme.accentColor }}>
                    {(p.salePrice || p.price).toLocaleString()}₮
                  </span>
                  {p.salePrice && <span className="text-xs line-through" style={{ color: theme.textColor + '60' }}>{p.price.toLocaleString()}₮</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
