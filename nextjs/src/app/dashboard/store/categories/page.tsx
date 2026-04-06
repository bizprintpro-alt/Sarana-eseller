'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';
import { checkLimit, getCurrentPlan } from '@/lib/subscription';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  parentId: string | null;
  order: number;
}

const EMOJI_OPTIONS = ['📦', '👗', '🍔', '📱', '💄', '🏡', '⚽', '🎮', '📚', '🎵', '🧸', '🛒', '💍', '🧴', '🎒', '🔧', '🌿', '🧁'];

const STORAGE_KEY = 'eseller_categories';

function loadCategories(): Category[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCategories(cats: Category[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCategories(loadCategories());
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--esl-bg-section)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const plan = getCurrentPlan();
  const parentCategories = categories.filter((c) => !c.parentId);

  function openAddModal() {
    const check = checkLimit('maxCategories', categories.length);
    if (!check.allowed) {
      toast.show(check.message || 'Хязгаарт хүрлээ', 'error');
      return;
    }
    setEditingId(null);
    setName('');
    setIcon('📦');
    setDescription('');
    setParentId(null);
    setShowModal(true);
  }

  function openEditModal(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setIcon(cat.icon);
    setDescription(cat.description);
    setParentId(cat.parentId);
    setShowModal(true);
  }

  function handleSave() {
    if (!name.trim()) {
      toast.show('Ангилалын нэр оруулна уу', 'warn');
      return;
    }

    let updated: Category[];
    if (editingId) {
      updated = categories.map((c) =>
        c.id === editingId ? { ...c, name, icon, description, parentId } : c
      );
      toast.show('Ангилал шинэчлэгдлээ', 'ok');
    } else {
      const newCat: Category = {
        id: Date.now().toString(),
        name,
        icon,
        description,
        parentId,
        order: categories.length + 1,
      };
      updated = [...categories, newCat];
      toast.show('Ангилал нэмэгдлээ', 'ok');
    }

    setCategories(updated);
    saveCategories(updated);
    setShowModal(false);
  }

  function handleDelete(id: string) {
    // Also delete children
    const updated = categories.filter((c) => c.id !== id && c.parentId !== id);
    setCategories(updated);
    saveCategories(updated);
    toast.show('Ангилал устгагдлаа', 'ok');
  }

  function handleReorder(id: string, direction: 'up' | 'down') {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const updated = [...categories];
    const temp = updated[idx].order;
    updated[idx] = { ...updated[idx], order: updated[swapIdx].order };
    updated[swapIdx] = { ...updated[swapIdx], order: temp };
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setCategories(updated);
    saveCategories(updated);
  }

  function getChildren(parentId: string) {
    return categories.filter((c) => c.parentId === parentId);
  }

  return (
    <div className="min-h-screen bg-[var(--esl-bg-section)] p-4 md:p-6">
      {/* Header */}
      <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗂️</span>
            <div>
              <h1 className="text-2xl font-bold text-[var(--esl-text-primary)]">Ангилал удирдлага</h1>
              <p className="text-[var(--esl-text-secondary)] text-sm">Барааны ангилалуудыг удирдах ({categories.length}/{plan.limits.maxCategories === -1 ? '∞' : plan.limits.maxCategories})</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition flex items-center gap-2"
          >
            + Ангилал нэмэх
          </button>
        </div>
      </div>

      {/* Categories list */}
      {categories.length === 0 ? (
        <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] p-12 text-center">
          <span className="text-5xl block mb-4">🗂️</span>
          <h2 className="text-lg font-bold text-[var(--esl-text-primary)] mb-2">Ангилал байхгүй</h2>
          <p className="text-[var(--esl-text-secondary)] text-sm mb-4">Эхний ангилалаа нэмнэ үү</p>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
          >
            + Ангилал нэмэх
          </button>
        </div>
      ) : (
        <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] overflow-hidden">
          <div className="divide-y divide-gray-100">
            {parentCategories.map((cat, idx) => (
              <div key={cat.id}>
                {/* Parent */}
                <div className="flex items-center gap-4 p-4 hover:bg-[var(--esl-bg-section)] transition">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleReorder(cat.id, 'up')}
                      disabled={idx === 0}
                      className="text-[var(--esl-text-muted)] hover:text-[var(--esl-text-secondary)] disabled:opacity-30 text-xs"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleReorder(cat.id, 'down')}
                      disabled={idx === parentCategories.length - 1}
                      className="text-[var(--esl-text-muted)] hover:text-[var(--esl-text-secondary)] disabled:opacity-30 text-xs"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="text-xs text-[var(--esl-text-muted)] w-6 text-center font-mono">{cat.order}</span>
                  <div className="w-10 h-10 bg-[var(--esl-bg-section)] rounded-lg flex items-center justify-center text-xl">
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--esl-text-primary)]">{cat.name}</p>
                    {cat.description && <p className="text-xs text-[var(--esl-text-secondary)] truncate">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                    >
                      Засах
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                    >
                      Устгах
                    </button>
                  </div>
                </div>
                {/* Children */}
                {getChildren(cat.id).map((child) => (
                  <div key={child.id} className="flex items-center gap-4 p-4 pl-16 bg-[var(--esl-bg-section)]/50 hover:bg-[var(--esl-bg-section)] transition border-t border-gray-50">
                    <span className="text-[var(--esl-text-muted)]">└</span>
                    <span className="text-xs text-[var(--esl-text-muted)] w-6 text-center font-mono">{child.order}</span>
                    <div className="w-8 h-8 bg-[var(--esl-bg-card)] rounded-lg flex items-center justify-center text-lg border border-[var(--esl-border)]">
                      {child.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--esl-text-primary)] text-sm">{child.name}</p>
                      {child.description && <p className="text-xs text-[var(--esl-text-secondary)] truncate">{child.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(child)}
                        className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        Засах
                      </button>
                      <button
                        onClick={() => handleDelete(child.id)}
                        className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        Устгах
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {/* Orphan categories (parentId set but parent deleted) */}
            {categories
              .filter((c) => c.parentId && !categories.find((p) => p.id === c.parentId))
              .map((cat) => (
                <div key={cat.id} className="flex items-center gap-4 p-4 hover:bg-[var(--esl-bg-section)] transition">
                  <div className="w-6" />
                  <span className="text-xs text-[var(--esl-text-muted)] w-6 text-center font-mono">{cat.order}</span>
                  <div className="w-10 h-10 bg-[var(--esl-bg-section)] rounded-lg flex items-center justify-center text-xl">
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--esl-text-primary)]">{cat.name}</p>
                    {cat.description && <p className="text-xs text-[var(--esl-text-secondary)] truncate">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(cat)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium transition">Засах</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition">Устгах</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--esl-bg-card)] rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-[var(--esl-border)]">
              <h2 className="text-lg font-bold text-[var(--esl-text-primary)]">
                {editingId ? 'Ангилал засах' : 'Шинэ ангилал'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Нэр</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ангилалын нэр"
                  className="w-full border border-[var(--esl-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--esl-text-primary)] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-2">Дүрс тэмдэг</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setIcon(e)}
                      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                        icon === e ? 'border-indigo-500 bg-indigo-50 scale-110' : 'border-[var(--esl-border)] hover:border-[var(--esl-border-strong)]'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Эцэг ангилал (сонголтоор)</label>
                <select
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value || null)}
                  className="w-full border border-[var(--esl-border)] rounded-lg px-3 py-2.5 text-sm bg-[var(--esl-bg-card)] text-[var(--esl-text-primary)] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">-- Эцэг ангилалгүй --</option>
                  {parentCategories
                    .filter((c) => c.id !== editingId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Тайлбар</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Товч тайлбар (сонголтоор)"
                  className="w-full border border-[var(--esl-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--esl-text-primary)] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[var(--esl-border)] flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-[var(--esl-border)] text-[var(--esl-text-primary)] py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--esl-bg-section)] transition"
              >
                Болих
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
              >
                {editingId ? 'Хадгалах' : 'Нэмэх'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
