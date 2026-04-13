'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard, Clock, CheckCircle, AlertTriangle, Loader2,
  Calendar, ArrowRight, Banknote,
} from 'lucide-react';

interface BNPLPaymentItem {
  id: string;
  dueDate: string;
  amount: number;
  paidAt: string | null;
  status: string;
}

interface BNPLApp {
  id: string;
  totalAmount: number;
  downPayment: number;
  monthlyAmount: number;
  months: number;
  bank: string;
  status: string;
  approvedAt: string | null;
  createdAt: string;
  order: { id: string; orderNumber: string | null; total: number | null };
  payments: BNPLPaymentItem[];
  nextPayment: BNPLPaymentItem | null;
  progress: { paid: number; total: number };
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {};
}

const STATUS_META: Record<string, { label: string; color: string; icon: typeof CreditCard }> = {
  PENDING:   { label: 'Хүлээгдэж байна', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  ACTIVE:    { label: 'Идэвхтэй', color: 'text-blue-600 bg-blue-50', icon: CreditCard },
  COMPLETED: { label: 'Дууссан', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  DEFAULTED: { label: 'Хугацаа хэтэрсэн', color: 'text-red-600 bg-red-50', icon: AlertTriangle },
  REJECTED:  { label: 'Татгалзсан', color: 'text-gray-600 bg-gray-100', icon: AlertTriangle },
};

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID:    'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: 'Хүлээгдэж байна',
  PAID:    'Төлсөн',
  OVERDUE: 'Хугацаа хэтэрсэн',
};

const fmt = (n: number) => n.toLocaleString('mn-MN');

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('mn-MN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function BNPLPage() {
  const [apps, setApps] = useState<BNPLApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bnpl/payments', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setApps(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async (paymentId: string) => {
    // Placeholder for payment flow
    alert('Төлбөр хийх хэсэг удахгүй нэмэгдэнэ');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <CreditCard className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Зээлээр авах</h1>
          <p className="text-sm text-gray-500">Таны BNPL хуваарь, төлбөрийн мэдээлэл</p>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">Танд одоогоор BNPL зээл байхгүй байна</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => {
            const meta = STATUS_META[app.status] || STATUS_META.PENDING;
            const StatusIcon = meta.icon;
            const progressPct = app.progress.total > 0
              ? Math.round((app.progress.paid / app.progress.total) * 100)
              : 0;

            return (
              <div
                key={app.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                {/* Status + Order info */}
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Захиалга #{app.order.orderNumber || app.order.id.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {app.bank} | {app.months} сар
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {meta.label}
                  </span>
                </div>

                {/* Amount info */}
                <div className="mb-3 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3">
                  <div>
                    <p className="text-xs text-gray-500">Нийт</p>
                    <p className="text-sm font-semibold">{fmt(app.totalAmount)}₮</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Сарын</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {fmt(app.monthlyAmount)}₮
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Урьдчилгаа</p>
                    <p className="text-sm font-semibold">{fmt(app.downPayment)}₮</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>Төлбөрийн явц</span>
                    <span>
                      {app.progress.paid}/{app.progress.total} ({progressPct}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Next payment */}
                {app.nextPayment && (
                  <div className="mb-3 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Дараагийн төлбөр</p>
                        <p className="text-sm font-medium">
                          {fmtDate(app.nextPayment.dueDate)} — {fmt(app.nextPayment.amount)}₮
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePay(app.nextPayment!.id)}
                      className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      <Banknote className="h-3.5 w-3.5" />
                      Төлбөр хийх
                    </button>
                  </div>
                )}

                {/* Payment list */}
                <div className="space-y-1.5">
                  {app.payments.map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">#{i + 1}</span>
                        <span className="text-gray-700">{fmtDate(p.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{fmt(p.amount)}₮</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            PAYMENT_COLORS[p.status] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {PAYMENT_LABELS[p.status] || p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
