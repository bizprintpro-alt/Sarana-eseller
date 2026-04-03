'use client';

import { useState } from 'react';
import { useShopTypeStore, type ShopType } from '@/lib/shop-type-store';
import { saveConfig } from '@/lib/store-config';
import { cn } from '@/lib/utils';
import { Package, Scissors, Check, AlertTriangle } from 'lucide-react';

const TYPES: { key: ShopType; icon: React.ElementType; label: string; desc: string; features: string[] }[] = [
  {
    key: 'product',
    icon: Package,
    label: 'Бараа дэлгүүр',
    desc: 'Физик болон дижитал бараа борлуулах дэлгүүр',
    features: ['Бараа удирдлага', 'Нөөцийн хяналт', 'Брэнд & Ангилал', 'Захиалгын систем'],
  },
  {
    key: 'service',
    icon: Scissors,
    label: 'Үйлчилгээний байгууллага',
    desc: 'Цаг захиалгатай үйлчилгээ: салон, засвар, хэвлэл, фитнесс г.м.',
    features: ['Үйлчилгээний жагсаалт', 'Цаг захиалга', 'Цагийн хуваарь', 'Ажилтны удирдлага'],
  },
];

export default function ShopTypePage() {
  const currentType = useShopTypeStore((s) => s.shopType);
  const setShopType = useShopTypeStore((s) => s.setShopType);
  const [selected, setSelected] = useState<ShopType>(currentType);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleSave = async () => {
    if (selected !== currentType && !showWarning) {
      setShowWarning(true);
      return;
    }

    setSaving(true);
    try {
      const shopId = localStorage.getItem('eseller_shop_id');
      if (shopId) {
        const token = localStorage.getItem('token');
        await fetch(`/api/shop/${shopId}/type`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type: selected }),
        });
      }
      saveConfig({ businessType: selected });
      setShopType(selected);
      setSaved(true);
      setShowWarning(false);
      setTimeout(() => { setSaved(false); window.location.reload(); }, 1200);
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Дэлгүүрийн төрөл</h1>
        <p className="text-sm text-gray-500 mt-1">Таны бизнесийн төрлийг сонговол sidebar болон dashboard тохирч өөрчлөгдөнө.</p>
      </div>

      {/* Type cards */}
      <div className="space-y-3">
        {TYPES.map((t) => {
          const isSelected = selected === t.key;
          const isCurrent = currentType === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setSelected(t.key); setShowWarning(false); }}
              className={cn(
                'w-full flex items-start gap-4 p-6 rounded-2xl border-2 text-left cursor-pointer transition-all bg-white',
                isSelected
                  ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,.12)]'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition',
                isSelected ? 'bg-indigo-100' : 'bg-gray-100')}>
                <t.icon className={cn('w-6 h-6', isSelected ? 'text-indigo-600' : 'text-gray-400')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-900">{t.label}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Одоогийн</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{t.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {t.features.map((f) => (
                    <span key={f} className="text-[10px] font-medium bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-100">{f}</span>
                  ))}
                </div>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Warning */}
      {showWarning && selected !== currentType && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-amber-800">Анхааруулга</div>
            <p className="text-sm text-amber-700 mt-0.5">
              Төрөл солиход нөгөө хэсгийн цэс нуугдана. Таны мэдээлэл устахгүй — дахин сольж буцаах боломжтой.
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowWarning(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                Болих
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer transition border-none">
                {saving ? 'Хадгалж байна...' : 'Тийм, солих'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save button (when no warning needed) */}
      {!showWarning && (
        <button onClick={handleSave} disabled={saving || selected === currentType}
          className={cn('flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition',
            saved ? 'bg-green-600 text-white'
              : saving || selected === currentType ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm')}>
          {saved ? <><Check className="w-4 h-4" /> Хадгалагдлаа!</> : 'Хадгалах'}
        </button>
      )}
    </div>
  );
}
