'use client';

import { useEffect, useState } from 'react';
import { AdminAPI, OrdersAPI, type Order } from '@/lib/api';
import { formatPrice, STATUS_MAP } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import StatCard from '@/components/dashboard/StatCard';
import { useToast } from '@/components/shared/Toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<'dashboard' | 'users' | 'orders' | 'commission'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [commission, setCommission] = useState({ platform: 5, affiliate: 15 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [s, u, o, c] = await Promise.all([
        AdminAPI.getStats().catch(() => null),
        AdminAPI.getUsers().catch(() => ({ users: [] })),
        OrdersAPI.list().catch(() => ({ orders: [] })),
        AdminAPI.getCommission().catch(() => null),
      ]);
      setStats(s);
      setUsers((u as any)?.users || []);
      setOrders((o as any)?.orders || o || []);
      if (c) setCommission(c as any);
    } catch {} finally {
      setLoading(false);
    }
  }

  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = orders.length;
  const totalUsers = users.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const tabs = [
    { id: 'dashboard', label: '📊 Самбар' },
    { id: 'users', label: '👥 Хэрэглэгчид' },
    { id: 'orders', label: '📦 Захиалгууд' },
    { id: 'commission', label: '💰 Комисс' },
  ] as const;

  async function updateOrderStatus(id: string, status: string) {
    try {
      await OrdersAPI.updateStatus(id, status);
      toast.show('✅ Төлөв шинэчлэгдлээ');
      loadData();
    } catch { toast.show('Алдаа гарлаа', 'error'); }
  }

  async function saveCommission() {
    try {
      await AdminAPI.updateCommission(commission);
      toast.show('✅ Комисс хадгалагдлаа');
    } catch { toast.show('Алдаа гарлаа', 'error'); }
  }

  return (
    <div>
      {/* Topbar */}
      <div className="bg-dash-sidebar border-b border-dash-border px-8 py-4">
        <h1 className="text-white text-lg font-black">🔧 Админ самбар</h1>
        <p className="text-white/35 text-xs mt-0.5">Платформын удирдлага</p>
      </div>

      {/* Tab nav */}
      <div className="px-8 pt-6">
        <div className="flex gap-1 bg-dash-card border border-dash-border rounded-2xl p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all ${
                tab === t.id ? 'bg-dash-accent text-white' : 'bg-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* Dashboard */}
        {tab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon="💰" label="Нийт орлого" value={formatPrice(totalRevenue)} gradient="indigo" animate={false} />
              <StatCard icon="📦" label="Нийт захиалга" value={totalOrders} gradient="pink" />
              <StatCard icon="👥" label="Хэрэглэгчид" value={totalUsers} gradient="green" />
              <StatCard icon="⏳" label="Хүлээгдэж буй" value={pendingOrders} gradient="amber" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent orders */}
              <div className="bg-dash-card border border-dash-border rounded-2xl">
                <div className="px-6 py-4 border-b border-dash-border">
                  <h3 className="text-white/80 text-sm font-bold">🕐 Сүүлийн захиалгууд</h3>
                </div>
                <div className="p-4 space-y-2">
                  {orders.slice(0, 5).map((o) => {
                    const [cls, label] = STATUS_MAP[o.status] || ['bg-gray-500/15 text-gray-400', o.status];
                    return (
                      <div key={o._id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[.02] transition">
                        <div>
                          <div className="text-sm text-white font-bold">#{o.orderNumber || o._id?.slice(-5)}</div>
                          <div className="text-xs text-white/35">{o.user?.name || '—'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-white">{formatPrice(o.total || 0)}</div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cls}`}>{label}</span>
                        </div>
                      </div>
                    );
                  })}
                  {orders.length === 0 && <div className="text-center text-white/30 py-8 text-sm">Захиалга байхгүй</div>}
                </div>
              </div>

              {/* User breakdown */}
              <div className="bg-dash-card border border-dash-border rounded-2xl">
                <div className="px-6 py-4 border-b border-dash-border">
                  <h3 className="text-white/80 text-sm font-bold">👥 Хэрэглэгчийн тоо</h3>
                </div>
                <div className="p-6 space-y-3">
                  {['buyer', 'seller', 'affiliate', 'delivery', 'admin'].map((role) => {
                    const count = users.filter((u) => u.role === role).length;
                    const labels: Record<string, string> = { buyer: '🛍️ Худалдан авагч', seller: '🏪 Дэлгүүр эзэн', affiliate: '📢 Борлуулагч', delivery: '🚚 Жолооч', admin: '🔧 Админ' };
                    return (
                      <div key={role} className="flex items-center justify-between">
                        <span className="text-sm text-white/60">{labels[role]}</span>
                        <span className="text-sm font-bold text-white bg-white/5 px-3 py-1 rounded-lg">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div className="bg-dash-card border border-dash-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[.03]">
                    {['Нэр', 'Имэйл', 'Үүрэг', 'Бүртгүүлсэн'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-[11px] font-bold text-white/40 border-b border-dash-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u._id} className="border-b border-white/[.04] hover:bg-white/[.02]">
                      <td className="px-6 py-3 text-white font-bold">{u.name}</td>
                      <td className="px-6 py-3 text-white/50">{u.email}</td>
                      <td className="px-6 py-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-dash-accent/15 text-dash-accent">{u.role}</span>
                      </td>
                      <td className="px-6 py-3 text-white/35 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('mn-MN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && <div className="text-center text-white/30 py-12 text-sm">Хэрэглэгч байхгүй</div>}
          </div>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="bg-dash-card border border-dash-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[.03]">
                    {['№', 'Хэрэглэгч', 'Дүн', 'Төлөв', 'Өөрчлөх', 'Огноо'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-[11px] font-bold text-white/40 border-b border-dash-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 50).map((o) => {
                    const [cls, label] = STATUS_MAP[o.status] || ['bg-gray-500/15 text-gray-400', o.status];
                    return (
                      <tr key={o._id} className="border-b border-white/[.04] hover:bg-white/[.02]">
                        <td className="px-6 py-3 font-mono text-xs text-brand font-bold">#{o.orderNumber || o._id?.slice(-5)}</td>
                        <td className="px-6 py-3 text-white/80">{o.user?.name || '—'}</td>
                        <td className="px-6 py-3 font-black text-white">{formatPrice(o.total || 0)}</td>
                        <td className="px-6 py-3"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${cls}`}>{label}</span></td>
                        <td className="px-6 py-3">
                          <select
                            defaultValue={o.status}
                            onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                            className="bg-dash-elevated text-white border border-dash-border rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                          >
                            {Object.entries(STATUS_MAP).map(([k, [, l]]) => (
                              <option key={k} value={k}>{l}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-3 text-white/35 text-xs">{new Date(o.createdAt).toLocaleDateString('mn-MN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {orders.length === 0 && <div className="text-center text-white/30 py-12 text-sm">Захиалга байхгүй</div>}
          </div>
        )}

        {/* Commission tab */}
        {tab === 'commission' && (
          <div className="max-w-lg">
            <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
              <h3 className="text-white font-bold mb-6">💰 Комиссын тохиргоо</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Платформын комисс (%)</label>
                  <input
                    type="number"
                    value={commission.platform}
                    onChange={(e) => setCommission({ ...commission, platform: Number(e.target.value) })}
                    className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Үндсэн affiliate комисс (%)</label>
                  <input
                    type="number"
                    value={commission.affiliate}
                    onChange={(e) => setCommission({ ...commission, affiliate: Number(e.target.value) })}
                    className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent"
                  />
                </div>
                <button
                  onClick={saveCommission}
                  className="w-full bg-dash-accent text-white py-3 rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-[#4F46E5] transition-all"
                >
                  Хадгалах
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
