'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  phone: string;
  address: string;
  defaultCommission: string;
  maxCommission: string;
  bank: string;
  accountNumber: string;
  accountHolder: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: '',
  storeDescription: '',
  phone: '',
  address: '',
  defaultCommission: '10',
  maxCommission: '30',
  bank: 'khan',
  accountNumber: '',
  accountHolder: '',
};

const BANKS = [
  { value: 'khan', label: 'Хаан банк' },
  { value: 'golomt', label: 'Голомт банк' },
  { value: 'tdb', label: 'ХХБ' },
  { value: 'state', label: 'Төрийн банк' },
  { value: 'xac', label: 'ХасБанк' },
  { value: 'bogd', label: 'Богд банк' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('eseller_store_settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  function handleSave() {
    if (!settings.storeName) {
      toast.show('Дэлгүүрийн нэр заавал бөглөнө үү', 'warn');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('eseller_store_settings', JSON.stringify(settings));
      setSaving(false);
      toast.show('Тохиргоо хадгалагдлаа', 'ok');
    }, 500);
  }

  function update(field: keyof StoreSettings, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--esl-bg-section)] p-6">
        <div className="rounded-xl border border-[var(--esl-border)] p-8 mb-6" style={{ backgroundColor: 'var(--esl-bg-card)' }}>
          <div className="h-8 w-48 rounded animate-pulse mb-2" style={{ backgroundColor: 'var(--esl-border)' }} />
          <div className="h-4 w-72 bg-[var(--esl-bg-section)] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--esl-bg-section)] p-6">
      <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] p-6 mb-6">
        <h1 className="text-2xl font-bold text-[var(--esl-text-primary)]">Тохиргоо</h1>
        <p className="text-[var(--esl-text-secondary)] mt-1">Дэлгүүрийн ерөнхий тохиргоо</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Store Info */}
        <div className="rounded-xl border border-[var(--esl-border)] p-6" style={{ backgroundColor: 'var(--esl-bg-card)' }}>
          <h2 className="text-lg font-bold text-[var(--esl-text-primary)] mb-4">🏪 Дэлгүүрийн мэдээлэл</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Дэлгүүрийн нэр *</label>
              <input value={settings.storeName} onChange={(e) => update('storeName', e.target.value)} placeholder="Миний дэлгүүр" className="w-full px-3 py-2.5 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] bg-[var(--esl-bg-input)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Тайлбар</label>
              <textarea value={settings.storeDescription} onChange={(e) => update('storeDescription', e.target.value)} rows={3} placeholder="Дэлгүүрийн товч тайлбар..." className="w-full px-3 py-2.5 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] bg-[var(--esl-bg-input)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Утасны дугаар</label>
                <input value={settings.phone} onChange={(e) => update('phone', e.target.value)} placeholder="99001122" className="w-full px-3 py-2.5 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] bg-[var(--esl-bg-input)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Хаяг</label>
                <input value={settings.address} onChange={(e) => update('address', e.target.value)} placeholder="УБ, СБД, 1-р хороо" className="w-full px-3 py-2.5 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] bg-[var(--esl-bg-input)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Commission Settings */}
        <div className="rounded-xl border border-[var(--esl-border)] p-6" style={{ backgroundColor: 'var(--esl-bg-card)' }}>
          <h2 className="text-lg font-bold text-[var(--esl-text-primary)] mb-4">💰 Шимтгэлийн тохиргоо</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Үндсэн шимтгэл (%)</label>
              <input type="number" value={settings.defaultCommission} onChange={(e) => update('defaultCommission', e.target.value)} className="w-full px-3 py-2.5 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] bg-[var(--esl-bg-input)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <p className="text-xs text-[var(--esl-text-muted)] mt-1">Реферал хүмүүст олгох шимтгэл</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Хамгийн их шимтгэл (%)</label>
              <input type="number" value={settings.maxCommission} onChange={(e) => update('maxCommission', e.target.value)} className="w-full px-3 py-2.5 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] bg-[var(--esl-bg-input)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <p className="text-xs text-[var(--esl-text-muted)] mt-1">Бүтээгдэхүүн тус бүрт тогтоох дээд хязгаар</p>
            </div>
          </div>
        </div>

        {/* Payment/Bank Settings */}
        <div className="rounded-xl border border-[var(--esl-border)] p-6" style={{ backgroundColor: 'var(--esl-bg-card)' }}>
          <h2 className="text-lg font-bold text-[var(--esl-text-primary)] mb-4">🏦 Төлбөрийн тохиргоо</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Банк</label>
              <select value={settings.bank} onChange={(e) => update('bank', e.target.value)} className="w-full px-3 py-2.5 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] bg-[var(--esl-bg-input)] focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {BANKS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Дансны дугаар</label>
                <input value={settings.accountNumber} onChange={(e) => update('accountNumber', e.target.value)} placeholder="1234567890" className="w-full px-3 py-2.5 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] bg-[var(--esl-bg-input)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--esl-text-primary)] mb-1">Данс эзэмшигч</label>
                <input value={settings.accountHolder} onChange={(e) => update('accountHolder', e.target.value)} placeholder="Б. Бат" className="w-full px-3 py-2.5 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] bg-[var(--esl-bg-input)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-[#E8242C] text-white rounded-xl font-semibold hover:bg-[#C41E25] transition-colors disabled:opacity-50"
        >
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </div>
    </div>
  );
}
