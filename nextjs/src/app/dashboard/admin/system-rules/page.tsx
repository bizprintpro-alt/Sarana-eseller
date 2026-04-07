'use client';

import { useState, useEffect } from 'react';
import { Save, Shield } from 'lucide-react';

interface TaxToggles {
  vatEnabled: boolean;
  incomeTaxEnabled: boolean;
  vatMonitorEnabled: boolean;
  cityTaxEnabled: boolean;
  taxReportEnabled: boolean;
}

const TAX_ITEMS = [
  { key: 'vatEnabled' as const, label: 'НӨАТ систем (еБаримт)', desc: 'Захиалга бүрт еБаримт үүсгэх' },
  { key: 'incomeTaxEnabled' as const, label: 'ХХОАТ суутгал (борлуулагч)', desc: 'Commission-оос 10% суутгах' },
  { key: 'vatMonitorEnabled' as const, label: 'НӨАТ босго хяналт', desc: '50M₮ давбал сануулга илгээх' },
  { key: 'taxReportEnabled' as const, label: 'Татварын тайлан export', desc: 'Seller dashboard-д татварын тайлан харуулах' },
  { key: 'cityTaxEnabled' as const, label: 'Хотын татвар (2%)', desc: 'Тооцооллоос хотын татвар суутгах' },
];

export default function SystemRulesPage() {
  const [toggles, setToggles] = useState<TaxToggles>({
    vatEnabled: false,
    incomeTaxEnabled: false,
    vatMonitorEnabled: false,
    cityTaxEnabled: false,
    taxReportEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/system-settings', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => {
        setToggles({
          vatEnabled: d.vatEnabled || false,
          incomeTaxEnabled: d.incomeTaxEnabled || false,
          vatMonitorEnabled: d.vatMonitorEnabled || false,
          cityTaxEnabled: d.cityTaxEnabled || false,
          taxReportEnabled: d.taxReportEnabled || false,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');
    await fetch('/api/admin/system-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(toggles),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-[var(--esl-text-secondary)]">Ачааллаж байна...</div>;

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={22} className="text-[#E8242C]" />
          <h1 className="text-2xl font-bold text-[var(--esl-text)]">Системийн дүрэм</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 px-4 py-2 bg-[#E8242C] text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
        >
          <Save size={14} /> {saved ? 'Хадгалсан!' : 'Хадгалах'}
        </button>
      </div>

      <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-sm text-red-700">
        <p className="font-semibold mb-1">Яагаад энэ чухал вэ?</p>
        <p>Компани НӨАТ төлөгч болох хүртэл еБаримт шаардлагагүй.</p>
        <p>Борлуулагчийн ХХОАТ суутгалыг эхний үед хийхгүй байж болно.</p>
        <p>Admin нэг товчоор бүх татварын логикийг идэвхжүүлнэ.</p>
      </div>

      <div className="space-y-3">
        {TAX_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between bg-[var(--esl-bg-section)] rounded-xl p-4 border border-[var(--esl-border)]"
          >
            <div>
              <p className="text-sm font-medium text-[var(--esl-text)]">{item.label}</p>
              <p className="text-xs text-[var(--esl-text-secondary)]">{item.desc}</p>
            </div>
            <button
              onClick={() => setToggles({ ...toggles, [item.key]: !toggles[item.key] })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                toggles[item.key] ? 'bg-[#E8242C]' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                toggles[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
