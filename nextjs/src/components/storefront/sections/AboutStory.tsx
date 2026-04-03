'use client';

import type { StorefrontTheme, Section } from '@/lib/types/storefront';
import { SPACING_MAP } from '@/lib/types/storefront';

export default function AboutStory({ section, theme }: { section: Section; theme: StorefrontTheme }) {
  const title = (section.content.title as string) || 'Бидний тухай';
  const text = (section.content.text as string) || 'Бид чанартай бүтээгдэхүүн, мэргэжлийн үйлчилгээгээр хэрэглэгчдэдээ хүрдэг. Бидний зорилго бол таны итгэлийг хүлээж, хамгийн сайн туршлагыг өгөх юм.';

  return (
    <section className="py-16" style={{ background: theme.primaryColor + '08', padding: `${SPACING_MAP[theme.spacing]} 0` }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: theme.textColor, fontFamily: 'var(--sf-font-display)' }}>
          {title}
        </h2>
        <p className="text-base leading-relaxed" style={{ color: theme.textColor + 'BB', fontFamily: 'var(--sf-font-body)' }}>
          {text}
        </p>
      </div>
    </section>
  );
}
