'use client';

import { TrendingUp, TrendingDown, Hash, Camera, Music, MessageSquare, MessageCircle, type LucideIcon } from 'lucide-react';

interface Channel {
  name: string;
  icon: LucideIcon;
  color: string;
  clicks: number;
  sales: number;
  revenue: number;
  trend: number; // % change
}

const CHANNELS: Channel[] = [
  { name: 'Facebook', icon: Hash, color: '#1877F2', clicks: 523, sales: 28, revenue: 124000, trend: 12 },
  { name: 'Instagram', icon: Camera, color: '#E4405F', clicks: 312, sales: 18, revenue: 86000, trend: 24 },
  { name: 'TikTok', icon: Music, color: '#000000', clicks: 248, sales: 9, revenue: 42000, trend: 45 },
  { name: 'Messenger', icon: MessageSquare, color: '#0084FF', clicks: 102, sales: 5, revenue: 22000, trend: -8 },
  { name: 'WhatsApp', icon: MessageCircle, color: '#25D366', clicks: 58, sales: 2, revenue: 10000, trend: 5 },
];

export default function ChannelPerformance() {
  const maxClicks = Math.max(...CHANNELS.map((c) => c.clicks));

  return (
    <div className="bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
        <h3 className="font-bold text-[#0F172A] text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#6366F1]" />
          Сувгийн гүйцэтгэл
        </h3>
        <span className="text-[10px] text-[var(--esl-text-muted)] bg-[var(--esl-bg-section)] px-2 py-1 rounded font-medium">Сүүлийн 30 хоног</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-[var(--esl-text-muted)] uppercase tracking-wider border-b border-[#F8FAFC]">
              <th className="px-6 py-2.5 text-left font-semibold">Суваг</th>
              <th className="px-4 py-2.5 text-right font-semibold">Клик</th>
              <th className="px-4 py-2.5 text-right font-semibold">Борлуулалт</th>
              <th className="px-4 py-2.5 text-right font-semibold">Conversion</th>
              <th className="px-4 py-2.5 text-right font-semibold">Орлого</th>
              <th className="px-6 py-2.5 text-right font-semibold">Чиг хандлага</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {CHANNELS.map((ch) => {
              const convRate = ((ch.sales / (ch.clicks || 1)) * 100).toFixed(1);
              return (
                <tr key={ch.name} className="hover:bg-[var(--esl-bg-section)] transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: ch.color + '12' }}>
                        <ch.icon className="w-4 h-4" style={{ color: ch.color }} />
                      </div>
                      <span className="font-semibold text-[#0F172A]">{ch.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-[var(--esl-bg-section)] rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full" style={{ width: `${(ch.clicks / maxClicks) * 100}%`, background: ch.color }} />
                      </div>
                      <span className="font-semibold text-[#0F172A]">{ch.clicks}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">{ch.sales}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      Number(convRate) >= 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-[var(--esl-bg-section)] text-[var(--esl-text-secondary)]'
                    }`}>
                      {convRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#0F172A]">
                    {(ch.revenue / 1000).toFixed(0)}K₮
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                      ch.trend >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {ch.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {ch.trend >= 0 ? '+' : ''}{ch.trend}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
