'use client';

import { useState, useEffect } from 'react';
import { Heart, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface WishProduct {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  images?: string[];
  emoji?: string;
  category?: string;
}

interface WishItem {
  id: string;
  productId: string;
  product: WishProduct;
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function WishlistPage() {
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    fetch(`${API}/api/wishlist`, { headers: headers() })
      .then(r => r.json())
      .then(res => { if (res.success) setItems(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const remove = async (productId: string) => {
    setRemoving(productId);
    try {
      const res = await fetch(`${API}/api/wishlist`, {
        method: 'DELETE',
        headers: headers(),
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setItems(prev => prev.filter(i => i.productId !== productId));
        showToast('Хүслийн жагсаалтаас хасагдлаа');
      }
    } catch {
      showToast('Алдаа гарлаа');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-[var(--brand,#E8242C)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">❤️ Хүслийн жагсаалт</h1>
        <p className="text-xs text-white/35 mt-0.5">{items.length} бараа</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Хадгалсан бараа байхгүй</p>
          <Link href="/store" className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-[var(--brand,#E8242C)] text-white text-sm font-bold no-underline hover:opacity-90 transition">
            Дэлгүүр үзэх
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => {
            const p = item.product;
            const img = p.images?.[0];
            const displayPrice = p.salePrice ?? p.price;
            const hasDiscount = p.salePrice && p.salePrice < p.price;

            return (
              <div key={item.id} className="relative bg-dash-card border border-dash-border rounded-xl overflow-hidden group">
                {/* Remove button */}
                <button
                  onClick={() => remove(item.productId)}
                  disabled={removing === item.productId}
                  className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 text-white/70 hover:text-[var(--brand,#E8242C)] hover:bg-black/80 border-none cursor-pointer transition"
                >
                  {removing === item.productId
                    ? <Loader2 size={13} className="animate-spin" />
                    : <X size={13} />}
                </button>

                <Link href={`/product/${p.id}`} className="no-underline">
                  {/* Image */}
                  <div className="h-32 bg-dash-elevated flex items-center justify-center">
                    {img
                      ? <img loading="lazy" src={img} alt={p.name} className="h-full w-full object-cover" />
                      : <span className="text-3xl">{p.emoji || '🛍️'}</span>}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-white truncate">{p.name}</h3>
                    {p.category && <p className="text-[10px] text-white/40 mt-0.5">{p.category}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-black text-[var(--brand,#E8242C)]">
                        {displayPrice.toLocaleString()}₮
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-white/30 line-through">
                          {p.price.toLocaleString()}₮
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-dash-card border border-dash-border px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg z-50 animate-[fadeIn_0.2s]">
          {toast}
        </div>
      )}
    </div>
  );
}
