'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, Truck, Check, X, ChevronDown, MapPin, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  items: OrderItem[];
  delivery?: { address?: string; phone?: string; note?: string };
  createdAt: string;
}

type FilterTab = 'all' | 'pending' | 'delivered' | 'cancelled';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Хүлээгдэж буй', color: '#F59E0B', icon: <Clock size={14} /> },
  confirmed:  { label: 'Баталгаажсан', color: '#3B82F6', icon: <Check size={14} /> },
  preparing:  { label: 'Бэлтгэж байна', color: '#8B5CF6', icon: <Package size={14} /> },
  delivering: { label: 'Хүргэж байна', color: '#F97316', icon: <Truck size={14} /> },
  delivered:  { label: 'Хүргэгдсэн', color: '#22C55E', icon: <Check size={14} /> },
  cancelled:  { label: 'Цуцлагдсан', color: '#EF4444', icon: <X size={14} /> },
};

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Бүгд' },
  { key: 'pending', label: 'Хүлээгдэж буй' },
  { key: 'delivered', label: 'Хүргэгдсэн' },
  { key: 'cancelled', label: 'Цуцлагдсан' },
];

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<FilterTab>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); setError('Нэвтэрнэ үү'); return; }

    fetch('/api/buyer/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) setOrders(res.data);
        else setError('Захиалга ачаалахад алдаа гарлаа');
      })
      .catch(() => setError('Сервертэй холбогдоход алдаа гарлаа'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all'
    ? orders
    : orders.filter(o => o.status === tab);

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: 'var(--esl-bg-page)' }}>
      <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--esl-text-primary)', marginBottom: 4 }}>
        Миний захиалгууд
      </h1>
      <p style={{ fontSize: 12, color: 'var(--esl-text-muted)', marginBottom: 20 }}>
        {orders.length} захиалга
      </p>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 10,
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: tab === t.key ? '#E8242C' : 'var(--esl-bg-card)',
              color: tab === t.key ? '#fff' : 'var(--esl-text-muted)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--esl-text-muted)' }}>
          <div style={{
            width: 32, height: 32, border: '3px solid var(--esl-border)',
            borderTopColor: '#E8242C', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          Ачааллаж байна...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#EF4444', fontSize: 14 }}>
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <ShoppingBag size={48} style={{ color: 'var(--esl-text-muted)', opacity: 0.3, margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--esl-text-muted)', fontSize: 14, marginBottom: 12 }}>
            Захиалга байхгүй байна
          </p>
          <Link
            href="/store"
            style={{
              display: 'inline-block', padding: '8px 20px', borderRadius: 10,
              background: '#E8242C', color: '#fff', fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Дэлгүүр үзэх
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(o => {
            const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
            const isOpen = expanded === o._id;

            return (
              <div
                key={o._id}
                style={{
                  background: 'var(--esl-bg-card)',
                  border: '1px solid var(--esl-border)',
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {/* Header — clickable */}
                <button
                  onClick={() => setExpanded(isOpen ? null : o._id)}
                  style={{
                    width: '100%', border: 'none', background: 'none', cursor: 'pointer',
                    padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--esl-text-primary)' }}>
                      #{o.orderNumber}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--esl-text-muted)', marginLeft: 10 }}>
                      {new Date(o.createdAt).toLocaleDateString('mn-MN')}
                    </span>
                    <div style={{ fontSize: 12, color: 'var(--esl-text-muted)', marginTop: 4 }}>
                      {o.items.length} бараа · <span style={{ fontWeight: 700, color: 'var(--esl-text-primary)' }}>{o.total.toLocaleString()}₮</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                      background: st.color + '18', color: st.color,
                    }}>
                      {st.icon} {st.label}
                    </span>
                    <ChevronDown
                      size={16}
                      style={{
                        color: 'var(--esl-text-muted)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--esl-border)' }}>
                    {o.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                          borderBottom: i < o.items.length - 1 ? '1px solid var(--esl-border)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: 13, color: 'var(--esl-text-primary)' }}>
                          {item.name} × {item.quantity}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--esl-text-primary)' }}>
                          {(item.price * item.quantity).toLocaleString()}₮
                        </span>
                      </div>
                    ))}

                    {o.delivery && (
                      <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'var(--esl-bg-page)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <MapPin size={14} style={{ color: '#E8242C' }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--esl-text-primary)' }}>Хүргэлтийн мэдээлэл</span>
                        </div>
                        {o.delivery.address && (
                          <p style={{ fontSize: 12, color: 'var(--esl-text-muted)', margin: '4px 0' }}>
                            {o.delivery.address}
                          </p>
                        )}
                        {o.delivery.phone && (
                          <p style={{ fontSize: 12, color: 'var(--esl-text-muted)', margin: '4px 0' }}>
                            Утас: {o.delivery.phone}
                          </p>
                        )}
                        {o.delivery.note && (
                          <p style={{ fontSize: 12, color: 'var(--esl-text-muted)', margin: '4px 0', fontStyle: 'italic' }}>
                            {o.delivery.note}
                          </p>
                        )}
                      </div>
                    )}

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--esl-border)',
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--esl-text-muted)' }}>Нийт дүн</span>
                      <span style={{ fontSize: 18, fontWeight: 900, color: '#E8242C' }}>
                        {o.total.toLocaleString()}₮
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
