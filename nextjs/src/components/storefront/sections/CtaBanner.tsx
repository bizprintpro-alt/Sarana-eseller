'use client';

import type { StorefrontTheme, Section } from '@/lib/types/storefront';
import { RADIUS_MAP } from '@/lib/types/storefront';

export default function CtaBanner({ section, theme }: { section: Section; theme: StorefrontTheme }) {
  const headline = (section.content.headline as string) || 'Бидэнтэй нэгд';
  const text = (section.content.text as string) || '';
  const buttonText = (section.content.buttonText as string) || 'Бүртгүүлэх';

  return (
    <section className="py-16" style={{ background: theme.primaryColor }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--sf-font-display)' }}>
          {headline}
        </h2>
        {text && <p className="text-base text-white/70 mb-6" style={{ fontFamily: 'var(--sf-font-body)' }}>{text}</p>}
        <button className="px-8 py-3.5 text-sm font-bold border-none cursor-pointer transition-all hover:-translate-y-0.5"
          style={{ background: theme.accentColor, color: '#fff', borderRadius: RADIUS_MAP[theme.borderRadius] }}>
          {buttonText}
        </button>
      </div>
    </section>
  );
}
