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

interface CategorySelectorProps {
  entityType?: string;
  value?: string;
  onChange: (categoryId: string, slug: string) => void;
  label?: string;
}

export default function CategorySelector({ entityType, value, onChange, label }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flat, setFlat] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoot, setSelectedRoot] = useState('');
  const [selectedSub, setSelectedSub] = useState('');

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories || []);
        setFlat(d.flat || []);
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
