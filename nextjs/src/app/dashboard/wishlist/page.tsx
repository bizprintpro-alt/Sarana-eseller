'use client';

import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

interface WishItem { id: string; name: string; price: number; image: string; category: string }

export default function WishlistPage() {
  const [items, setItems] = useState<WishItem[]>([]);

  useEffect(() => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem('eseller_wishlist');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  const remove = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('eseller_wishlist', JSON.stringify(updated));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">❤️ Хүслийн жагсаалт</h1>
        <p className="text-xs text-white/35 mt-0.5">{items.length} бараа</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Хүслийн жагсаалт хоосон байна</p>
          <p className="text-white/20 text-xs mt-1">Дэлгүүрээс бараа сонгож зүрхэн дээр дарна уу</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-dash-card border border-dash-border rounded-xl overflow-hidden">
              <div className="h-32 bg-dash-elevated flex items-center justify-center">
                {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <span className="text-3xl">🛍️</span>}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                <p className="text-xs text-white/40 mb-2">{item.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-brand">{item.price.toLocaleString()}₮</span>
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded-lg bg-dash-accent/10 text-dash-accent cursor-pointer border-none"><ShoppingCart size={14} /></button>
                    <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 cursor-pointer border-none"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
