'use client';

import { useState } from 'react';
import { formatPrice, cn } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';
import { useToast } from '@/components/shared/Toast';
import {
  DollarSign, Clock, TrendingUp, ShoppingBag, CreditCard, Search, Filter,
} from 'lucide-react';

/* ═══ Demo Data ═══ */
interface Commission {
  id: string;
  orderId: string;
  productName: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

const DEMO_COMMISSIONS: Commission[] = [
  { id: 'c1', orderId: 'ORD-2841', productName: 'iPhone 15 Pro', orderAmount: 3800000, commissionRate: 15, commissionAmount: 570000, status: 'paid', createdAt: '2026-04-01', paidAt: '2026-04-03' },
  { id: 'c2', orderId: 'ORD-2856', productName: 'Cashmere цамц', orderAmount: 89000, commissionRate: 12, commissionAmount: 10680, status: 'paid', createdAt: '2026-04-02', paidAt: '2026-04-04' },
  { id: 'c3', orderId: 'ORD-2870', productName: 'Yoga mat pro', orderAmount: 55000, commissionRate: 15, commissionAmount: 8250, status: 'confirmed', createdAt: '2026-04-03' },
  { id: 'c4', orderId: 'ORD-2891', productName: 'Wireless earbuds', orderAmount: 65000, commissionRate: 15, commissionAmount: 9750, status: 'confirmed', createdAt: '2026-04-04' },
  { id: 'c5', orderId: 'ORD-2903', productName: 'Face serum', orderAmount: 45000, commissionRate: 10, commissionAmount: 4500, status: 'pending', createdAt: '2026-04-05' },
  { id: 'c6', orderId: 'ORD-2910', productName: 'Bluetooth speaker', orderAmount: 85000, commissionRate: 10, commissionAmount: 8500, status: 'pending', createdAt: '2026-04-05' },
  { id: 'c7', orderId: 'ORD-2780', productName: 'Арьсан цүнх', orderAmount: 145000, commissionRate: 12, commissionAmount: 17400, status: 'cancelled', createdAt: '2026-03-28' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Хүлээгдэж буй', color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  confirmed: { label: 'Баталгаажсан', color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
  paid: { label: 'Төлөгдсөн', color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
  cancelled: { label: 'Цуцлагдсан', color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
};

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'paid' | 'cancelled';

export default function AffiliateCommissionsPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [requesting, setRequesting] = useState(false);

  const filtered = DEMO_COMMISSIONS.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search && !c.productName.toLowerCase().includes(search.toLowerCase()) && !c.orderId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalEarned = DEMO_COMMISSIONS.filter(c => c.status !== 'cancelled').reduce((s, c) => s + c.commissionAmount, 0);
  const thisMonth = DEMO_COMMISSIONS.filter(c => c.createdAt >= '2026-04-01' && c.status !== 'cancelled').reduce((s, c) => s + c.commissionAmount, 0);
  const pendingAmount = DEMO_COMMISSIONS.filter(c => c.status === 'pending').reduce((s, c) => s + c.commissionAmount, 0);
  const totalSales = DEMO_COMMISSIONS.filter(c => c.status !== 'cancelled').length;

  const handlePayoutRequest = async () => {
    if (!payoutPhone || payoutPhone.length < 8) { toast.show('Утасны дугаараа оруулна уу', 'error'); return; }
    setRequesting(true);
    setTimeout(() => {
      toast.show('Хүсэлт илгээгдлээ! 24 цагийн дотор шилжүүлнэ.', 'ok');
      setRequesting(false);
      setPayoutPhone('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--esl-text-primary)' }}>Комиссын тайлан</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--esl-text-muted)' }}>Борлуулалтын орлого, төлбөрийн мэдээлэл</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💰" label="Нийт орлого" value={formatPrice(totalEarned)} variant="primary" />
        <StatCard icon="📈" label="Энэ сарын" value={formatPrice(thisMonth)} variant="success" />
        <StatCard icon="⏳" label="Хүлээгдэж буй" value={formatPrice(pendingAmount)} variant="warning" />
        <StatCard icon="🎯" label="Нийт борлуулалт" value={totalSales} variant="info" />
      </div>

      {/* Payout Request */}
      <div className="rounded-2xl border p-5" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-[#E8242C]" />
          <h3 className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>Мөнгө авах</h3>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--esl-text-muted)' }}>
          Баталгаажсан + төлөгдсөн комисс: <strong className="text-[#E8242C]">{formatPrice(totalEarned - pendingAmount)}</strong>
        </p>
        <div className="flex gap-2">
          <input type="tel" value={payoutPhone} onChange={e => setPayoutPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
            placeholder="QPay утасны дугаар"
            className="flex-1 h-10 px-4 rounded-xl border text-sm outline-none focus:border-[#E8242C]"
            style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
          <button onClick={handlePayoutRequest} disabled={requesting}
            className="px-5 h-10 rounded-xl text-sm font-bold bg-[#E8242C] text-white border-none cursor-pointer hover:bg-[#C41E25] transition whitespace-nowrap">
            {requesting ? 'Илгээж байна...' : 'Авахыг хүсэх'}
          </button>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--esl-bg-section)' }}>
          {(['all', 'pending', 'confirmed', 'paid', 'cancelled'] as StatusFilter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all ${
                filter === f ? 'bg-[var(--esl-bg-card)] text-[var(--esl-text-primary)] shadow-sm' : 'bg-transparent text-[var(--esl-text-muted)]'
              }`}>
              {f === 'all' ? 'Бүгд' : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--esl-text-muted)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Бараа, захиалга хайх..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border text-sm outline-none focus:border-[#E8242C]"
            style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--esl-border)' }}>
                {['Огноо', 'Захиалга', 'Бараа', 'Захиалгын дүн', 'Комисс %', 'Авсан дүн', 'Статус'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--esl-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-sm" style={{ color: 'var(--esl-text-muted)' }}>Мэдээлэл олдсонгүй</td></tr>
              ) : filtered.map(c => {
                const st = STATUS_CONFIG[c.status];
                return (
                  <tr key={c.id} className="hover:bg-[var(--esl-bg-section)] transition-colors" style={{ borderBottom: '1px solid var(--esl-border)' }}>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--esl-text-secondary)' }}>{c.createdAt}</td>
                    <td className="px-5 py-3 text-xs font-mono font-medium" style={{ color: 'var(--esl-text-primary)' }}>{c.orderId}</td>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: 'var(--esl-text-primary)' }}>{c.productName}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--esl-text-secondary)' }}>{formatPrice(c.orderAmount)}</td>
                    <td className="px-5 py-3 text-sm font-semibold" style={{ color: 'var(--esl-text-primary)' }}>{c.commissionRate}%</td>
                    <td className="px-5 py-3 text-sm font-bold text-[#E8242C]">{formatPrice(c.commissionAmount)}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
