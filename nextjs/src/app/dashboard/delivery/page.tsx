'use client';

import { useEffect, useState } from 'react';
import { OrdersAPI, type Order } from '@/lib/api';
import { formatPrice, STATUS_MAP } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import StatCard from '@/components/dashboard/StatCard';
import { useToast } from '@/components/shared/Toast';

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [revenue, setRevenue] = useState<{ todayRevenue: number; monthRevenue: number; totalRevenue: number; totalDeliveries: number } | null>(null);

  useEffect(() => {
    loadOrders();
    loadRevenue();
  }, []);

  async function loadRevenue() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/driver/revenue', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setRevenue(d.data); }
    } catch {}
  }

  async function loadOrders() {
    try {
      const data = await OrdersAPI.list();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await OrdersAPI.updateStatus(id, status);
      toast.show('✅ Төлөв шинэчлэгдлээ');
      loadOrders();
    } catch {
      toast.show('Алдаа гарлаа', 'error');
    }
  }

  const shipped = orders.filter((o) => o.status === 'shipped');
  const delivered = orders.filter((o) => o.status === 'delivered');
  const confirmed = orders.filter((o) => o.status === 'confirmed');
  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      {/* Topbar */}
      <div className="bg-dash-sidebar border-b border-dash-border px-8 py-4">
        <h1 className="text-white text-lg font-black">🚚 Жолоочийн самбар</h1>
        <p className="text-white/35 text-xs mt-0.5">Хүргэлтийн удирдлага</p>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="💰" label="Өнөөдрийн орлого" value={revenue ? `${revenue.todayRevenue.toLocaleString()}₮` : '—'} gradient="green" />
          <StatCard icon="📊" label="Сарын орлого" value={revenue ? `${revenue.monthRevenue.toLocaleString()}₮` : '—'} gradient="amber" />
          <StatCard icon="📦" label="Хүлээгдэж буй" value={confirmed.length} gradient="indigo" />
          <StatCard icon="🚚" label="Хүргэлтэнд" value={shipped.length} gradient="pink" />
          <StatCard icon="✅" label="Хүргэгдсэн" value={delivered.length} gradient="green" />
          <StatCard icon="📊" label="Нийт захиалга" value={orders.length} gradient="amber" />
        </div>

        {/* Filter */}
        <div className="flex gap-1 bg-dash-card border border-dash-border rounded-2xl p-1 w-fit mb-6">
          {[
            { id: 'all', label: 'Бүгд' },
            { id: 'confirmed', label: '✅ Баталгаажсан' },
            { id: 'shipped', label: '🚚 Явж байгаа' },
            { id: 'delivered', label: '📦 Хүргэгдсэн' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-all ${
                filter === t.id ? 'bg-dash-accent text-white' : 'bg-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="bg-dash-card border border-dash-border rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white/30 text-sm">Ачааллаж байна...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-white/30">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm font-semibold">Захиалга байхгүй</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[.04]">
              {filtered.map((o) => {
                const [cls, label] = STATUS_MAP[o.status] || ['bg-[var(--esl-bg-section)]0/15 text-[var(--esl-text-muted)]', o.status];
                const address = o.delivery?.address;
                return (
                  <div key={o._id} className="p-5 hover:bg-white/[.02] transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-xs text-brand font-bold">#{o.orderNumber || o._id?.slice(-5)}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${cls}`}>{label}</span>
                        </div>
                        <div className="text-sm text-white font-bold">{o.user?.name || '—'}</div>
                        {o.delivery?.phone && (
                          <div className="text-xs text-white/40 mt-1">📞 {o.delivery.phone}</div>
                        )}
                        {address && (
                          <div className="text-xs text-white/30 mt-1">
                            📍 {[address.district, address.street, address.building].filter(Boolean).join(', ')}
                          </div>
                        )}
                        <div className="text-xs text-white/25 mt-1">
                          {(o.items || []).map((i) => i.product?.name || i.name || '').filter(Boolean).join(', ')}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-white mb-2">{formatPrice(o.total || 0)}</div>
                        {o.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(o._id, 'shipped')}
                            className="bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl border-none cursor-pointer hover:bg-blue-600 transition"
                          >
                            🚚 Хүргэлтэнд
                          </button>
                        )}
                        {o.status === 'shipped' && (
                          <button
                            onClick={() => updateStatus(o._id, 'delivered')}
                            className="bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl border-none cursor-pointer hover:bg-green-600 transition"
                          >
                            ✅ Хүргэгдсэн
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* GPS Map placeholder */}
        <div className="mt-8 rounded-2xl p-6 text-center" style={{ background: 'var(--esl-bg-section)', border: '1px solid var(--esl-border)' }}>
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-sm font-semibold" style={{ color: 'var(--esl-text-primary)' }}>Газрын зураг</p>
          <p className="text-xs mt-1" style={{ color: 'var(--esl-text-muted)' }}>Mobile app-д GPS route харагдана</p>
        </div>
      </div>
    </div>
  );
}
