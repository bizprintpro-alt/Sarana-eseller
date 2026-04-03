'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProductsAPI, Product } from '@/lib/api';
import { formatPrice, CATEGORIES, DEMO_PRODUCTS } from '@/lib/utils';
import { useToast } from '@/components/shared/Toast';
import StatCard from '@/components/dashboard/StatCard';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  salePrice: string;
  category: string;
  stock: string;
  commission: string;
  emoji: string;
  imageUrl: string;
}

const EMPTY_FORM: ProductForm = {
  name: '', description: '', price: '', salePrice: '', category: 'other',
  stock: '10', commission: '10', emoji: '📦', imageUrl: '',
};

const EMOJI_OPTIONS = ['📦', '👕', '👟', '🧢', '👜', '🍕', '🍔', '📱', '🎧', '💄', '✨', '🌿', '🧘', '⚽', '🎮', '📚', '🎁', '🧸'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await ProductsAPI.list();
      setProducts(res.products?.length ? res.products : DEMO_PRODUCTS as Product[]);
    } catch {
      setProducts(DEMO_PRODUCTS as Product[]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
  }, [products, search]);

  const stats = useMemo(() => ({
    total: products.length,
    lowStock: products.filter((p) => (p.stock || 0) < 5).length,
    totalValue: products.reduce((s, p) => s + (p.salePrice || p.price) * (p.stock || 0), 0),
  }), [products]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name, description: p.description || '', price: String(p.price),
      salePrice: p.salePrice ? String(p.salePrice) : '', category: p.category || 'other',
      stock: String(p.stock || 0), commission: String(p.commission || 10),
      emoji: p.emoji || '📦', imageUrl: p.images?.[0] || '',
    });
    setEditingId(p._id);
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      toast.show('Нэр, үнэ заавал бөглөнө үү', 'warn');
      return;
    }
    setSaving(true);
    const data: Partial<Product> = {
      name: form.name, description: form.description, price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      category: form.category, stock: Number(form.stock), commission: Number(form.commission),
      emoji: form.emoji, images: form.imageUrl ? [form.imageUrl] : [],
    };
    try {
      if (editingId) {
        const updated = await ProductsAPI.update(editingId, data);
        setProducts((prev) => prev.map((p) => (p._id === editingId ? { ...p, ...updated } : p)));
        toast.show('Бүтээгдэхүүн шинэчлэгдлээ', 'ok');
      } else {
        const created = await ProductsAPI.create(data);
        setProducts((prev) => [created, ...prev]);
        toast.show('Бүтээгдэхүүн нэмэгдлээ', 'ok');
      }
      setShowModal(false);
    } catch {
      // Fallback for demo
      if (editingId) {
        setProducts((prev) => prev.map((p) => (p._id === editingId ? { ...p, ...data } : p)));
        toast.show('Бүтээгдэхүүн шинэчлэгдлээ', 'ok');
      } else {
        const newP: Product = { _id: 'new_' + Date.now(), ...data } as Product;
        setProducts((prev) => [newP, ...prev]);
        toast.show('Бүтээгдэхүүн нэмэгдлээ', 'ok');
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Устгахдаа итгэлтэй байна уу?')) return;
    try {
      await ProductsAPI.delete(id);
    } catch { /* fallback */ }
    setProducts((prev) => prev.filter((p) => p._id !== id));
    toast.show('Бүтээгдэхүүн устгагдлаа', 'ok');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бүтээгдэхүүн</h1>
          <p className="text-gray-500 mt-1">Бүтээгдэхүүн нэмэх, засах, устгах</p>
        </div>
        <button onClick={openAdd} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm">
          + Шинэ бүтээгдэхүүн
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon="🛍️" label="Нийт бүтээгдэхүүн" value={stats.total} gradient="indigo" />
        <StatCard icon="⚠️" label="Бага нөөцтэй (<5)" value={stats.lowStock} gradient="amber" />
        <StatCard icon="💎" label="Нийт үнэ цэнэ" value={formatPrice(stats.totalValue)} gradient="green" />
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Бүтээгдэхүүн хайх..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-lg font-semibold text-gray-700">Бүтээгдэхүүн олдсонгүй</h3>
          <p className="text-gray-400 mt-1">Шинэ бүтээгдэхүүн нэмнэ үү</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-50 flex items-center justify-center text-5xl">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{p.emoji || '📦'}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{p.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {p.salePrice ? (
                    <>
                      <span className="text-sm font-bold text-indigo-600">{formatPrice(p.salePrice)}</span>
                      <span className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>📦 {p.stock ?? 0} ш</span>
                  <span>💰 {p.commission ?? 10}%</span>
                  {p.category && <span>{CATEGORIES[p.category] || p.category}</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    ✏️ Засах
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Бүтээгдэхүүн засах' : 'Шинэ бүтээгдэхүүн'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setForm({ ...form, emoji: e })}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${form.emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Нэр *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэ *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хямдралтай үнэ</label>
                  <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ангилал</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {Object.entries(CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Нөөц</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Шимтгэл %</label>
                  <input type="number" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Зурагны URL</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Хадгалж байна...' : editingId ? 'Шинэчлэх' : 'Нэмэх'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
