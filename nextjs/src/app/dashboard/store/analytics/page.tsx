'use client';

import { useState } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import { formatPrice } from '@/lib/utils';

type Period = 'today' | 'week' | 'month';

const VISITS = { today: 156, week: 1240, month: 5830 };
const REVENUE_DATA = { today: 245000, week: 1850000, month: 7620000 };
const CONVERSION = { today: 3.2, week: 2.8, month: 3.1 };

const TOP_PRODUCTS = [
  { name: 'Premium цагаан цамц', views: 342, orders: 28, revenue: 980000, emoji: '👕' },
  { name: 'Bluetooth чихэвч', views: 289, orders: 22, revenue: 2178000, emoji: '🎧' },
  { name: 'Нүүрний крем SPF50', views: 256, orders: 35, revenue: 980000, emoji: '💄' },
  { name: 'Sporty гутал Air', views: 198, orders: 15, revenue: 1035000, emoji: '👟' },
  { name: 'Yoga mat pro', views: 167, orders: 12, revenue: 528000, emoji: '🧘' },
];

const TRAFFIC_SOURCES = [
  { source: 'Facebook', percent: 38, color: 'bg-blue-500' },
  { source: 'Instagram', percent: 25, color: 'bg-pink-500' },
  { source: 'Шууд хандалт', percent: 18, color: 'bg-[var(--esl-bg-section)]0' },
  { source: 'Google', percent: 12, color: 'bg-green-500' },
  { source: 'TikTok', percent: 7, color: 'bg-purple-500' },
];

const WEEKLY_REVENUE = [320000, 450000, 280000, 520000, 380000, 610000, 290000];
const DAYS = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба', 'Ням'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('week');

  const maxRevenue = Math.max(...WEEKLY_REVENUE);

  return (
    <div className="min-h-screen bg-[var(--esl-bg-section)] p-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[var(--esl-border)] p-6 mb-6">
        <h1 className="text-2xl font-bold text-[var(--esl-text-primary)]">Аналитик</h1>
        <p className="text-[var(--esl-text-secondary)] mt-1">Дэлгүүрийн хандалт, борлуулалтын статистик</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {([['today', 'Өнөөдөр'], ['week', '7 хоног'], ['month', 'Сар']] as [Period, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === key ? 'bg-indigo-600 text-white' : 'bg-white text-[var(--esl-text-secondary)] border border-[var(--esl-border)] hover:bg-[var(--esl-bg-section)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon="👁️" label="Хандалт" value={VISITS[period]} gradient="indigo" />
        <StatCard icon="💰" label="Орлого" value={formatPrice(REVENUE_DATA[period])} gradient="green" />
        <StatCard icon="🎯" label="Конверс %" value={`${CONVERSION[period]}%`} gradient="pink" />
        <StatCard icon="🛒" label="Захиалга" value={Math.round(VISITS[period] * CONVERSION[period] / 100)} gradient="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-[var(--esl-border)] p-6">
          <h2 className="text-lg font-bold text-[var(--esl-text-primary)] mb-4">📈 7 хоногийн орлого</h2>
          <div className="flex items-end gap-2 h-48">
            {WEEKLY_REVENUE.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-[var(--esl-text-secondary)] font-medium">{(val / 1000).toFixed(0)}k</span>
                <div
                  className="w-full bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-colors"
                  style={{ height: `${(val / maxRevenue) * 160}px` }}
                />
                <span className="text-[10px] text-[var(--esl-text-muted)]">{DAYS[i].slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-xl border border-[var(--esl-border)] p-6">
          <h2 className="text-lg font-bold text-[var(--esl-text-primary)] mb-4">🌐 Хандалтын эх үүсвэр</h2>
          <div className="space-y-4">
            {TRAFFIC_SOURCES.map((src) => (
              <div key={src.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--esl-text-primary)] font-medium">{src.source}</span>
                  <span className="text-[var(--esl-text-secondary)]">{src.percent}%</span>
                </div>
                <div className="w-full bg-[var(--esl-bg-section)] rounded-full h-2.5">
                  <div className={`${src.color} h-2.5 rounded-full transition-all`} style={{ width: `${src.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-[var(--esl-border)] overflow-hidden">
        <div className="p-6 border-b border-[var(--esl-border)]">
          <h2 className="text-lg font-bold text-[var(--esl-text-primary)]">🏆 Шилдэг бүтээгдэхүүн (үзэлтээр)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--esl-bg-section)] border-b border-[var(--esl-border)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">#</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">Бүтээгдэхүүн</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">Үзэлт</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">Захиалга</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">Орлого</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">Конверс</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PRODUCTS.map((p, i) => (
                <tr key={p.name} className="border-b border-[var(--esl-border)] hover:bg-[var(--esl-bg-section)]">
                  <td className="p-4 text-sm text-[var(--esl-text-muted)] font-medium">{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.emoji}</span>
                      <span className="text-sm font-medium text-[var(--esl-text-primary)]">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[var(--esl-text-primary)]">{p.views.toLocaleString()}</td>
                  <td className="p-4 text-sm text-[var(--esl-text-primary)]">{p.orders}</td>
                  <td className="p-4 text-sm font-semibold text-[var(--esl-text-primary)]">{formatPrice(p.revenue)}</td>
                  <td className="p-4 text-sm text-indigo-600 font-medium">{((p.orders / p.views) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
