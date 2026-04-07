'use client';

import { useState, useEffect } from 'react';
import { Search, Zap, Share2, Check, Star } from 'lucide-react';
import { ProductsAPI, type Product } from '@/lib/api';
import { formatPrice, DEMO_PRODUCTS, cn } from '@/lib/utils';
import StartSellingModal from '@/components/seller/StartSellingModal';

export default function AffiliateProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sellingItem, setSellingItem] = useState<Product | null>(null);

  useEffect(() => {
    ProductsAPI.list()
      .then((d) => {
        if (d.products?.length) setProducts(d.products);
        else setProducts(DEMO_PRODUCTS as unknown as Product[]);
      })
      .catch(() => setProducts(DEMO_PRODUCTS as unknown as Product[]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const copyLink = (p: Product) => {
    const url = `https://sarana-eseller.vercel.app/store?ref=${p._id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(p._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--esl-text)]">Бараа сонгох</h1>
        <span className="text-sm text-[var(--esl-text-secondary)]">{filtered.length} бараа</span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--esl-text-disabled)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Бүтээгдэхүүн хайх..."
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-xl text-sm text-[var(--esl-text)]"
        />
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="text-center py-16 text-[var(--esl-text-secondary)]">Ачааллаж байна...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--esl-text-secondary)]">Бараа олдсонгүй</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const disc = p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
            const px = p.salePrice || p.price;
            return (
              <div key={p._id} className="bg-[var(--esl-bg-section)] rounded-xl border border-[var(--esl-border)] overflow-hidden group">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-[var(--esl-bg-page)] overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">{p.emoji || '📦'}</div>
                  )}
                  {disc > 0 && (
                    <span className="absolute top-2 left-2 bg-[#E8242C] text-white text-[10px] font-bold px-2 py-0.5 rounded">-{disc}%</span>
                  )}
                  {p.allowAffiliate && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {p.commission || 10}% шимтгэл
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-[var(--esl-text)] line-clamp-2 mb-1">{p.name}</p>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-base font-bold text-[#E8242C]">{formatPrice(px)}</span>
                    {disc > 0 && <span className="text-xs text-[var(--esl-text-disabled)] line-through">{formatPrice(p.price)}</span>}
                  </div>
                  {p.rating && (
                    <div className="flex items-center gap-1 text-xs text-[var(--esl-text-secondary)] mb-2">
                      <Star size={10} className="text-yellow-500 fill-yellow-500" /> {p.rating}
                      {p.store?.name && <span>· {p.store.name}</span>}
                    </div>
                  )}

                  {/* Action buttons */}
                  <button
                    onClick={() => copyLink(p)}
                    className={cn(
                      'w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border-none cursor-pointer transition',
                      copiedId === p._id
                        ? 'bg-green-100 text-green-700'
                        : 'bg-[#E8242C] text-white hover:bg-red-700'
                    )}
                  >
                    {copiedId === p._id ? <><Check size={12} /> Хуулагдлаа!</> : <><Share2 size={12} /> Борлуулж эхлэх</>}
                  </button>

                  <button
                    onClick={() => setSellingItem(p)}
                    className="w-full mt-1.5 py-2 rounded-lg text-xs font-bold border border-[#E8242C] text-[#E8242C] bg-transparent hover:bg-red-50 flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    <Zap size={12} /> Дэлгүүрт нэмэх
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* StartSellingModal */}
      <StartSellingModal
        item={sellingItem ? {
          id: sellingItem._id || '',
          name: sellingItem.name,
          price: sellingItem.price,
          images: sellingItem.images || [],
          affiliateCommission: sellingItem.commission || 10,
        } : null}
        isOpen={!!sellingItem}
        onClose={() => setSellingItem(null)}
      />
    </div>
  );
}
