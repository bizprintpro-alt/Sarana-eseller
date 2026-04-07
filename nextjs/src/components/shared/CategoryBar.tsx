'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
}

interface CategoryBarProps {
  value: string;
  onChange: (slug: string) => void;
  entityType?: string;
}

export default function CategoryBar({ value, onChange, entityType }: CategoryBarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
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
        setCategories(roots);
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
