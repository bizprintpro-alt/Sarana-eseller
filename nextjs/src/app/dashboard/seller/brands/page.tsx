'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';
import { checkLimit, getCurrentPlan } from '@/lib/subscription';

interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  website: string;
}

const STORAGE_KEY = 'eseller_brands';

function loadBrands(): Brand[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBrands(brands: Brand[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
}

export default function BrandsPage() {
  const toast = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBrands(loadBrands());
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const plan = getCurrentPlan();

  function openAddModal() {
    const check = checkLimit('maxBrands', brands.length);
    if (!check.allowed) {
      toast.show(check.message || 'Хязгаарт хүрлээ', 'error');
      return;
    }
    setEditingId(null);
    setName('');
    setLogoUrl('');
    setDescription('');
    setWebsite('');
    setShowModal(true);
  }

  function openEditModal(brand: Brand) {
    setEditingId(brand.id);
    setName(brand.name);
    setLogoUrl(brand.logoUrl);
    setDescription(brand.description);
    setWebsite(brand.website);
    setShowModal(true);
  }

  function handleSave() {
    if (!name.trim()) {
      toast.show('Брэндийн нэр оруулна уу', 'warn');
      return;
    }

    let updated: Brand[];
    if (editingId) {
      updated = brands.map((b) =>
        b.id === editingId ? { ...b, name, logoUrl, description, website } : b
      );
      toast.show('Брэнд шинэчлэгдлээ', 'ok');
    } else {
      const newBrand: Brand = {
        id: Date.now().toString(),
        name,
        logoUrl,
        description,
        website,
      };
      updated = [...brands, newBrand];
      toast.show('Брэнд нэмэгдлээ', 'ok');
    }

    setBrands(updated);
    saveBrands(updated);
    setShowModal(false);
  }

  function handleDelete(id: string) {
    const updated = brands.filter((b) => b.id !== id);
    setBrands(updated);
    saveBrands(updated);
    toast.show('Брэнд устгагдлаа', 'ok');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏷️</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Брэнд удирдлага</h1>
              <p className="text-gray-500 text-sm">Брэндүүдийг удирдах ({brands.length}/{plan.limits.maxBrands === -1 ? '∞' : plan.limits.maxBrands})</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition flex items-center gap-2"
          >
            + Брэнд нэмэх
          </button>
        </div>
      </div>

      {/* Brand Grid */}
      {brands.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <span className="text-5xl block mb-4">🏷️</span>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Брэнд байхгүй</h2>
          <p className="text-gray-500 text-sm mb-4">Эхний брэндээ нэмнэ үү</p>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
          >
            + Брэнд нэмэх
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
              {/* Logo area */}
              <div className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="max-h-20 max-w-[80%] object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-4xl font-black text-gray-300">${brand.name[0]}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-4xl font-black text-gray-300">
                    {brand.name[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{brand.name}</h3>
                {brand.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{brand.description}</p>
                )}
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline mt-2 block truncate"
                  >
                    {brand.website}
                  </a>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(brand)}
                    className="flex-1 text-indigo-600 hover:bg-indigo-50 py-1.5 rounded-lg text-sm font-medium transition text-center"
                  >
                    Засах
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="flex-1 text-red-500 hover:bg-red-50 py-1.5 rounded-lg text-sm font-medium transition text-center"
                  >
                    Устгах
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Брэнд засах' : 'Шинэ брэнд'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Брэндийн нэр"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Лого URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                {logoUrl && (
                  <div className="mt-2 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                    <img src={logoUrl} alt="Preview" className="max-h-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Брэндийн тайлбар"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Вэбсайт</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
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
