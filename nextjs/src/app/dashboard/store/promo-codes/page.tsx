'use client';

import { useState } from 'react';
import { useToast } from '@/components/shared/Toast';
import StatCard from '@/components/dashboard/StatCard';

interface PromoCode {
  id: string;
  code: string;
  percentage: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  enabled: boolean;
}

const INITIAL_CODES: PromoCode[] = [
  { id: '1', code: 'SPRING25', percentage: 25, validFrom: '2026-04-01', validTo: '2026-04-30', usageLimit: 100, usedCount: 34, enabled: true },
  { id: '2', code: 'FIRST10', percentage: 10, validFrom: '2026-01-01', validTo: '2026-12-31', usageLimit: 500, usedCount: 187, enabled: true },
  { id: '3', code: 'FLASH50', percentage: 50, validFrom: '2026-04-03', validTo: '2026-04-05', usageLimit: 20, usedCount: 15, enabled: true },
  { id: '4', code: 'WINTER15', percentage: 15, validFrom: '2025-12-01', validTo: '2026-02-28', usageLimit: 200, usedCount: 200, enabled: false },
];

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>(INITIAL_CODES);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', percentage: '10', validFrom: '', validTo: '', usageLimit: '100' });
  const toast = useToast();

  function handleCreate() {
    if (!form.code || !form.percentage || !form.validFrom || !form.validTo) {
      toast.show('Бүх талбарыг бөглөнө үү', 'warn');
      return;
    }
    if (codes.some((c) => c.code === form.code.toUpperCase())) {
      toast.show('Энэ код бүртгэлтэй байна', 'warn');
      return;
    }
    const newCode: PromoCode = {
      id: Date.now().toString(),
      code: form.code.toUpperCase(),
      percentage: Number(form.percentage),
      validFrom: form.validFrom,
      validTo: form.validTo,
      usageLimit: Number(form.usageLimit),
      usedCount: 0,
      enabled: true,
    };
    setCodes((prev) => [newCode, ...prev]);
    setForm({ code: '', percentage: '10', validFrom: '', validTo: '', usageLimit: '100' });
    setShowModal(false);
    toast.show('Промо код амжилттай үүсгэлээ', 'ok');
  }

  function toggleCode(id: string) {
    setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
    toast.show('Промо код шинэчлэгдлээ', 'ok');
  }

  function deleteCode(id: string) {
    if (!confirm('Устгахдаа итгэлтэй байна уу?')) return;
    setCodes((prev) => prev.filter((c) => c.id !== id));
    toast.show('Промо код устгагдлаа', 'ok');
  }

  const activeCount = codes.filter((c) => c.enabled).length;
  const totalUsage = codes.reduce((s, c) => s + c.usedCount, 0);

  return (
    <div className="min-h-screen bg-[var(--esl-bg-section)] p-6">
      <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--esl-text-primary)]">Промо кодууд</h1>
          <p className="text-[var(--esl-text-secondary)] mt-1">Хямдралын код үүсгэх, хугацаа тохируулах</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm">
          + Шинэ код
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon="🏷️" label="Нийт код" value={codes.length} gradient="indigo" />
        <StatCard icon="✅" label="Идэвхтэй" value={activeCount} gradient="green" />
        <StatCard icon="📊" label="Нийт хэрэглэсэн" value={totalUsage} gradient="amber" />
      </div>

      {codes.length === 0 ? (
        <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] p-12 text-center">
          <div className="text-4xl mb-3">🏷️</div>
          <h3 className="text-lg font-semibold text-[var(--esl-text-primary)]">Промо код байхгүй</h3>
          <p className="text-[var(--esl-text-muted)] mt-1">Шинэ код үүсгээрэй</p>
        </div>
      ) : (
        <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--esl-bg-section)] border-b border-[var(--esl-border)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">Код</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">Хөнгөлөлт</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">Хугацаа</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">Хэрэглэсэн</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">Төлөв</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--esl-text-secondary)] uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => {
                  const isExpired = new Date(c.validTo) < new Date();
                  const isMaxed = c.usedCount >= c.usageLimit;
                  return (
                    <tr key={c.id} className={`border-b border-[var(--esl-border)] hover:bg-[var(--esl-bg-section)] ${isExpired || isMaxed ? 'opacity-60' : ''}`}>
                      <td className="p-4 font-mono text-sm font-bold text-indigo-600">{c.code}</td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">{c.percentage}%</span>
                      </td>
                      <td className="p-4 text-xs text-[var(--esl-text-secondary)]">
                        {new Date(c.validFrom).toLocaleDateString('mn-MN')} — {new Date(c.validTo).toLocaleDateString('mn-MN')}
                        {isExpired && <span className="ml-1 text-red-500 font-medium">(Дууссан)</span>}
                      </td>
                      <td className="p-4 text-sm text-[var(--esl-text-primary)]">
                        {c.usedCount} / {c.usageLimit}
                        <div className="w-20 bg-[var(--esl-bg-section)] rounded-full h-1.5 mt-1">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min((c.usedCount / c.usageLimit) * 100, 100)}%` }} />
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleCode(c.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${c.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--esl-bg-card)] transition-transform ${c.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </td>
                      <td className="p-4">
                        <button onClick={() => deleteCode(c.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                          Устгах
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--esl-bg-card)] rounded-2xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--esl-border)] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--esl-text-primary)]">Шинэ промо код</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--esl-text-muted)] hover:text-[var(--esl-text-secondary)] text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Код</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER30" className="w-full px-3 py-2 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Хөнгөлөлт (%)</label>
                <input type="number" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} min="1" max="100" className="w-full px-3 py-2 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Эхлэх огноо</label>
                  <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="w-full px-3 py-2 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Дуусах огноо</label>
                  <input type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} className="w-full px-3 py-2 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Хэрэглэх хязгаар</label>
                <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="w-full px-3 py-2 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button onClick={handleCreate} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                Үүсгэх
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
