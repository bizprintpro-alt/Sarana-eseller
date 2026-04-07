'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  level: number;
  parentId: string | null;
  entityTypes: string[];
  children?: Category[];
}

const FALLBACK_ROOTS: Category[] = [
  { id: 'f1', slug: 'electronics', name: 'Электроник & Технологи', icon: '💻', level: 0, parentId: null, entityTypes: ['STORE','PRE_ORDER','DIGITAL'] },
  { id: 'f2', slug: 'fashion', name: 'Хувцас & Гутал', icon: '👗', level: 0, parentId: null, entityTypes: ['STORE','PRE_ORDER'] },
  { id: 'f3', slug: 'home-living', name: 'Гэр Ахуй & Тавилга', icon: '🏠', level: 0, parentId: null, entityTypes: ['STORE','PRE_ORDER'] },
  { id: 'f4', slug: 'beauty-health', name: 'Гоо Сайхан & Эрүүл Мэнд', icon: '💄', level: 0, parentId: null, entityTypes: ['STORE','PRE_ORDER'] },
  { id: 'f5', slug: 'kids-toys', name: 'Хүүхдийн Бараа & Тоглоом', icon: '🧸', level: 0, parentId: null, entityTypes: ['STORE','PRE_ORDER'] },
  { id: 'f6', slug: 'sports-travel', name: 'Спорт & Аялал', icon: '⚽', level: 0, parentId: null, entityTypes: ['STORE','PRE_ORDER'] },
  { id: 'f7', slug: 'food-beverage', name: 'Хол & Унд', icon: '🍔', level: 0, parentId: null, entityTypes: ['STORE','PRE_ORDER'] },
  { id: 'f8', slug: 'auto-moto', name: 'Авто & Мото', icon: '🚗', level: 0, parentId: null, entityTypes: ['STORE','AUTO'] },
  { id: 'f9', slug: 'construction', name: 'Барилга & Засвар', icon: '🔨', level: 0, parentId: null, entityTypes: ['STORE','CONSTRUCTION'] },
  { id: 'f10', slug: 'digital-goods', name: 'Дижитал Бараа', icon: '💾', level: 0, parentId: null, entityTypes: ['DIGITAL'] },
  { id: 'f11', slug: 'books-education', name: 'Ном & Боловсрол', icon: '📚', level: 0, parentId: null, entityTypes: ['STORE','DIGITAL'] },
  { id: 'f12', slug: 'other', name: 'Бусад', icon: '📦', level: 0, parentId: null, entityTypes: [] },
];

interface CategorySelectorProps {
  entityType?: string;
  value?: string;
  onChange: (categoryId: string, slug: string) => void;
  label?: string;
}

export default function CategorySelector({ entityType, value, onChange, label }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_ROOTS);
  const [flat, setFlat] = useState<Category[]>(FALLBACK_ROOTS);
  const [loading, setLoading] = useState(true);
  const [selectedRoot, setSelectedRoot] = useState('');
  const [selectedSub, setSelectedSub] = useState('');

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.categories?.length) setCategories(d.categories);
        if (d.flat?.length) setFlat(d.flat);
        // If value already set, find the root/sub
        if (value && d.flat) {
          const cat = d.flat.find((c: Category) => c.id === value);
          if (cat) {
            if (cat.level === 0) {
              setSelectedRoot(cat.id);
            } else if (cat.level === 1) {
              setSelectedRoot(cat.parentId || '');
              setSelectedSub(cat.id);
            } else if (cat.level === 2) {
              const parent = d.flat.find((c: Category) => c.id === cat.parentId);
              if (parent) {
                setSelectedRoot(parent.parentId || '');
                setSelectedSub(parent.id);
              }
            }
          }
        }
      })
      .finally(() => setLoading(false));
  }, [value]);

  // Filter roots by entityType
  const roots = entityType
    ? categories.filter((c) => c.entityTypes?.length === 0 || c.entityTypes?.some((et) => et === entityType))
    : categories;

  // Get subs for selected root
  const rootCat = categories.find((c) => c.id === selectedRoot);
  const subs = rootCat?.children || [];

  const handleRootChange = (rootId: string) => {
    setSelectedRoot(rootId);
    setSelectedSub('');
    const root = categories.find((c) => c.id === rootId);
    if (root) onChange(root.id, root.slug);
  };

  const handleSubChange = (subId: string) => {
    setSelectedSub(subId);
    const sub = flat.find((c) => c.id === subId);
    if (sub) onChange(sub.id, sub.slug);
  };

  if (loading) return <div className="text-xs text-[var(--esl-text-secondary)]">Ангилал ачааллаж байна...</div>;

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-[var(--esl-text)]">{label}</label>}

      {/* Root select */}
      <div className="relative">
        <select
          value={selectedRoot}
          onChange={(e) => handleRootChange(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)] appearance-none pr-8"
        >
          <option value="">Ангилал сонгох...</option>
          {roots.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--esl-text-disabled)] pointer-events-none" />
      </div>

      {/* Sub select */}
      {subs.length > 0 && (
        <div className="relative">
          <select
            value={selectedSub}
            onChange={(e) => handleSubChange(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)] appearance-none pr-8"
          >
            <option value="">Дэд ангилал сонгох...</option>
            {subs.map((c) => (
              <option key={c.id} value={c.id}>{c.icon || '·'} {c.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--esl-text-disabled)] pointer-events-none" />
        </div>
      )}
    </div>
  );
}
