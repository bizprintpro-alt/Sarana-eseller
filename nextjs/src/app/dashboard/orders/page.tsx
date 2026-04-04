'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, Truck, Check, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface Order {
  _id: string; orderNumber: string; total: number; status: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Хүлээгдэж буй', color: '#F59E0B', icon: <Clock size={14} /> },
  confirmed:  { label: 'Баталгаажсан', color: '#3B82F6', icon: <Check size={14} /> },
  preparing:  { label: 'Бэлтгэж байна', color: '#8B5CF6', icon: <Package size={14} /> },
  delivering: { label: 'Хүргэж байна', color: '#06B6D4', icon: <Truck size={14} /> },
  delivered:  { label: 'Хүргэгдсэн', color: '#22C55E', icon: <Check size={14} /> },
  cancelled:  { label: 'Цуцлагдсан', color: '#EF4444', icon: <X size={14} /> },
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Demo orders for now
    setOrders([
      { _id: '1', orderNumber: 'ORD-2604-1042', total: 69000, status: 'delivering', items: [{ name: 'Sporty гутал Air', price: 69000, quantity: 1 }], createdAt: new Date().toISOString() },
      { _id: '2', orderNumber: 'ORD-2604-1038', total: 53000, status: 'delivered', items: [{ name: 'Premium цамц', price: 35000, quantity: 1 }, { name: 'iPhone case', price: 18000, quantity: 1 }], createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">📦 Миний захиалгууд</h1>
        <p className="text-xs text-white/35 mt-0.5">{orders.length} захиалга</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30">Ачааллаж байна...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/30">Захиалга байхгүй</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => {
            const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
            return (
              <div key={o._id} className="bg-dash-card border border-dash-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-bold text-white">#{o.orderNumber}</span>
                    <span className="text-xs text-white/30 ml-3">{new Date(o.createdAt).toLocaleDateString('mn-MN')}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg" style={{ background: st.color + '15', color: st.color }}>
                    {st.icon} {st.label}
                  </span>
                </div>

                {o.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/[.04] last:border-0">
                    <span className="text-sm text-white/70">{item.name} × {item.quantity}</span>
                    <span className="text-sm font-bold text-white">{(item.price * item.quantity).toLocaleString()}₮</span>
                  </div>
                ))}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[.08]">
                  <span className="text-xs text-white/40">Нийт дүн</span>
                  <span className="text-lg font-black text-brand">{o.total.toLocaleString()}₮</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
