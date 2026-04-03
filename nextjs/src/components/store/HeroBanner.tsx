'use client';

import { motion } from 'framer-motion';
import { Search, ChevronRight, Truck, Shield, Clock, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: Truck, title: 'Үнэгүй хүргэлт', sub: '50,000₮-с дээш', color: '#059669' },
  { icon: Shield, title: 'Аюулгүй төлбөр', sub: 'QPay & Карт', color: '#0891B2' },
  { icon: Clock, title: 'Хурдан хүргэлт', sub: '2-4 цагийн дотор', color: '#D97706' },
  { icon: Sparkles, title: 'Шинэ ирэлтүүд', sub: 'Долоо хоног бүр', color: '#7C3AED' },
];

export default function HeroBanner({ onSearch }: { onSearch: () => void }) {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#E31E24] via-[#C41A1F] to-[#8B0000] text-white overflow-hidden">
        <div className="absolute top-[-100px] right-[-80px] w-[400px] h-[400px] rounded-full bg-white/[.06]" />
        <div className="absolute bottom-[-60px] left-[-40px] w-[250px] h-[250px] rounded-full bg-white/[.04]" />
        <div className="max-w-[1320px] mx-auto px-4 py-14 md:py-20 relative z-10">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FCD34D] animate-pulse" /> Шинэ хямдрал эхэллээ
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-4">
              Монголын хамгийн том<br />онлайн дэлгүүр
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-white/80 text-base md:text-lg mb-8 max-w-md leading-relaxed">
              5,000+ бараа, 500+ дэлгүүр, хурдан хүргэлт, баталгаатай чанар
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-3">
              <button onClick={onSearch}
                className="bg-white text-[#E31E24] font-bold px-7 py-3 rounded-xl border-none cursor-pointer text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <Search className="w-4 h-4" /> Бараа хайх
              </button>
              <button className="bg-white/15 backdrop-blur-sm text-white font-semibold px-7 py-3 rounded-xl border border-white/20 cursor-pointer text-sm hover:bg-white/25 transition-all">
                Бүгд харах <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature bar */}
      <section className="bg-[#FFFBEB] border-b border-[#FDE68A]/50">
        <div className="max-w-[1320px] mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: f.color + '12', color: f.color }}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1A1A2E]">{f.title}</div>
                  <div className="text-xs text-[#92400E]/60">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo strip */}
      <div className="bg-[#1A1A2E]">
        <div className="max-w-[1320px] mx-auto px-4 py-2.5 flex items-center justify-center gap-6 flex-wrap text-xs text-white/70">
          <span className="flex items-center gap-1.5"><span className="text-[#FCD34D]">🔥</span> 50% хямдрал электроник бараанд</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:flex items-center gap-1.5"><span className="text-[#FCD34D]">🎁</span> Шинэ хэрэглэгчдэд 10,000₮ купон</span>
          <span className="hidden md:inline text-white/20">|</span>
          <span className="hidden md:flex items-center gap-1.5"><span className="text-[#FCD34D]">🚚</span> 50,000₮+ үнэгүй хүргэлт</span>
        </div>
      </div>
    </>
  );
}
