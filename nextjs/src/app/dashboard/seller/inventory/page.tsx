'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';
import { ProductsAPI, Product } from '@/lib/api';
import { DEMO_PRODUCTS } from '@/lib/utils';

interface InventoryItem {
  product: Product;
  stock: number;
  minThreshold: number;
}

function getStockStatus(stock: number, min: number): { color: string; bg: string; label: string } {
  if (stock === 0) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Дууссан' };
  if (stock <= min) return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Бага' };
  return { color: 'text-green-600', bg: 'bg-green-50', label: 'Хангалттай' };
}

const THRESHOLD_KEY = 'eseller_inventory_thresholds';

function loadThresholds(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(THRESHOLD_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveThresholds(data: Record<string, number>) {
  localStorage.setItem(THRESHOLD_KEY, JSON.stringify(data));
}

const STOCK_KEY = 'eseller_inventory_stocks';

function loadStocks(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STOCK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStocks(data: Record<string, number>) {
  localStorage.setItem(STOCK_KEY, JSON.stringify(data));
}

export default function InventoryPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [thresholds, setThresholds] = useState<Record<string, number>>({});
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedThresholds = loadThresholds();
    const savedStocks = loadStocks();
    setThresholds(savedThresholds);
    setStocks(savedStocks);

    ProductsAPI.list()
      .then((res) => {
        const prods = res.products?.length ? res.products : (DEMO_PRODUCTS as Product[]);
        setProducts(prods);
        setLoading(false);
      })
      .catch(() => {
        setProducts(DEMO_PRODUCTS as Product[]);
        setLoading(false);
      });
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  function getStock(productId: string, defaultStock?: number): number {
    if (stocks[productId] !== undefined) return stocks[productId];
    return defaultStock ?? Math.floor(Math.random() * 50);
  }

  function getThreshold(productId: string): number {
    return thresholds[productId] ?? 5;
  }

  const inventory: InventoryItem[] = products.map((p) => ({
    product: p,
    stock: getStock(p._id, p.stock),
    minThreshold: getThreshold(p._id),
  }));

  const filtered = inventory.filter((item) => {
    if (filter === 'low') return item.stock > 0 && item.stock <= item.minThreshold;
    if (filter === 'out') return item.stock === 0;
    return true;
  });

  const totalProducts = inventory.length;
  const lowStock = inventory.filter((i) => i.stock > 0 && i.stock <= i.minThreshold).length;
  const outOfStock = inventory.filter((i) => i.stock === 0).length;

  function handleStockEdit(productId: string, currentStock: number) {
    setEditingStock(productId);
    setEditValue(currentStock.toString());
  }

  function handleStockSave(productId: string) {
    const newVal = parseInt(editValue);
    if (isNaN(newVal) || newVal < 0) {
      toast.show('Тоо буруу байна', 'warn');
      return;
    }
    const updated = { ...stocks, [productId]: newVal };
    setStocks(updated);
    saveStocks(updated);
    setEditingStock(null);
    toast.show('Нөөц шинэчлэгдлээ', 'ok');
  }

  function handleThresholdChange(productId: string, value: number) {
    const updated = { ...thresholds, [productId]: value };
    setThresholds(updated);
    saveThresholds(updated);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Нөөцийн удирдлага</h1>
            <p className="text-gray-500 text-sm">Барааны нөөц, агуулахын байдлыг хянах</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <span className="text-lg">📦</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Нийт бараа</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Нөөц бага</p>
              <p className="text-2xl font-bold text-amber-600">{lowStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <span className="text-lg">🚫</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Дууссан</p>
              <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 mr-2">Шүүлтүүр:</span>
          {([
            { id: 'all' as const, label: 'Бүгд', count: totalProducts },
            { id: 'low' as const, label: 'Нөөц бага', count: lowStock },
            { id: 'out' as const, label: 'Дууссан', count: outOfStock },
          ]).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl block mb-3">✅</span>
            <p className="text-gray-500">Энэ шүүлтүүрт тохирох бараа байхгүй</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-600">Бараа</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Нөөц</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Доод хязгаар</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Төлөв</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const status = getStockStatus(item.stock, item.minThreshold);
                  const isEditing = editingStock === item.product._id;

                  return (
                    <tr key={item.product._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                            {item.product.emoji || '📦'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-xs text-gray-500">{item.product.category || 'Ангилалгүй'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleStockSave(item.product._id);
                                if (e.key === 'Escape') setEditingStock(null);
                              }}
                            />
                            <button
                              onClick={() => handleStockSave(item.product._id)}
                              className="text-green-600 hover:bg-green-50 px-2 py-1 rounded text-xs font-medium"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingStock(null)}
                              className="text-gray-400 hover:bg-gray-100 px-2 py-1 rounded text-xs"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStockEdit(item.product._id, item.stock)}
                            className="font-semibold text-gray-900 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg transition"
                            title="Дарж засах"
                          >
                            {item.stock}
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="number"
                          value={item.minThreshold}
                          onChange={(e) => handleThresholdChange(item.product._id, parseInt(e.target.value) || 0)}
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                          min={0}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
