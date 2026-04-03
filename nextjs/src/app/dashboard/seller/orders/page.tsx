'use client';

import { useState, useEffect, useMemo } from 'react';
import { OrdersAPI, Order } from '@/lib/api';
import { formatPrice, STATUS_MAP, timeAgo } from '@/lib/utils';
import { useToast } from '@/components/shared/Toast';
import StatCard from '@/components/dashboard/StatCard';

type OrderFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';

const FILTER_TABS: { key: OrderFilter; label: string }[] = [
  { key: 'all', label: 'Бүгд' },
  { key: 'pending', label: '⏳ Хүлээгдэж буй' },
  { key: 'confirmed', label: '✅ Баталгаажсан' },
  { key: 'preparing', label: '👨‍🍳 Бэлтгэж байна' },
  { key: 'ready', label: '📦 Бэлэн' },
  { key: 'delivering', label: '🚚 Хүргэж байна' },
  { key: 'delivered', label: '✓ Хүргэгдсэн' },
];

const LIGHT_STATUS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-indigo-100 text-indigo-700',
  delivering: 'bg-blue-100 text-blue-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const MOCK_ORDERS: Order[] = [
  { _id: '1', orderNumber: 'ORD-1001', user: { name: 'Бат-Эрдэнэ' }, items: [{ name: 'Premium цагаан цамц', price: 35000, quantity: 2 }], total: 70000, status: 'pending', referralCode: 'REF123', delivery: { phone: '99112233', address: { district: 'СБД', street: '1-р хороо', building: '45-р байр' } }, createdAt: '2026-04-02T10:00:00Z' },
  { _id: '2', orderNumber: 'ORD-1002', user: { name: 'Сарангэрэл' }, items: [{ name: 'Bluetooth чихэвч', price: 99000, quantity: 1 }], total: 99000, status: 'confirmed', delivery: { phone: '88001122', address: { district: 'БЗД', street: '3-р хороо', building: '12-р байр' } }, createdAt: '2026-04-01T14:30:00Z' },
  { _id: '3', orderNumber: 'ORD-1003', user: { name: 'Ганбаатар' }, items: [{ name: 'Sporty гутал Air', price: 69000, quantity: 1 }, { name: 'Designer малгай', price: 22000, quantity: 1 }], total: 91000, status: 'shipped', referralCode: 'AFF456', delivery: { phone: '95554433', address: { district: 'ЧД', street: '5-р хороо', building: '8-р байр' } }, createdAt: '2026-03-30T09:15:00Z' },
  { _id: '4', orderNumber: 'ORD-1004', user: { name: 'Оюунчимэг' }, items: [{ name: 'Нүүрний крем SPF50', price: 28000, quantity: 3 }], total: 84000, status: 'delivered', delivery: { phone: '99887766', address: { district: 'ХУД', street: '2-р хороо', building: '33-р байр' } }, createdAt: '2026-03-28T16:45:00Z' },
  { _id: '5', orderNumber: 'ORD-1005', user: { name: 'Тэмүүлэн' }, items: [{ name: 'Yoga mat pro', price: 44000, quantity: 1 }], total: 44000, status: 'pending', delivery: { phone: '88776655', address: { district: 'СХД', street: '7-р хороо', building: '20-р байр' } }, createdAt: '2026-04-03T08:00:00Z' },
  { _id: '6', orderNumber: 'ORD-1006', user: { name: 'Болормаа' }, items: [{ name: 'Leather цүнх', price: 75000, quantity: 1 }], total: 75000, status: 'confirmed', referralCode: 'REF789', delivery: { phone: '99665544', address: { district: 'БГД', street: '4-р хороо', building: '15-р байр' } }, createdAt: '2026-04-02T11:20:00Z' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await OrdersAPI.list();
      setOrders(res.orders?.length ? res.orders : MOCK_ORDERS);
    } catch {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const revenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0);
    const today = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
    return { total, pending, revenue, today };
  }, [orders]);

  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      await OrdersAPI.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as Order['status'] } : o)));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus as Order['status'] } : null);
      }
      toast.show('Захиалгын төлөв шинэчлэгдлээ', 'ok');
    } catch {
      toast.show('Төлөв шинэчлэхэд алдаа гарлаа', 'error');
    }
  }

  const statusLabel = (s: string) => {
    const map = STATUS_MAP[s];
    return map ? map[1] : s;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse mb-3" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Захиалгын удирдлага</h1>
        <p className="text-gray-500 mt-1">Бүх захиалгуудыг хянах, төлөв өөрчлөх</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon="📋" label="Нийт захиалга" value={stats.total} gradient="indigo" />
        <StatCard icon="⏳" label="Хүлээгдэж буй" value={stats.pending} gradient="amber" />
        <StatCard icon="📦" label="Өнөөдрийн" value={stats.today} gradient="pink" />
        <StatCard icon="💰" label="Хүргэгдсэн орлого" value={formatPrice(stats.revenue)} gradient="green" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({orders.filter((o) => o.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-lg font-semibold text-gray-700">Захиалга олдсонгүй</h3>
            <p className="text-gray-400 mt-1">Энэ төлөвт захиалга байхгүй байна</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Дугаар</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Захиалагч</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Дүн</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Төлөв</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Реферал</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Огноо</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-4 font-mono text-sm font-semibold text-indigo-600">
                      {order.orderNumber || order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-4 text-sm text-gray-700">{order.user?.name || order.buyer?.name || 'Хэрэглэгч'}</td>
                    <td className="p-4 text-sm font-semibold text-gray-900">{formatPrice(order.total || 0)}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${LIGHT_STATUS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      {order.referralCode ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-medium">
                          🔗 {order.referralCode}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500">{timeAgo(order.createdAt)}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="pending">⏳ Хүлээгдэж буй</option>
                        <option value="confirmed">✅ Баталгаажсан</option>
                        <option value="preparing">👨‍🍳 Бэлтгэж байна</option>
                        <option value="ready">📦 Бэлэн</option>
                        <option value="delivering">🚚 Хүргэж байна</option>
                        <option value="delivered">✓ Хүргэгдсэн</option>
                        <option value="cancelled">❌ Цуцлагдсан</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Захиалга #{selectedOrder.orderNumber || selectedOrder._id.slice(-6).toUpperCase()}
                </h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Customer */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Захиалагч</h3>
                <p className="text-gray-900 font-medium">{selectedOrder.user?.name || selectedOrder.buyer?.name || 'Хэрэглэгч'}</p>
                {selectedOrder.delivery?.phone && <p className="text-sm text-gray-500">📞 {selectedOrder.delivery.phone}</p>}
              </div>

              {/* Delivery Address */}
              {selectedOrder.delivery?.address && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Хүргэлтийн хаяг</h3>
                  <p className="text-gray-700 text-sm">
                    {[selectedOrder.delivery.address.district, selectedOrder.delivery.address.street, selectedOrder.delivery.address.building].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Бүтээгдэхүүн</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name || item.product?.name || 'Бүтээгдэхүүн'}</p>
                        <p className="text-xs text-gray-500">x{item.quantity || 1}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center bg-indigo-50 rounded-lg p-4">
                <span className="font-semibold text-gray-700">Нийт дүн</span>
                <span className="text-xl font-bold text-indigo-600">{formatPrice(selectedOrder.total || 0)}</span>
              </div>

              {/* Referral */}
              {selectedOrder.referralCode && (
                <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-3">
                  <span className="text-purple-600">🔗</span>
                  <span className="text-sm text-purple-700">Реферал код: <strong>{selectedOrder.referralCode}</strong></span>
                </div>
              )}

              {/* Status Update */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Төлөв шинэчлэх</h3>
                <div className="flex gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">⏳ Хүлээгдэж буй</option>
                    <option value="confirmed">✅ Баталгаажсан</option>
                    <option value="shipped">🚚 Явсан</option>
                    <option value="delivered">📦 Хүргэгдсэн</option>
                    <option value="cancelled">❌ Цуцлагдсан</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
