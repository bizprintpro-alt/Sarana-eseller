'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'f1', slug: 'electronics', name: 'Электроник', icon: '💻' },
  { id: 'f2', slug: 'fashion', name: 'Хувцас', icon: '👗' },
  { id: 'f3', slug: 'home-living', name: 'Гэр Ахуй', icon: '🏠' },
  { id: 'f4', slug: 'beauty-health', name: 'Гоо сайхан', icon: '💄' },
  { id: 'f5', slug: 'kids-toys', name: 'Хүүхдийн', icon: '🧸' },
  { id: 'f6', slug: 'sports-travel', name: 'Спорт', icon: '⚽' },
  { id: 'f7', slug: 'food-beverage', name: 'Хоол', icon: '🍔' },
  { id: 'f8', slug: 'auto-moto', name: 'Авто', icon: '🚗' },
  { id: 'f9', slug: 'construction', name: 'Барилга', icon: '🔨' },
  { id: 'f10', slug: 'digital-goods', name: 'Дижитал', icon: '💾' },
  { id: 'f11', slug: 'books-education', name: 'Ном', icon: '📚' },
  { id: 'f12', slug: 'jewelry-gifts', name: 'Зоос', icon: '💍' },
  { id: 'f13', slug: 'pets', name: 'Амьтан', icon: '🐾' },
  { id: 'f14', slug: 'arts-music', name: 'Урлаг', icon: '🎵' },
  { id: 'f15', slug: 'agriculture', name: 'Хөдөө', icon: '🌾' },
  { id: 'f16', slug: 'office-business', name: 'Оффис', icon: '💼' },
];

interface CategoryBarProps {
  value: string;
  onChange: (slug: string) => void;
  entityType?: string;
}

export default function CategoryBar({ value, onChange, entityType }: CategoryBarProps) {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => {
        let roots = (d.flat || []).filter((c: Category & { level: number; entityTypes: string[] }) => c.level === 0);
        if (entityType) {
          roots = roots.filter((c: Category & { entityTypes: string[] }) =>
            !c.entityTypes?.length || c.entityTypes.includes(entityType)
          );
        }
        if (roots.length > 0) setCategories(roots);
      })
      .catch(() => {});
  }, [entityType]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  if (categories.length === 0) return null;

  return (
    <div className="relative flex items-center gap-1">
      <button
        onClick={() => scroll('left')}
        className="shrink-0 p-1 rounded-full hover:bg-[var(--esl-bg-hover)] text-[var(--esl-text-disabled)]"
      >
        <ChevronLeft size={16} />
      </button>

      <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 px-1">
        <button
          onClick={() => onChange('all')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
            value === 'all'
              ? 'bg-[#E8242C] text-white'
              : 'bg-[var(--esl-bg-section)] text-[var(--esl-text-secondary)] border border-[var(--esl-border)] hover:border-[#E8242C]'
          }`}
        >
          Бүгд
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.slug)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
              value === cat.slug
                ? 'bg-[#E8242C] text-white'
                : 'bg-[var(--esl-bg-section)] text-[var(--esl-text-secondary)] border border-[var(--esl-border)] hover:border-[#E8242C]'
            }`}
          >
            {cat.icon} {cat.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="shrink-0 p-1 rounded-full hover:bg-[var(--esl-bg-hover)] text-[var(--esl-text-disabled)]"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
