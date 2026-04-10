'use client';
import Link from 'next/link';

export default function PromoSection({ products }: { products: any[] }) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-[1200px] mx-auto px-4 pb-10">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[var(--esl-text)] text-xl font-bold">
          Хямдралтай бараа
        </h2>
        <Link href="/store?sale=true" className="text-[#E8242C] text-sm font-semibold no-underline">
          Бүгд →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((p) => (
          <Link key={p.id} href={`/product/${p.id}`} className="no-underline">
            <div className="bg-[var(--esl-bg-card)] rounded-2xl overflow-hidden border border-[var(--esl-border)] min-w-[180px] max-w-[200px] hover:-translate-y-1 transition-transform">
              <div className="aspect-square bg-[var(--esl-bg-section)] overflow-hidden relative">
                {p.media?.[0]?.url ? (
                  <img src={p.media[0].url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[36px]">🛍</div>
                )}
                <div className="absolute top-2 right-2 bg-[#E8242C] text-white text-[11px] px-2 py-0.5 rounded-md font-bold">
                  SALE
                </div>
              </div>
              <div className="p-3">
                <p className="text-[var(--esl-text)] text-[13px] font-medium line-clamp-2 mb-2">{p.name}</p>
                <span className="text-[#E8242C] font-extrabold text-[15px]">
                  {p.price?.toLocaleString()}₮
                </span>
                {p.entity && (
                  <p className="text-[var(--esl-text-muted)] text-[11px] mt-1">{p.entity.name}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
