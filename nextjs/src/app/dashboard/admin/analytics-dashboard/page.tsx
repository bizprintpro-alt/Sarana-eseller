'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Eye, MousePointerClick, ShoppingCart, Users, TrendingUp, TrendingDown,
  BarChart3, ArrowUpRight, Clock, Globe, Smartphone, Monitor,
  Share2, Calendar,
} from 'lucide-react';

const PERIODS = ['Өнөөдөр', '7 хоног', '30 хоног', '90 хоног'];

const OVERVIEW_STATS = [
  { label: 'Нийт хандалт', value: '124,832', change: '+12.4%', up: true, icon: Eye, color: '#6366F1' },
  { label: 'Давтагдашгүй хэрэглэгч', value: '45,210', change: '+8.2%', up: true, icon: Users, color: '#EC4899' },
  { label: 'Хуваалцалт', value: '3,847', change: '+24.1%', up: true, icon: Share2, color: '#10B981' },
  { label: 'Хөрвүүлэлт', value: '2.8%', change: '-0.3%', up: false, icon: ShoppingCart, color: '#F59E0B' },
];

const DAILY_DATA = [
  { day: 'Да', views: 4200, clicks: 890, orders: 42 },
  { day: 'Мя', views: 3800, clicks: 760, orders: 38 },
  { day: 'Лх', views: 5100, clicks: 1020, orders: 56 },
  { day: 'Пү', views: 4600, clicks: 920, orders: 48 },
  { day: 'Ба', views: 6200, clicks: 1340, orders: 72 },
  { day: 'Бя', views: 7800, clicks: 1560, orders: 89 },
  { day: 'Ня', views: 5400, clicks: 1080, orders: 61 },
];

const TOP_PAGES = [
  { path: '/store', views: 34200, pct: 27.4 },
  { path: '/store/sporty-gutal', views: 12800, pct: 10.3 },
  { path: '/', views: 11400, pct: 9.1 },
  { path: '/store/bluetooth-chihevch', views: 8900, pct: 7.1 },
  { path: '/login', views: 7200, pct: 5.8 },
  { path: '/checkout', views: 5600, pct: 4.5 },
  { path: '/shops', views: 4300, pct: 3.4 },
];

const TRAFFIC_SOURCES = [
  { source: 'Facebook', visits: 42000, pct: 33.6, color: '#1877F2' },
  { source: 'Шууд хандалт', visits: 28000, pct: 22.4, color: '#6366F1' },
  { source: 'Google хайлт', visits: 21000, pct: 16.8, color: '#10B981' },
  { source: 'Instagram', visits: 15000, pct: 12.0, color: '#E4405F' },
  { source: 'TikTok', visits: 11000, pct: 8.8, color: '#010101' },
  { source: 'Бусад', visits: 7832, pct: 6.3, color: '#94A3B8' },
];

const DEVICE_STATS = [
  { device: 'Гар утас', pct: 68, icon: Smartphone },
  { device: 'Компьютер', pct: 28, icon: Monitor },
  { device: 'Таблет', pct: 4, icon: Monitor },
];

export default function AnalyticsDashboardPage() {
  const [period, setPeriod] = useState('7 хоног');
  const maxViews = Math.max(...DAILY_DATA.map((d) => d.views));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--esl-text-primary)]">Хандалтын аналитик</h1>
          <p className="text-sm text-[var(--esl-text-secondary)]">Үзсэн тоо, хуваалцалт, хадгалсан тооны статистик</p>
        </div>
        <div className="flex gap-1 bg-white border border-[var(--esl-border)] rounded-xl p-1">
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition',
                period === p ? 'bg-[#1A1A2E] text-white' : 'bg-transparent text-[var(--esl-text-secondary)] hover:bg-[var(--esl-bg-section)]')}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        {OVERVIEW_STATS.map((s) => (
          <div key={s.label} className="bg-white border border-[var(--esl-border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: s.color + '12', color: s.color }}>
                <s.icon className="w-4.5 h-4.5" />
              </div>
              <span className={cn('text-xs font-bold flex items-center gap-0.5',
                s.up ? 'text-green-600' : 'text-red-500')}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change}
              </span>
            </div>
            <div className="text-2xl font-black text-[var(--esl-text-primary)]">{s.value}</div>
            <div className="text-[10px] text-[var(--esl-text-muted)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ Weekly Chart ═══ */}
        <div className="lg:col-span-2 bg-white border border-[var(--esl-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-[var(--esl-text-primary)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" /> Долоо хоногийн хандалт
            </h3>
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Хандалт</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" /> Клик</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Захиалга</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 h-48">
            {DAILY_DATA.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end justify-center gap-0.5 h-40">
                  <motion.div className="w-3 bg-indigo-500 rounded-t" initial={{ height: 0 }}
                    animate={{ height: `${(d.views / maxViews) * 100}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} />
                  <motion.div className="w-3 bg-pink-400 rounded-t" initial={{ height: 0 }}
                    animate={{ height: `${(d.clicks / maxViews) * 100}%` }} transition={{ duration: 0.5, delay: i * 0.05 + 0.1 }} />
                  <motion.div className="w-3 bg-green-500 rounded-t" initial={{ height: 0 }}
                    animate={{ height: `${(d.orders / maxViews) * 100}%` }} transition={{ duration: 0.5, delay: i * 0.05 + 0.2 }} />
                </div>
                <span className="text-[10px] font-semibold text-[var(--esl-text-muted)]">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Traffic Sources ═══ */}
        <div className="bg-white border border-[var(--esl-border)] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[var(--esl-text-primary)] mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" /> Трафикийн эх үүсвэр
          </h3>
          <div className="space-y-3">
            {TRAFFIC_SOURCES.map((t) => (
              <div key={t.source}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[var(--esl-text-primary)]">{t.source}</span>
                  <span className="text-[var(--esl-text-muted)]">{t.visits.toLocaleString()} ({t.pct}%)</span>
                </div>
                <div className="h-1.5 bg-[var(--esl-bg-section)] rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: t.color }}
                    initial={{ width: 0 }} animate={{ width: `${t.pct}%` }} transition={{ duration: 0.6 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══ Top Pages ═══ */}
        <div className="bg-white border border-[var(--esl-border)] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[var(--esl-text-primary)] mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-500" /> Шилдэг хуудсууд
          </h3>
          <div className="space-y-2">
            {TOP_PAGES.map((p, i) => (
              <div key={p.path} className="flex items-center gap-3 py-1.5">
                <span className="text-xs font-bold text-[var(--esl-text-muted)] w-5">{i + 1}</span>
                <span className="text-xs font-mono text-[var(--esl-text-primary)] flex-1 truncate">{p.path}</span>
                <span className="text-xs font-bold text-[var(--esl-text-primary)]">{p.views.toLocaleString()}</span>
                <div className="w-16 h-1.5 bg-[var(--esl-bg-section)] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Devices + Realtime ═══ */}
        <div className="space-y-4">
          <div className="bg-white border border-[var(--esl-border)] rounded-xl p-5">
            <h3 className="text-sm font-bold text-[var(--esl-text-primary)] mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-500" /> Төхөөрөмжийн статистик
            </h3>
            <div className="space-y-3">
              {DEVICE_STATS.map((d) => (
                <div key={d.device} className="flex items-center gap-3">
                  <d.icon className="w-4 h-4 text-[var(--esl-text-muted)]" />
                  <span className="text-xs text-[var(--esl-text-primary)] w-20">{d.device}</span>
                  <div className="flex-1 h-2 bg-[var(--esl-bg-section)] rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-[var(--esl-text-primary)] w-10 text-right">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1A1A2E] rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="text-sm font-bold">Бодит цагийн хандалт</h3>
            </div>
            <div className="text-4xl font-black mb-1">47</div>
            <div className="text-xs text-white/50">Одоо идэвхтэй хэрэглэгч</div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'Нүүр', value: 12 },
                { label: 'Дэлгүүр', value: 28 },
                { label: 'Checkout', value: 7 },
              ].map((r) => (
                <div key={r.label} className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-lg font-black">{r.value}</div>
                  <div className="text-[10px] text-white/40">{r.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
