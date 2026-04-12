'use client';

import { useEffect, useState } from 'react';
import { OrdersAPI, type Order } from '@/lib/api';
import { formatPrice, STATUS_MAP } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/shared/Toast';
import { Truck, Package, CheckCircle, Clock, DollarSign, BarChart3, MapPin, Phone, Map, Navigation } from 'lucide-react';

interface RevenueStats {
  todayRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  totalDeliveries: number;
}

const STATS_CONFIG = [
  { key: 'todayRevenue', label: 'Өнөөдрийн орлого', icon: DollarSign, color: '#E8242C', format: 'price' },
  { key: 'monthRevenue', label: 'Сарын орлого', icon: BarChart3, color: '#2563EB', format: 'price' },
  { key: 'pending', label: 'Хүлээгдэж буй', icon: Clock, color: '#D97706', format: 'count' },
  { key: 'shipping', label: 'Хүргэлтэнд', icon: Truck, color: '#16A34A', format: 'count' },
  { key: 'delivered', label: 'Хүргэгдсэн', icon: CheckCircle, color: '#16A34A', format: 'count' },
  { key: 'total', label: 'Нийт захиалга', icon: Package, color: '#7C3AED', format: 'count' },
] as const;

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);

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
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status } as Order : o));
    try {
      await OrdersAPI.updateStatus(id, status);
      toast.show('Төлөв шинэчлэгдлээ', 'ok');
    } catch {
      toast.show('Алдаа гарлаа', 'error');
      loadOrders();
    }
  }

  const shipped = orders.filter(o => o.status === 'shipped');
  const delivered = orders.filter(o => o.status === 'delivered');
  const confirmed = orders.filter(o => o.status === 'confirmed');
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const activeOrder = [...shipped, ...confirmed][0];
  const addr = activeOrder?.delivery?.address;
  const mapsAddress = addr ? [addr.district, addr.street, addr.building].filter(Boolean).join(', ') + ', Улаанбаатар' : null;

  // Stat values
  const statValues: Record<string, string | number> = {
    todayRevenue: revenue ? `${revenue.todayRevenue.toLocaleString()}₮` : '—',
    monthRevenue: revenue ? `${revenue.monthRevenue.toLocaleString()}₮` : '—',
    pending: confirmed.length,
    shipping: shipped.length,
    delivered: delivered.length,
    total: orders.length,
  };

  return (
    <div>
      {/* Topbar */}
      <div className="px-8 py-5 border-b" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
        <h1 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--esl-text-primary)' }}>
          <Truck className="w-5 h-5" style={{ color: '#E8242C' }} /> Жолоочийн самбар
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--esl-text-muted)' }}>Хүргэлтийн удирдлага</p>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          {STATS_CONFIG.map(s => (
            <div key={s.key} className="p-4 rounded-xl" style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + '15' }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-xl font-black" style={{ color: 'var(--esl-text-primary)' }}>{statValues[s.key]}</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--esl-text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit mb-6" style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)' }}>
          {[
            { id: 'all', label: 'Бүгд' },
            { id: 'confirmed', label: 'Баталгаажсан' },
            { id: 'shipped', label: 'Явж байгаа' },
            { id: 'delivered', label: 'Хүргэгдсэн' },
          ].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className="px-4 py-2 rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
              style={{
                background: filter === t.id ? '#E8242C' : 'transparent',
                color: filter === t.id ? '#fff' : 'var(--esl-text-muted)',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)' }}>
          {loading ? (
            <div className="p-12 text-center text-sm" style={{ color: 'var(--esl-text-muted)' }}>Ачааллаж байна...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--esl-text-muted)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--esl-text-muted)' }}>Захиалга байхгүй</p>
            </div>
          ) : (
            <div>
              {filtered.map(o => {
                const [cls, label] = STATUS_MAP[o.status] || ['', o.status];
                const address = o.delivery?.address;
                const addrStr = address ? [address.district, address.street, address.building].filter(Boolean).join(', ') : null;
                return (
                  <div key={o._id} className="p-4 hover:opacity-90 transition" style={{ borderBottom: '1px solid var(--esl-border)' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold" style={{ color: '#E8242C' }}>#{o.orderNumber || o._id?.slice(-5)}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cls}`}>{label}</span>
                        </div>
                        <p className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>{o.user?.name || '—'}</p>
                        {o.delivery?.phone && (
                          <p className="text-xs flex items-center gap-1 mt-1" style={{ color: 'var(--esl-text-muted)' }}>
                            <Phone className="w-3 h-3" /> {o.delivery.phone}
                          </p>
                        )}
                        {addrStr && (
                          <a href={`https://maps.google.com?q=${encodeURIComponent(addrStr + ', Улаанбаатар')}`}
                            target="_blank" rel="noopener"
                            className="text-xs flex items-center gap-1 mt-1 no-underline hover:underline"
                            style={{ color: '#2563EB' }}>
                            <MapPin className="w-3 h-3" /> {addrStr}
                          </a>
                        )}
                        <p className="text-[11px] mt-1" style={{ color: 'var(--esl-text-muted)' }}>
                          {(o.items || []).map(i => i.product?.name || i.name || '').filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black mb-2" style={{ color: 'var(--esl-text-primary)' }}>{formatPrice(o.total || 0)}</p>
                        {o.status === 'confirmed' && (
                          <button onClick={() => updateStatus(o._id, 'shipped')}
                            className="text-white text-xs font-bold px-4 py-2 rounded-xl border-none cursor-pointer transition"
                            style={{ background: '#2563EB' }}>
                            <Truck className="w-3.5 h-3.5 inline mr-1" /> Хүргэлтэнд
                          </button>
                        )}
                        {o.status === 'shipped' && (
                          <button onClick={() => updateStatus(o._id, 'delivered')}
                            className="text-white text-xs font-bold px-4 py-2 rounded-xl border-none cursor-pointer transition"
                            style={{ background: '#16A34A' }}>
                            <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Хүргэгдсэн
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

        {/* GPS */}
        <div className="mt-6 rounded-xl p-6 text-center" style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)' }}>
          <Map className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--esl-text-primary)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--esl-text-primary)' }}>GPS чиглэл</p>
          <p className="text-xs mt-1 mb-3" style={{ color: 'var(--esl-text-muted)' }}>Mobile app-д бүрэн газрын зураг харагдана</p>
          {mapsAddress && (
            <a href={`https://maps.google.com?q=${encodeURIComponent(mapsAddress)}`} target="_blank" rel="noopener"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white no-underline"
              style={{ background: '#E8242C' }}>
              <Navigation className="w-4 h-4 inline mr-1" /> Google Maps-д харах →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
