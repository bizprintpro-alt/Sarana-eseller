'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface Invoice {
  id: string;
  partnerId: string;
  period: string;
  totalAmount: number;
  platformFee: number;
  agentFees: number;
  status: string;
  paidAt: string | null;
  invoiceFile: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  PENDING:   { label: 'Хүлээгдэж байна', icon: Clock,           bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  PAID:      { label: 'Төлөгдсөн',       icon: CheckCircle,     bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  OVERDUE:   { label: 'Хугацаа хэтэрсэн', icon: AlertTriangle,  bg: 'rgba(239,68,68,0.15)',  text: '#EF4444' },
  CANCELLED: { label: 'Цуцлагдсан',      icon: XCircle,         bg: 'rgba(148,163,184,0.15)', text: '#94A3B8' },
};

function formatMNT(n: number) {
  return n.toLocaleString() + '₮';
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/partners/invoices', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(d => setInvoices(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = invoices.filter(inv =>
    inv.period.includes(search) || inv.id.includes(search)
  );

  const totalPending = invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--esl-text)] flex items-center gap-2">
          <FileText className="w-6 h-6" /> Нэхэмжлэл
        </h1>
        <p className="text-sm text-[var(--esl-text-secondary)] mt-1">
          Гэрээт компаниудын сарын нэхэмжлэл
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--esl-bg-section)] rounded-xl p-4 border border-[var(--esl-border)]">
          <p className="text-xs text-[var(--esl-text-secondary)]">Нийт нэхэмжлэл</p>
          <p className="text-xl font-bold text-[var(--esl-text)]">{invoices.length}</p>
        </div>
        <div className="bg-[var(--esl-bg-section)] rounded-xl p-4 border border-[var(--esl-border)]">
          <p className="text-xs text-[var(--esl-text-secondary)]">Хүлээгдэж буй</p>
          <p className="text-xl font-bold text-amber-500">{formatMNT(totalPending)}</p>
        </div>
        <div className="bg-[var(--esl-bg-section)] rounded-xl p-4 border border-[var(--esl-border)]">
          <p className="text-xs text-[var(--esl-text-secondary)]">Төлөгдсөн</p>
          <p className="text-xl font-bold text-green-500">{formatMNT(totalPaid)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--esl-text-disabled)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Хугацаагаар хайх (жнь: 2026-04)..."
          className="w-full pl-10 pr-4 py-2 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]"
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--esl-bg-section)] rounded-xl border border-[var(--esl-border)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--esl-text-secondary)]">Ачааллаж байна...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-[var(--esl-text-secondary)]">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>Нэхэмжлэл олдсонгүй</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--esl-border)] text-left text-[var(--esl-text-secondary)]">
                <th className="px-4 py-3">Хугацаа</th>
                <th className="px-4 py-3">Нийт дүн</th>
                <th className="px-4 py-3">Платформ хураамж</th>
                <th className="px-4 py-3">Агентын хураамж</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Огноо</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const st = STATUS_CONFIG[inv.status] || STATUS_CONFIG.PENDING;
                const StIcon = st.icon;
                return (
                  <tr key={inv.id} className="border-b border-[var(--esl-border)] hover:bg-[var(--esl-bg-hover)]">
                    <td className="px-4 py-3 font-medium text-[var(--esl-text)]">{inv.period}</td>
                    <td className="px-4 py-3 font-bold text-[var(--esl-text)]">{formatMNT(inv.totalAmount)}</td>
                    <td className="px-4 py-3 text-[var(--esl-text)]">{formatMNT(inv.platformFee)}</td>
                    <td className="px-4 py-3 text-[var(--esl-text)]">{formatMNT(inv.agentFees)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full w-fit font-medium" style={{ background: st.bg, color: st.text }}>
                        <StIcon size={12} /> {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--esl-text-secondary)]">
                      {new Date(inv.createdAt).toLocaleDateString('mn-MN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
