'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { OrdersAPI, type Order } from '@/lib/api';
import { formatPrice, STATUS_MAP } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';
import Link from 'next/link';

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
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">
              Өдрийн мэнд, {user?.name?.split(' ')[0] || ''}! 👋
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Худалдан авагчийн самбар</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/store"
              className="bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl no-underline hover:bg-gray-200 transition-all"
            >
              🛒 Дэлгүүр
            </Link>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📦" label="Нийт захиалга" value={total} gradient="indigo" />
          <StatCard icon="💰" label="Нийт зарцуулалт" value={formatPrice(revenue)} gradient="pink" animate={false} />
          <StatCard icon="⏳" label="Хүлээгдэж буй" value={pending} gradient="amber" />
          <StatCard icon="✅" label="Хүргэгдсэн" value={done} gradient="green" />
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-700">🕐 Сүүлийн захиалгууд</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Ачааллаж байна...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm font-semibold">Захиалга байхгүй байна</p>
              <Link href="/store" className="text-brand text-xs font-bold no-underline mt-2 inline-block">
                Дэлгүүр рүү очих →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {['Дугаар', 'Дүн', 'Төлөв', 'Огноо'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 border-b border-gray-200">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 12).map((o) => {
                    const [cls, label] = STATUS_MAP[o.status] || ['bg-gray-100 text-gray-500', o.status];
                    return (
                      <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-3 font-mono text-xs text-brand font-bold">
                          #{o.orderNumber || o._id?.slice(-6) || '—'}
                        </td>
                        <td className="px-6 py-3 font-black text-gray-900">
                          {formatPrice(o.total || 0)}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg ${cls}`}>
                            {label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-400 text-xs">
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
