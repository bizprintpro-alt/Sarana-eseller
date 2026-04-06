'use client';

import { useState } from 'react';
import { useShopTypeStore, type ShopType } from '@/lib/shop-type-store';
import { saveConfig } from '@/lib/store-config';
import { cn } from '@/lib/utils';
import {
  Package, Scissors, Check, AlertTriangle, Clock, Download,
  Users, Building2, Car,
} from 'lucide-react';

type EntityOption = {
  key: string;
  shopType: ShopType;
  icon: React.ElementType;
  label: string;
  desc: string;
  features: string[];
  color: string;
  badge?: string;
};

const TYPES: EntityOption[] = [
  {
    key: 'product', shopType: 'product',
    icon: Package, label: 'Дэлгүүр', color: '#3B82F6',
    desc: 'Бараа бүтээгдэхүүн зарах онлайн дэлгүүр',
    features: ['Бараа удирдлага', 'Захиалгын систем', 'Хүргэлт', 'Хямдрал & купон'],
  },
  {
    key: 'pre_order', shopType: 'product',
    icon: Clock, label: 'Захиалгын дэлгүүр', color: '#E8242C', badge: 'Шинэ',
    desc: 'Гадаадаас захиалж оруулдаг бараа — pre-order систем',
    features: ['Pre-order дараалал', 'Багцын захиалга', 'Урьдчилгаа төлбөр', 'Ирааны мөрдөлт'],
  },
  {
    key: 'agent', shopType: 'product',
    icon: Users, label: 'Үл хөдлөхийн агент', color: '#10B981',
    desc: 'Орон сууц, газар, оффисийн зуучлал',
    features: ['Зар байршуулах', 'Байршлын зураг', 'Хариу хүсэлт', 'Мэргэжлийн профайл'],
  },
  {
    key: 'company', shopType: 'product',
    icon: Building2, label: 'Барилгын компани', color: '#6366F1',
    desc: 'Шинэ барилга, орон сууцны төсөл',
    features: ['Төслийн удирдлага', 'Бүтээгдэхүүний галерей', 'Баримт бичиг', 'VIP байршил'],
  },
  {
    key: 'auto_dealer', shopType: 'product',
    icon: Car, label: 'Авто худалдаа', color: '#F59E0B',
    desc: 'Шинэ болон хуучин автомашин борлуулах',
    features: ['Машины жагсаалт', 'Тест драйв захиалга', 'Техник үзүүлэлт', 'Үнийн харьцуулалт'],
  },
  {
    key: 'service', shopType: 'service',
    icon: Scissors, label: 'Үйлчилгээ', color: '#EC4899',
    desc: 'Салон, засвар, хэвлэл, сургалт г.м.',
    features: ['Цаг захиалга', 'Үйлчилгээний жагсаалт', 'Цагийн хуваарь', 'Портфолио'],
  },
  {
    key: 'digital', shopType: 'product',
    icon: Download, label: 'Файл / Дижитал бараа', color: '#8B5CF6', badge: 'Шинэ',
    desc: 'Татаж авах дижитал контент зарах',
    features: ['Файл удирдлага', 'Татаж авалт', 'Лицензийн түлхүүр', 'Instant download'],
  },
];

export default function ShopTypePage() {
  const currentType = useShopTypeStore((s) => s.shopType);
  const setShopType = useShopTypeStore((s) => s.setShopType);
  const [selected, setSelected] = useState<string>(currentType);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const selectedOption = TYPES.find(t => t.key === selected);
  const currentOption = TYPES.find(t => t.key === currentType || t.shopType === currentType);

  const handleSave = async () => {
    if (!selectedOption) return;
    if (selectedOption.shopType !== currentType && !showWarning) {
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
          body: JSON.stringify({ type: selectedOption.shopType, entityType: selectedOption.key }),
        });
      }
      saveConfig({ businessType: selectedOption.shopType as ShopType });
      setShopType(selectedOption.shopType as ShopType);
      setSaved(true);
      setShowWarning(false);
      setTimeout(() => { setSaved(false); window.location.reload(); }, 1200);
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Дэлгүүрийн төрөл</h1>
        <p className="text-sm text-[var(--esl-text-muted)] mt-1">Таны бизнесийн төрлийг сонговол sidebar болон dashboard тохирч өөрчлөгдөнө.</p>
      </div>

      {/* Type cards */}
      <div className="space-y-3">
        {TYPES.map((t) => {
          const isSelected = selected === t.key;
          const isCurrent = currentType === t.shopType && (currentOption?.key === t.key || (!currentOption && t.shopType === currentType));
          return (
            <button
              key={t.key}
              onClick={() => { setSelected(t.key); setShowWarning(false); }}
              className={cn(
                'w-full flex items-start gap-4 p-5 rounded-2xl border text-left cursor-pointer transition-all',
                isSelected
                  ? 'border-[#E8242C] bg-[rgba(232,36,44,0.06)]'
                  : 'border-[var(--esl-border)] bg-[var(--esl-bg-card)] hover:border-[var(--esl-border)]'
              )}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: t.color + '15', color: t.color }}>
                <t.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{t.label}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold bg-[rgba(232,36,44,0.15)] text-[#E8242C] px-2 py-0.5 rounded-full">Одоогийн</span>
                  )}
                  {t.badge && (
                    <span className="text-[10px] font-bold bg-[#E8242C] text-white px-2 py-0.5 rounded-full">{t.badge}</span>
                  )}
                </div>
                <p className="text-xs text-[var(--esl-text-muted)] mt-0.5">{t.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {t.features.map((f) => (
                    <span key={f} className="text-[10px] font-medium bg-[var(--esl-bg-elevated)] text-[var(--esl-text-muted)] px-2 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-[#E8242C] flex items-center justify-center shrink-0 mt-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Warning */}
      {showWarning && selectedOption && selectedOption.shopType !== currentType && (
        <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-[#F59E0B]">Анхааруулга</div>
            <p className="text-sm text-[#D0D0D0] mt-0.5">
              Төрөл солиход нөгөө хэсгийн цэс нуугдана. Таны мэдээлэл устахгүй — дахин сольж буцаах боломжтой.
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowWarning(false)}
                className="px-4 py-2 text-sm font-semibold text-[var(--esl-text-muted)] bg-[var(--esl-bg-elevated)] border border-[var(--esl-border)] rounded-lg hover:bg-[#3D3D3D] cursor-pointer transition">
                Болих
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#E8242C] rounded-lg hover:bg-[#CC0000] cursor-pointer transition border-none">
                {saving ? 'Хадгалж байна...' : 'Тийм, солих'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      {!showWarning && (
        <button onClick={handleSave} disabled={saving || selected === (currentOption?.key || currentType)}
          className={cn('flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition',
            saved ? 'bg-[#22C55E] text-white'
              : saving || selected === (currentOption?.key || currentType) ? 'bg-[var(--esl-bg-elevated)] text-[#555] cursor-not-allowed'
              : 'bg-[#E8242C] text-white hover:bg-[#CC0000]')}>
          {saved ? <><Check className="w-4 h-4" /> Хадгалагдлаа!</> : 'Хадгалах'}
        </button>
      )}
    </div>
  );
}
