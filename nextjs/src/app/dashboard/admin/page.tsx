'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Wrench, Users, Package, Wallet, Clock, Store, ShoppingBag,
  TrendingUp, BarChart3, AlertTriangle, MessageSquare, Layers,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalShops: number;
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  pendingDisputes: number;
  activeChats: number;
  todayRevenue: number;
  pendingPayout: number;
  roles: Record<string, number>;
  dailyChart: { date: string; label: string; orders: number; revenue: number }[];
  revenuePie: { name: string; value: number }[];
}

const PIE_COLORS = ['#22C55E', '#3B82F6', '#E24B4A', '#7C3AED', '#F59E0B', '#EC4899', '#14B8A6', '#8B5CF6', '#EF9F27', '#D97706'];
const SOURCE_LABELS: Record<string, string> = {
  commission: 'Комисс',
  subscription: 'Subscription',
  banner: 'Баннер',
  sms: 'SMS',
  email: 'Email',
  push: 'Push',
  affiliate: 'Affiliate',
  ai_credit: 'AI кредит',
  featured: 'Онцлох',
  delivery: 'Хүргэлт',
};

function formatMNT(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M₮';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K₮';
  return n.toLocaleString() + '₮';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/stats', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roleLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    buyer: { label: 'Худалдан авагч', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    seller: { label: 'Дэлгүүр эзэн', icon: <Store className="w-3.5 h-3.5" /> },
    affiliate: { label: 'Борлуулагч', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    delivery: { label: 'Жолооч', icon: <Package className="w-3.5 h-3.5" /> },
    admin: { label: 'Админ', icon: <Wrench className="w-3.5 h-3.5" /> },
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-dash-sidebar border-b border-dash-border px-8 py-4">
        <h1 className="text-white text-lg font-black flex items-center gap-2">
          <Wrench className="w-5 h-5" /> Админ самбар
        </h1>
        <p className="text-white/35 text-xs mt-0.5">Платформын удирдлага — Бодит өгөгдөл</p>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="text-center py-20 text-white/30">Ачааллаж байна...</div>
        ) : !stats ? (
          <div className="text-center py-20 text-white/30">Өгөгдөл ачааллахад алдаа гарлаа</div>
        ) : (
          <>
            {/* ═══ Metric Cards ═══ */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <StatCard icon={<Users className="w-6 h-6" />} label="Нийт хэрэглэгч" value={stats.totalUsers} gradient="indigo" />
              <StatCard icon={<Store className="w-6 h-6" />} label="Нийт дэлгүүр" value={stats.totalShops} gradient="green" />
              <StatCard icon={<Package className="w-6 h-6" />} label="Нийт бараа" value={stats.totalProducts} gradient="pink" />
              <StatCard icon={<ShoppingBag className="w-6 h-6" />} label="Нийт захиалга" value={stats.totalOrders} gradient="amber" />
              <StatCard icon={<Wallet className="w-6 h-6" />} label="Өнөөдрийн орлого" value={formatMNT(stats.todayRevenue)} gradient="green" animate={false} />
              <StatCard icon={<Clock className="w-6 h-6" />} label="Хүлээгдэж буй payout" value={formatMNT(stats.pendingPayout)} gradient="amber" animate={false} />
            </div>

            {/* ═══ Charts Row ═══ */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Line Chart — Orders last 30 days */}
              <div className="lg:col-span-2 bg-dash-card border border-dash-border rounded-2xl p-6">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-dash-accent" /> Сүүлийн 30 хоногийн захиалга
                </h3>
                {stats.dailyChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={stats.dailyChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#1E1E2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="orders" stroke="#6366F1" strokeWidth={2} dot={false} name="Захиалга" />
                      <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} dot={false} name="Орлого" yAxisId={0} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-16 text-white/20 text-sm">Захиалгын өгөгдөл байхгүй</div>
                )}
              </div>

              {/* Pie Chart — Revenue by source */}
              <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-400" /> Орлогын эх үүсвэр
                </h3>
                {stats.revenuePie.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={stats.revenuePie.map(p => ({ ...p, name: SOURCE_LABELS[p.name] || p.name }))}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                        paddingAngle={3} dataKey="value"
                      >
                        {stats.revenuePie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1E1E2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                        formatter={(value: number) => formatMNT(value)}
                      />
                      <Legend
                        verticalAlign="bottom"
                        formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-16 text-white/20 text-sm">Орлогын бүртгэл байхгүй</div>
                )}
              </div>
            </div>

            {/* ═══ Bottom Row ═══ */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Role breakdown */}
              <div className="bg-dash-card border border-dash-border rounded-2xl">
                <div className="px-6 py-4 border-b border-dash-border">
                  <h3 className="text-white/80 text-sm font-bold flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Хэрэглэгчийн тоо
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  {Object.entries(roleLabels).map(([role, { label, icon }]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm text-white/60 flex items-center gap-2">{icon} {label}</span>
                      <span className="text-sm font-bold text-white bg-white/5 px-3 py-1 rounded-lg">
                        {stats.roles?.[role] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="bg-dash-card border border-dash-border rounded-2xl">
                <div className="px-6 py-4 border-b border-dash-border">
                  <h3 className="text-white/80 text-sm font-bold flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Хурдан тоймо
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60 flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Ангилал</span>
                    <span className="text-sm font-bold text-white bg-white/5 px-3 py-1 rounded-lg">{stats.totalCategories}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60 flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5" /> Идэвхтэй чат</span>
                    <span className="text-sm font-bold text-white bg-white/5 px-3 py-1 rounded-lg">{stats.activeChats}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Нээлттэй маргаан</span>
                    <span className="text-sm font-bold text-white bg-white/5 px-3 py-1 rounded-lg">{stats.pendingDisputes}</span>
                  </div>
                </div>
              </div>

              {/* Today's summary */}
              <div className="bg-dash-card border border-dash-border rounded-2xl">
                <div className="px-6 py-4 border-b border-dash-border">
                  <h3 className="text-white/80 text-sm font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-green-400" /> Өнөөдрийн тойм
                  </h3>
                </div>
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-black text-green-400">{formatMNT(stats.todayRevenue)}</div>
                    <div className="text-xs text-white/30 mt-1">Өнөөдрийн нийт орлого</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[.03] rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-white">{stats.totalOrders}</div>
                      <div className="text-[10px] text-white/30">Нийт захиалга</div>
                    </div>
                    <div className="bg-white/[.03] rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-amber-400">{formatMNT(stats.pendingPayout)}</div>
                      <div className="text-[10px] text-white/30">Хүлээгдэж буй</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
