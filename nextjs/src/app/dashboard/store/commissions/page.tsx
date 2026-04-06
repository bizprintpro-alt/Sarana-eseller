'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';
import { useToast } from '@/components/shared/Toast';
import {
  DollarSign, Users, TrendingUp, Crown, Search, Check,
} from 'lucide-react';

/* ═══ Demo Data ═══ */
interface SellerCommissionRow {
  id: string;
  sellerName: string;
  sellerUsername: string;
  salesCount: number;
  totalAmount: number;
  commissionRate: number;
  commissionTotal: number;
  pendingAmount: number;
  paidAmount: number;
  lastSaleDate: string;
}

const DEMO_SELLERS: SellerCommissionRow[] = [
  { id: 's1', sellerName: 'Э. Мөнхзул', sellerUsername: 'munkhzul', salesCount: 45, totalAmount: 2850000, commissionRate: 15, commissionTotal: 427500, pendingAmount: 67500, paidAmount: 360000, lastSaleDate: '2026-04-05' },
  { id: 's2', sellerName: 'Д. Ганбаатар', sellerUsername: 'ganbaa', salesCount: 28, totalAmount: 1540000, commissionRate: 10, commissionTotal: 154000, pendingAmount: 22000, paidAmount: 132000, lastSaleDate: '2026-04-04' },
  { id: 's3', sellerName: 'Б. Баяраа', sellerUsername: 'bayaraa', salesCount: 15, totalAmount: 975000, commissionRate: 15, commissionTotal: 146250, pendingAmount: 146250, paidAmount: 0, lastSaleDate: '2026-04-05' },
  { id: 's4', sellerName: 'Б. Тэмүүлэн', sellerUsername: 'temuulen', salesCount: 12, totalAmount: 680000, commissionRate: 10, commissionTotal: 68000, pendingAmount: 8500, paidAmount: 59500, lastSaleDate: '2026-04-03' },
  { id: 's5', sellerName: 'О. Сарантуяа', sellerUsername: 'sarantuya', salesCount: 8, totalAmount: 420000, commissionRate: 12, commissionTotal: 50400, pendingAmount: 50400, paidAmount: 0, lastSaleDate: '2026-04-02' },
];

export default function StoreCommissionsPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [sellers, setSellers] = useState(DEMO_SELLERS);
  const [payingId, setPayingId] = useState<string | null>(null);

  const totalPaid = sellers.reduce((s, r) => s + r.paidAmount, 0);
  const totalPending = sellers.reduce((s, r) => s + r.pendingAmount, 0);
  const thisMonth = sellers.reduce((s, r) => s + r.commissionTotal, 0);
  const topSeller = sellers.sort((a, b) => b.salesCount - a.salesCount)[0];

  const filtered = search
    ? sellers.filter(s => s.sellerName.toLowerCase().includes(search.toLowerCase()) || s.sellerUsername.includes(search.toLowerCase()))
    : sellers;

  const handlePay = (id: string) => {
    setPayingId(id);
    setTimeout(() => {
      setSellers(prev => prev.map(s => s.id === id ? { ...s, paidAmount: s.paidAmount + s.pendingAmount, pendingAmount: 0 } : s));
      toast.show('Төлбөр амжилттай!', 'ok');
      setPayingId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--esl-text-primary)' }}>Борлуулагчдын комисс</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--esl-text-muted)' }}>Борлуулагч бүрийн орлого, төлбөрийн тайлан</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💰" label="Нийт төлсөн комисс" value={formatPrice(totalPaid)} variant="primary" />
        <StatCard icon="👥" label="Идэвхтэй борлуулагч" value={sellers.length} variant="info" />
        <StatCard icon="⏳" label="Төлөгдөөгүй" value={formatPrice(totalPending)} variant="warning" />
        <StatCard icon="👑" label="Шилдэг борлуулагч" value={topSeller?.sellerName || '—'} variant="success" />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--esl-text-muted)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Борлуулагч хайх..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[#E8242C]"
          style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--esl-border)' }}>
                {['Борлуулагч', 'Борлуулалт', 'Нийт дүн', 'Комисс %', 'Нийт комисс', 'Төлөгдсөн', 'Үлдэгдэл', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--esl-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-[var(--esl-bg-section)] transition-colors" style={{ borderBottom: '1px solid var(--esl-border)' }}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[rgba(232,36,44,0.1)] flex items-center justify-center text-xs font-bold text-[#E8242C]">
                        {s.sellerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--esl-text-primary)' }}>{s.sellerName}</p>
                        <p className="text-[10px]" style={{ color: 'var(--esl-text-muted)' }}>@{s.sellerUsername}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--esl-text-primary)' }}>{s.salesCount}</td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--esl-text-secondary)' }}>{formatPrice(s.totalAmount)}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold" style={{ color: 'var(--esl-text-primary)' }}>{s.commissionRate}%</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-[#E8242C]">{formatPrice(s.commissionTotal)}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(22,163,74,0.1)', color: '#16A34A' }}>
                      {formatPrice(s.paidAmount)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {s.pendingAmount > 0 ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(217,119,6,0.1)', color: '#D97706' }}>
                        {formatPrice(s.pendingAmount)}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {s.pendingAmount > 0 && (
                      <button onClick={() => handlePay(s.id)} disabled={payingId === s.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E8242C] text-white border-none cursor-pointer hover:bg-[#C41E25] transition whitespace-nowrap">
                        {payingId === s.id ? '...' : <><Check className="w-3 h-3" /> Төлөх</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
