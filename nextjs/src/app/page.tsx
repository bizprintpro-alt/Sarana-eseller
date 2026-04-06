'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, TrendingUp, Shield, Package, Megaphone, ShoppingBag, Truck } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import MobileNav from '@/components/shared/MobileNav';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />

      {/* ═══════════════════════════════════════════
          HERO — Dark, immersive, animated
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#07080D] overflow-hidden">
        {/* Animated grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(rgba(204,0,0,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(204,0,0,.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)',
          }}
        />

        {/* Orbs */}
        <motion.div
          className="absolute top-[-350px] right-[-250px] w-[900px] h-[900px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(204,0,0,.25), transparent 60%)', filter: 'blur(120px)' }}
          animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-250px] left-[-200px] w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(30,0,80,.4), transparent 65%)', filter: 'blur(130px)' }}
          animate={{ y: [0, 30, 0], scale: [1.05, 1, 1.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[150px] right-[200px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(5,150,105,.1), transparent 65%)', filter: 'blur(100px)' }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 text-center max-w-[900px] mx-auto px-6 pt-28 pb-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-[rgba(204,0,0,.08)] backdrop-blur-xl border border-[rgba(204,0,0,.2)] rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest text-white/90 mb-10"
          >
            <span className="w-[7px] h-[7px] rounded-full bg-[#FF3333] shadow-[0_0_12px_#FF3333,0_0_24px_rgba(255,51,51,.3)] animate-pulse" />
            Монголын seller-powered marketplace
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-white leading-[1.02] tracking-[-0.04em] mb-4"
            style={{ fontSize: 'clamp(36px, 6.5vw, 80px)', fontWeight: 900 }}
          >
            Барааны эзэн дангаараа<br />
            <span
              className="italic block"
              style={{
                background: 'linear-gradient(135deg, #FF3333, #FF6666, #CC0000)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(204,0,0,.3))',
              }}
            >
              борлуулж чадахгүй.
            </span>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="block text-white/40 mt-4 not-italic"
              style={{ fontSize: 'clamp(17px, 2.5vw, 32px)', fontWeight: 500, letterSpacing: '-0.01em' }}
            >
              Борлуулагчтай л борлуулалт байна.
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-white/45 max-w-[560px] mx-auto leading-relaxed mt-8"
          >
            eseller.mn дээр <strong className="text-white/80">барааны эзэн</strong> бараагаа
            байршуулна, <strong className="text-white/80">борлуулагч</strong> өөрийн сүлжээгээр
            дамжуулан зарна — хоёулаа ашигтай, хамтдаа ургана.
          </motion.p>

          {/* Dual CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-12 mb-16"
          >
            <Link
              href="/login#register"
              className="relative overflow-hidden bg-gradient-to-br from-[#CC0000] to-[#E53E3E] text-white px-8 py-4 rounded-2xl font-extrabold text-base no-underline shadow-[0_8px_32px_rgba(204,0,0,.4)] hover:shadow-[0_12px_40px_rgba(204,0,0,.5)] hover:-translate-y-[3px] transition-all duration-200 text-center group"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/15 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">
                Борлуулагч болох
                <small className="block text-xs font-medium text-white/80 mt-1">Комисстойгоор бараа зар</small>
              </span>
            </Link>
            <Link
              href="/login#register"
              className="bg-white/5 backdrop-blur-lg border-[1.5px] border-white/10 hover:bg-white/10 hover:border-white/25 text-white px-8 py-4 rounded-2xl font-bold text-base no-underline hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,.2)] transition-all duration-200 text-center"
            >
              Дэлгүүр нээх
              <small className="block text-xs font-medium text-white/50 mt-1">Бараагаа байршуул</small>
            </Link>
          </motion.div>

          {/* Equation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-0 bg-white/[.03] backdrop-blur-xl border border-white/[.06] rounded-3xl py-6 px-5 max-w-[760px] mx-auto"
          >
            {[
              { emoji: '📦', label: 'Барааны эзэн', sub: 'Бараа байршуулна' },
            ].map((item) => (
              <div key={item.label} className="text-center px-5">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="text-sm font-extrabold text-white">{item.label}</div>
                <div className="text-[10px] text-white/35 mt-0.5">{item.sub}</div>
              </div>
            ))}
            <div className="text-3xl font-black text-white/12 px-1">+</div>
            <div className="text-center px-5">
              <div className="text-3xl mb-2">📢</div>
              <div className="text-sm font-extrabold text-white">Борлуулагч</div>
              <div className="text-[10px] text-white/35 mt-0.5">Сүлжээгээр зарна</div>
            </div>
            <div className="text-3xl font-black text-white/12 px-1">=</div>
            <div className="bg-[rgba(204,0,0,.1)] border border-[rgba(204,0,0,.2)] rounded-2xl py-4 px-6 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-base font-extrabold text-[#FF4444]">Бодит борлуулалт</div>
              <div className="text-[10px] text-white/35 mt-0.5">Хоёулаа win-win</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PROBLEM — Dark section
          ═══════════════════════════════════════════ */}
      <section className="bg-[#0D1117] py-24 px-[6%]">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="inline-block text-xs font-extrabold uppercase tracking-widest bg-[rgba(204,0,0,.12)] text-[#CC0000] px-4 py-1.5 rounded-full mb-5">
              Яагаад eseller.mn?
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-white font-black tracking-[-0.03em] leading-tight mb-4" style={{ fontSize: 'clamp(26px, 4vw, 48px)' }}>
              Ердийн онлайн дэлгүүрийн бодит асуудал
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/40 text-[15px] max-w-[500px] mx-auto leading-relaxed">
              Барааны эзэн гансаараа ажиллахад борлуулалт удаан, зардал өндөр. Шийдэл нь хамтарсан экосистем.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-[3px] rounded-3xl overflow-hidden"
          >
            {/* Bad */}
            <motion.div variants={fadeUp} custom={0} className="bg-[rgba(239,68,68,.04)] p-10 border-t-[3px] border-t-[rgba(239,68,68,.4)]">
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[#F87171] mb-4">❌ Дангаараа ажиллах</span>
              <h3 className="text-lg font-extrabold text-white mb-3">Зар сурталчилгаа өөрөө хийх</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-5">Барааны эзэн маркетинг, борлуулалт бүгдийг өөрөө удирдах ёстой.</p>
              <ul className="space-y-0">
                {[
                  'Зар сурталчилгаанд их мөнгө зарцуулна',
                  'Шинэ хэрэглэгч олоход удаан, үнэтэй',
                  'Борлуулалт тогтмол бус, тааруу',
                  'Социал медиаг өөрөө удирдах ёстой',
                  'Хүрэх зах зээл хязгаарлагдмал',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-white/50 py-2 border-b border-white/[.04] last:border-0">
                    <span className="text-[#F87171] font-black shrink-0">✗</span>{t}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Good */}
            <motion.div variants={fadeUp} custom={1} className="bg-[rgba(5,150,105,.04)] p-10 border-t-[3px] border-t-[rgba(5,150,105,.4)]">
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[#34D399] mb-4">✅ eseller.mn загвар</span>
              <h3 className="text-lg font-extrabold text-white mb-3">Борлуулагчдын сүлжээгээр</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-5">Борлуулагч бүр өөрийн сүлжээгээр маркетинг хийнэ. Зарагдвал л төлнө.</p>
              <ul className="space-y-0">
                {[
                  'Урьдчилсан зар сурталчилгааны зардалгүй',
                  'Олон борлуулагч = олон борлуулалтын суваг',
                  'Борлуулалт болоход л комисс тооцогдоно',
                  'Борлуулагч нь өөрөө сонирхолтой зарна',
                  'Вирал өсөлт, шинэ зах зээлд хүрэх боломж',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-white/50 py-2 border-b border-white/[.04] last:border-0">
                    <span className="text-[#34D399] font-black shrink-0">✓</span>{t}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — White section
          ═══════════════════════════════════════════ */}
      <section style={{ background: "var(--esl-bg-card)" }} className="py-24 px-[6%]">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="inline-block text-xs font-extrabold uppercase tracking-widest bg-green-50 text-[#059669] px-4 py-1.5 rounded-full mb-5">
              Хэрхэн ажилладаг
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-[var(--esl-text-primary)] font-black tracking-[-0.03em] leading-tight mb-4" style={{ fontSize: 'clamp(26px, 4vw, 48px)' }}>
              Хоёр талын замнал
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-[var(--esl-text-secondary)] text-[15px] max-w-[500px] mx-auto leading-relaxed">
              Барааны эзэн ба борлуулагч хоёулаа ашигтай — энэ нь eseller.mn-ийн гол зарчим.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Seller path */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8 text-xs font-extrabold uppercase tracking-widest text-[#CC0000]">
                <span className="w-8 h-8 bg-[#FFF0F0] rounded-lg flex items-center justify-center text-[15px]">🏪</span>
                Барааны эзний замнал
              </motion.div>
              {[
                { n: 1, t: 'Дэлгүүр нээх', d: '5 минутад бүртгүүлж, дэлгүүрийн нэр, лого, мэдээллээ оруулна.' },
                { n: 2, t: 'Бараа байршуулах', d: 'Бараагаа зураг, үнэ, тайлбартайгаар нэмнэ. Физик болон дижитал хоёулаа боломжтой.' },
                { n: 3, t: 'Борлуулагчийн комисс тохируулах', d: 'Бараа бүрт хэдэн хувийн комисс өгөхөө тохируулна.' },
                { n: 4, t: 'Захиалга & орлого авах', d: 'Борлуулагчдын сүлжээгээр захиалга ирнэ. QPay-р шууд орлого орно.' },
              ].map((s) => (
                <motion.div key={s.n} variants={fadeUp} className="flex gap-4 mb-6 items-start">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF0F0] text-[#CC0000] flex items-center justify-center text-sm font-black shrink-0 shadow-sm">{s.n}</div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--esl-text-primary)] mb-1">{s.t}</h4>
                    <p className="text-sm text-[var(--esl-text-secondary)] leading-relaxed">{s.d}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Affiliate path */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8 text-xs font-extrabold uppercase tracking-widest text-[#D97706]">
                <span className="w-8 h-8 bg-[#FFFBEB] rounded-lg flex items-center justify-center text-[15px]">📢</span>
                Борлуулагчийн замнал
              </motion.div>
              {[
                { n: 1, t: 'Борлуулагч болох', d: 'Бүртгүүлж, "Борлуулагч" role сонгоно. Username, профайл үүсгэнэ.' },
                { n: 2, t: 'Бараа сонгох', d: 'Marketplace-с өөрт таарах бараа, дэлгүүр сонгоно. Комисс хувийг харж шийднэ.' },
                { n: 3, t: 'Өөрийн линкээр share хийх', d: 'Referral линк үүсгэж Facebook, Instagram, TikTok, WhatsApp-аар тараана.' },
                { n: 4, t: 'Комисс авах', d: 'Борлуулалт болох бүрт комисс автоматаар тооцогдоно. Хүссэн үедээ татна.' },
              ].map((s) => (
                <motion.div key={s.n} variants={fadeUp} className="flex gap-4 mb-6 items-start">
                  <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center text-sm font-black shrink-0 shadow-sm">{s.n}</div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--esl-text-primary)] mb-1">{s.t}</h4>
                    <p className="text-sm text-[var(--esl-text-secondary)] leading-relaxed">{s.d}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ROLES — Light gray section
          ═══════════════════════════════════════════ */}
      <section className="bg-[var(--esl-bg-section)] py-24 px-[6%]">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="inline-block text-xs font-extrabold uppercase tracking-widest bg-amber-50 text-[#D97706] px-4 py-1.5 rounded-full mb-5">
              Та хэн бэ?
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-[var(--esl-text-primary)] font-black tracking-[-0.03em] leading-tight mb-4" style={{ fontSize: 'clamp(26px, 4vw, 48px)' }}>
              Экосистемд бүгдэд байр бий
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-[var(--esl-text-secondary)] text-[15px] max-w-[500px] mx-auto leading-relaxed">
              Барааны эзэн, борлуулагч, худалдан авагч, жолооч — бүгд хамтдаа ажилладаг.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {[
              { ic: <Package className="w-7 h-7" />, t: 'Дэлгүүр эзэн', d: 'Бараагаа байршуул. Борлуулагчдын сүлжээ таны барааг зарна. Зар сурталчилгааны зардалгүй.', earn: '💰 Борлуулалтын 70–85%', color: '#CC0000', bg: '#FFF0F0', grad: 'from-[#CC0000] to-[#E53E3E]' },
              { ic: <Megaphone className="w-7 h-7" />, t: 'Борлуулагч', d: 'Өөрийн сүлжээгээр бараа зарж комисс ол. Агуулах, хүргэлт — чиний санаа зовдог асуудал биш.', earn: '🔗 10–20% комисс', color: '#D97706', bg: '#FFFBEB', grad: 'from-[#D97706] to-[#F59E0B]' },
              { ic: <ShoppingBag className="w-7 h-7" />, t: 'Худалдан авагч', d: 'Олон мянган бараанаас хамгийн сайн үнэтэйг нь олж, QPay-р аюулгүй төлж, гэртээ авна.', earn: '🚀 2–4 цагт хүргэлт', color: '#059669', bg: '#ECFDF5', grad: 'from-[#059669] to-[#10B981]' },
              { ic: <Truck className="w-7 h-7" />, t: 'Жолооч', d: 'Захиалга хүргэж нэмэлт орлого ол. Цагаа өөрөө тохируул, ажлаа өөрөө удирд.', earn: '📦 Хүргэлт бүрт орлого', color: '#0891B2', bg: '#E0F7FA', grad: 'from-[#0891B2] to-[#06B6D4]' },
            ].map((r) => (
              <motion.div key={r.t} variants={fadeUp}>
                <Link
                  href="/login#register"
                  className="group relative block bg-[var(--esl-bg-card)] border-[1.5px] border-[var(--esl-border)] rounded-3xl p-8 no-underline overflow-hidden hover:-translate-y-1.5 hover:shadow-xl hover:border-transparent transition-all duration-200"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${r.grad} opacity-0 group-hover:opacity-100 group-hover:h-[5px] transition-all`} />
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: r.bg, color: r.color }}>
                    {r.ic}
                  </div>
                  <h3 className="text-lg font-extrabold text-[var(--esl-text-primary)] mb-2">{r.t}</h3>
                  <p className="text-sm text-[var(--esl-text-secondary)] leading-relaxed mb-4">{r.d}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full" style={{ background: r.bg, color: r.color }}>
                    {r.earn}
                  </span>
                  <span className="block mt-5 text-sm font-bold text-[var(--esl-text-muted)] group-hover:text-[#CC0000] transition-colors">
                    Бүртгүүлэх <ArrowRight className="inline w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SPOTLIGHT — Dark section
          ═══════════════════════════════════════════ */}
      <section className="bg-[#08090F] py-24 px-[6%]">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="inline-block text-xs font-extrabold uppercase tracking-widest bg-[rgba(204,0,0,.12)] text-[#CC0000] px-4 py-1.5 rounded-full mb-5">
              Борлуулагчийн хүч
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="text-white font-black tracking-[-0.03em] leading-tight mb-4"
              style={{ fontSize: 'clamp(24px, 3.5vw, 44px)' }}
            >
              Нэг борлуулагч =<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #FF3333, #FF6666)',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Мянган хэрэглэгч
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[15px] text-white/40 leading-relaxed mb-10">
              Борлуулагч бүр өөрийн Facebook, Instagram, TikTok сүлжээтэй. Тэдний нэг post таны барааг мянган хүнд хүргэнэ. Та зар төлөхгүй — зарагдвал л комисс өгнө.
            </motion.p>

            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
              {[
                { n: '0₮', l: 'Урьдчилсан зар зардал' },
                { n: '∞', l: 'Борлуулагчийн тоо хязгааргүй' },
                { n: '100%', l: 'Зарагдвал л тооцоо хийгдэнэ' },
                { n: '24ц', l: 'Бодит цагт хяналт' },
              ].map((s) => (
                <div
                  key={s.l}
                  className="bg-white/[.04] border border-white/[.06] backdrop-blur-lg rounded-2xl p-5 hover:bg-white/[.07] hover:-translate-y-0.5 transition-all"
                >
                  <div className="text-2xl font-black text-white tracking-tight">{s.n}</div>
                  <div className="text-xs text-white/35 mt-1 font-semibold">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col gap-3"
          >
            {[
              { ic: '📦', bg: 'rgba(204,0,0,.12)', t: 'Та бараа байршуулна', d: 'Зураг, үнэ, комисс хувь тохируулна', arrow: true },
              { ic: '📢', bg: 'rgba(215,119,6,.12)', t: 'Борлуулагч share хийнэ', d: 'Өөрийн сүлжээгээр дамжуулан зарна', arrow: true, ml: 20 },
              { ic: '💳', bg: 'rgba(5,150,105,.1)', t: 'Хэрэглэгч худалдаж авна', d: 'QPay-р аюулгүй төлбөр хийнэ', arrow: true, ml: 40 },
              { ic: '💰', bg: 'rgba(8,145,178,.1)', t: 'Хоёулаа орлого авна', d: 'Эзэн 70–85%, борлуулагч 10–20%', ml: 20 },
            ].map((f) => (
              <motion.div
                key={f.t}
                variants={fadeUp}
                className="bg-white/[.03] border border-white/[.06] backdrop-blur-lg rounded-2xl py-5 px-6 flex items-center gap-4 hover:bg-white/[.07] hover:translate-x-1 transition-all"
                style={{ marginLeft: f.ml || 0 }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: f.bg }}>
                  {f.ic}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">{f.t}</h4>
                  <p className="text-xs text-white/35">{f.d}</p>
                </div>
                {f.arrow && <span className="ml-auto text-white/15 text-base">↓</span>}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA — White section
          ═══════════════════════════════════════════ */}
      <section className="bg-[var(--esl-bg-card)] py-24 px-[6%] text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-[600px] mx-auto"
        >
          <motion.span variants={fadeUp} className="inline-block text-xs font-extrabold uppercase tracking-widest bg-[rgba(204,0,0,.08)] text-[#CC0000] px-4 py-1.5 rounded-full mb-5">
            Эхэлцгээе
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-[var(--esl-text-primary)] font-black tracking-[-0.04em] leading-[1.05] mb-4"
            style={{ fontSize: 'clamp(28px, 4.5vw, 56px)' }}
          >
            Борлуулалт<br />
            <span
              className="italic"
              style={{
                background: 'linear-gradient(135deg, #CC0000, #E53E3E)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              хамтдаа л байна.
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[15px] text-[var(--esl-text-secondary)] max-w-[480px] mx-auto leading-relaxed mb-12">
            Дэлгүүр нээх, борлуулагч болох — хоёулаа үнэгүй. Зөвхөн борлуулалт болоход л тооцоо хийгдэнэ.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-5">
            <Link
              href="/become-seller"
              className="bg-gradient-to-br from-[#CC0000] to-[#E53E3E] text-white px-8 py-4 rounded-2xl font-extrabold no-underline shadow-[0_8px_32px_rgba(204,0,0,.3)] hover:shadow-[0_12px_40px_rgba(204,0,0,.4)] hover:-translate-y-[3px] transition-all duration-200"
            >
              🏪 Дэлгүүр нээх — Үнэгүй
            </Link>
            <Link
              href="/shops"
              className="border-2 border-[var(--esl-border)] hover:border-[#CC0000] text-[var(--esl-text-primary)] hover:text-[#CC0000] px-8 py-4 rounded-2xl font-bold no-underline transition-all duration-200"
            >
              📢 Борлуулагч болох <ArrowRight className="inline w-4 h-4" />
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="text-sm text-[var(--esl-text-muted)]">
            Бүртгэл үнэгүй &middot; Зөвхөн борлуулалтаас комисс &middot; QPay аюулгүй
          </motion.p>
        </motion.div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}
