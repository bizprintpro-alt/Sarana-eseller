'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { OrdersAPI, type Order } from '@/lib/api';
import { formatPrice, STATUS_MAP } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';
import { LoyaltyWidget } from '@/components/shared/LoyaltyWidget';
import Link from 'next/link';
import { Package, Wallet, Clock, CheckCircle, ShoppingCart } from 'lucide-react';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await OrdersAPI.list();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  const total = orders.length;
  const pending = orders.filter((o) => o.status === 'pending').length;
  const done = orders.filter((o) => o.status === 'delivered').length;
  const revenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="bg-[var(--esl-bg-card)] border-b border-[var(--esl-border)] px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[var(--esl-text-primary)]">
              Өдрийн мэнд, {user?.name?.split(' ')[0] || ''}! 👋
            </h1>
            <p className="text-sm text-[var(--esl-text-muted)] mt-0.5">Худалдан авагчийн самбар</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/store"
              className="bg-[var(--esl-bg-section)] text-[var(--esl-text-primary)] text-xs font-bold px-4 py-2 rounded-xl no-underline hover:bg-[var(--esl-bg-card-hover)] transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5 inline mr-1" /> Дэлгүүр
            </Link>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Loyalty */}
        <div className="mb-6">
          <LoyaltyWidget context="profile" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Package className="w-6 h-6" />} label="Нийт захиалга" value={total} variant="primary" />
          <StatCard icon={<Wallet className="w-6 h-6" />} label="Нийт зарцуулалт" value={formatPrice(revenue)} variant="info" animate={false} />
          <StatCard icon={<Clock className="w-6 h-6" />} label="Хүлээгдэж буй" value={pending} variant="warning" />
          <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Хүргэгдсэн" value={done} variant="success" />
        </div>

        {/* Recent Orders */}
        <div className="bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--esl-border)]">
            <h3 className="text-sm font-bold text-[var(--esl-text-primary)] flex items-center gap-1.5"><Clock className="w-4 h-4" /> Сүүлийн захиалгууд</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[var(--esl-text-muted)] text-sm">Ачааллаж байна...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-[var(--esl-text-muted)]">
              <Package className="w-10 h-10 mx-auto mb-3 text-[var(--esl-text-muted)]" />
              <p className="text-sm font-semibold">Захиалга байхгүй байна</p>
              <Link href="/store" className="text-brand text-xs font-bold no-underline mt-2 inline-block">
                Дэлгүүр рүү очих →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--esl-bg-section)]">
                    {['Дугаар', 'Дүн', 'Төлөв', 'Огноо'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-[11px] font-bold text-[var(--esl-text-muted)] border-b border-[var(--esl-border)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 12).map((o) => {
                    const [cls, label] = STATUS_MAP[o.status] || ['bg-[var(--esl-bg-section)] text-[var(--esl-text-secondary)]', o.status];
                    return (
                      <tr key={o._id} className="border-b border-[var(--esl-border)] hover:bg-[var(--esl-bg-section)] transition">
                        <td className="px-6 py-3 font-mono text-xs text-brand font-bold">
                          #{o.orderNumber || o._id?.slice(-6) || '—'}
                        </td>
                        <td className="px-6 py-3 font-black text-[var(--esl-text-primary)]">
                          {formatPrice(o.total || 0)}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg ${cls}`}>
                            {label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-[var(--esl-text-muted)] text-xs">
                          {new Date(o.createdAt).toLocaleDateString('mn-MN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
