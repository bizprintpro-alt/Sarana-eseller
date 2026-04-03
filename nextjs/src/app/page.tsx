'use client';

import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import MobileNav from '@/components/shared/MobileNav';

export default function LandingPage() {
  return (
    <div className="bg-[#08090F] text-white min-h-screen overflow-hidden">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 opacity-40" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-[0.08] bg-[#CC0000] blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] rounded-full opacity-[0.08] bg-blue-600 blur-[100px]" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Монголын seller-powered marketplace
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight mb-6 animate-fade-up" style={{animationDelay: '0.1s'}}>
            Барааны эзэн дангаараа<br />
            <span className="text-[#CC0000]">борлуулж чадахгүй.</span><br />
            <span className="text-xl md:text-2xl font-bold text-white/50 block mt-3">
              Борлуулагчтай л борлуулалт байна.
            </span>
          </h1>

          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto leading-relaxed mb-10 animate-fade-up" style={{animationDelay: '0.2s'}}>
            eseller.mn дээр <strong className="text-white/80">барааны эзэн</strong> бараагаа
            байршуулна, <strong className="text-white/80">борлуулагч</strong> өөрийн сүлжээгээр
            дамжуулан зарна — хоёулаа ашигтай, хамтдаа ургана.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up" style={{animationDelay: '0.3s'}}>
            <Link href="/login#register"
              className="bg-[#CC0000] hover:bg-[#A30000] text-white px-8 py-4 rounded-2xl font-extrabold text-base no-underline shadow-[0_6px_28px_rgba(204,0,0,.3)] hover:-translate-y-0.5 transition-all text-center">
              📢 Борлуулагч болох
              <small className="block text-xs font-medium text-white/70 mt-1">Комисстойгоор бараа зар</small>
            </Link>
            <Link href="/login#register"
              className="bg-white/5 border border-white/10 hover:border-[#CC0000] text-white px-8 py-4 rounded-2xl font-extrabold text-base no-underline hover:-translate-y-0.5 transition-all text-center">
              🏪 Дэлгүүр нээх
              <small className="block text-xs font-medium text-white/50 mt-1">Бараагаа байршуул</small>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 animate-fade-up" style={{animationDelay: '0.4s'}}>
            <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-2xl">📦</span>
              <span className="text-xs font-bold">Барааны эзэн</span>
              <span className="text-[10px] text-white/40">Бараа байршуулна</span>
            </div>
            <span className="text-2xl font-black text-white/20">+</span>
            <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-2xl">📢</span>
              <span className="text-xs font-bold">Борлуулагч</span>
              <span className="text-[10px] text-white/40">Сүлжээгээр зарна</span>
            </div>
            <span className="text-2xl font-black text-white/20">=</span>
            <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-[#CC0000]/10 border border-[#CC0000]/20">
              <span className="text-2xl">🔥</span>
              <span className="text-xs font-bold">Бодит борлуулалт</span>
              <span className="text-[10px] text-white/40">Хоёулаа win-win</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest bg-[#CC0000]/12 text-[#CC0000] px-3 py-1 rounded-full mb-5">Яагаад eseller.mn?</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ердийн онлайн дэлгүүрийн бодит асуудал</h2>
            <p className="text-white/50 max-w-xl mx-auto">Барааны эзэн гансаараа ажиллахад борлуулалт удаан, зардал өндөр.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/[.03] border border-white/[.06] rounded-3xl p-8">
              <span className="inline-block bg-red-500/10 text-red-400 text-xs font-bold px-3 py-1 rounded-full mb-4">❌ Дангаараа ажиллах</span>
              <h3 className="text-xl font-bold mb-3">Зар сурталчилгаа өөрөө хийх</h3>
              <ul className="space-y-2 text-sm text-white/50 list-none">
                {['Зар сурталчилгаанд их мөнгө зарцуулна', 'Шинэ хэрэглэгч олоход удаан', 'Борлуулалт тогтмол бус', 'Хүрэх зах зээл хязгаарлагдмал'].map((t) => (
                  <li key={t} className="flex items-start gap-2"><span className="text-red-400 shrink-0">×</span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="bg-green-500/[.03] border border-green-500/10 rounded-3xl p-8">
              <span className="inline-block bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-4">✅ eseller.mn загвар</span>
              <h3 className="text-xl font-bold mb-3">Борлуулагчдын сүлжээгээр</h3>
              <ul className="space-y-2 text-sm text-white/50 list-none">
                {['Урьдчилсан зар зардалгүй', 'Олон борлуулагч = олон суваг', 'Зарагдвал л комисс', 'Вирал өсөлт боломжтой'].map((t) => (
                  <li key={t} className="flex items-start gap-2"><span className="text-green-400 shrink-0">✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest bg-green-500/10 text-green-400 px-3 py-1 rounded-full mb-5">Хэрхэн ажилладаг</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Хоёр талын замнал</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6 bg-green-500/5 border border-green-500/10 rounded-2xl px-5 py-3">
                <span className="text-2xl">🏪</span><span className="font-bold">Барааны эзний замнал</span>
              </div>
              {[
                { n: 1, t: 'Дэлгүүр нээх', d: '5 минутад бүртгүүлж, дэлгүүрийн мэдээллээ оруулна.' },
                { n: 2, t: 'Бараа байршуулах', d: 'Бараагаа зураг, үнэ, тайлбартайгаар нэмнэ.' },
                { n: 3, t: 'Комисс тохируулах', d: 'Бараа бүрт хэдэн хувийн комисс өгөхөө тохируулна.' },
                { n: 4, t: 'Захиалга & орлого', d: 'QPay-р шууд орлого орно.' },
              ].map((s) => (
                <div key={s.n} className="flex gap-4 mb-5">
                  <div className="w-8 h-8 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center text-sm font-bold shrink-0">{s.n}</div>
                  <div><h4 className="text-sm font-bold mb-1">{s.t}</h4><p className="text-xs text-white/40 leading-relaxed">{s.d}</p></div>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl px-5 py-3">
                <span className="text-2xl">📢</span><span className="font-bold">Борлуулагчийн замнал</span>
              </div>
              {[
                { n: 1, t: 'Борлуулагч болох', d: 'Бүртгүүлж "Борлуулагч" role сонгоно.' },
                { n: 2, t: 'Бараа сонгох', d: 'Marketplace-с өөрт таарах бараа сонгоно.' },
                { n: 3, t: 'Share хийх', d: 'Referral линк үүсгэж сошиал медиагаар тараана.' },
                { n: 4, t: 'Комисс авах', d: 'Борлуулалт болох бүрт комисс автоматаар тооцогдоно.' },
              ].map((s) => (
                <div key={s.n} className="flex gap-4 mb-5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center text-sm font-bold shrink-0">{s.n}</div>
                  <div><h4 className="text-sm font-bold mb-1">{s.t}</h4><p className="text-xs text-white/40 leading-relaxed">{s.d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ROLES ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full mb-5">Та хэн бэ?</span>
          <h2 className="text-3xl md:text-4xl font-black mb-12">Экосистемд бүгдэд байр бий</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { ic: '🏪', t: 'Дэлгүүр эзэн', d: 'Бараагаа байршуул.', earn: '💰 70–85%' },
              { ic: '📢', t: 'Борлуулагч', d: 'Сүлжээгээр зарж комисс ол.', earn: '🔗 10–20%' },
              { ic: '🛍️', t: 'Худалдан авагч', d: 'Хамгийн сайн бараа, үнэ.', earn: '🚀 2–4 цагт' },
              { ic: '🚚', t: 'Жолооч', d: 'Хүргэлтээр орлого ол.', earn: '📦 Хүргэлт бүрт' },
            ].map((r) => (
              <Link key={r.t} href="/login#register"
                className="bg-white/[.03] border border-white/[.06] rounded-3xl p-6 text-left no-underline text-white hover:border-[#CC0000]/20 hover:-translate-y-1 transition-all block">
                <div className="text-3xl mb-3">{r.ic}</div>
                <h3 className="text-base font-bold mb-2">{r.t}</h3>
                <p className="text-xs text-white/40 leading-relaxed mb-3">{r.d}</p>
                <div className="text-xs font-bold text-white/60 bg-white/5 px-3 py-1.5 rounded-lg inline-block">{r.earn}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-24 px-6 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-widest bg-[#CC0000]/12 text-[#CC0000] px-3 py-1 rounded-full mb-5">Эхэлцгээе</span>
        <h2 className="text-3xl md:text-5xl font-black mb-4">
          Борлуулалт<br /><em className="text-[#CC0000] not-italic">хамтдаа л байна.</em>
        </h2>
        <p className="text-white/50 max-w-lg mx-auto mb-10">Дэлгүүр нээх, борлуулагч болох — хоёулаа үнэгүй.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Link href="/login#register" className="bg-[#CC0000] hover:bg-[#A30000] text-white px-8 py-4 rounded-2xl font-extrabold no-underline shadow-[0_6px_28px_rgba(204,0,0,.3)] hover:-translate-y-0.5 transition-all">
            🏪 Дэлгүүр нээх — Үнэгүй
          </Link>
          <Link href="/login#register" className="border-2 border-white/10 hover:border-[#CC0000] text-white px-8 py-4 rounded-2xl font-bold no-underline hover:text-[#CC0000] transition-all">
            📢 Борлуулагч болох →
          </Link>
        </div>
        <p className="text-xs text-white/30">Бүртгэл үнэгүй &middot; Зөвхөн борлуулалтаас комисс &middot; QPay аюулгүй</p>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}
