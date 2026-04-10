'use client';
import Link from 'next/link';

export default function GoldPromoBanner() {
  return (
    <section className="max-w-[1200px] mx-auto px-4 pb-10">
      <div className="rounded-[20px] p-8 md:p-10 flex items-center justify-between flex-wrap gap-5 border border-[rgba(249,168,37,0.2)]"
        style={{ background: 'linear-gradient(135deg, #1A1100 0%, #2D1F00 50%, #1A1100 100%)' }}>
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[32px]">👑</span>
            <span className="text-[#F9A825] text-[22px] font-black tracking-[2px]">GOLD</span>
          </div>
          <h3 className="text-white text-xl font-bold mb-1.5">
            Gold гишүүн болж 200,000₮+ хэмнэнэ
          </h3>
          <p className="text-white/60 text-sm">
            Үнэгүй хүргэлт · 5% нэмэлт хямдрал · 2x оноо · VIP дэмжлэг
          </p>
        </div>
        <Link href="/gold" className="bg-[#F9A825] text-black px-7 py-3.5 rounded-xl no-underline font-extrabold text-[15px] whitespace-nowrap hover:bg-[#e6991f] transition-colors">
          30 хоног үнэгүй турших →
        </Link>
      </div>
    </section>
  );
}
