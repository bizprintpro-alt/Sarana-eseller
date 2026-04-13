'use client';

import { useState } from 'react';

const PROVINCES = [
  { code: 'UB', name: 'Улаанбаатар', days: 0, fee: 0, free: true },
  { code: 'DRH', name: 'Дархан-Уул', days: 1, fee: 6000, free: false },
  { code: 'TOV', name: 'Төв', days: 2, fee: 8000, free: false },
  { code: 'SEL', name: 'Сэлэнгэ', days: 2, fee: 8000, free: false },
  { code: 'ORH', name: 'Орхон', days: 2, fee: 8000, free: false },
  { code: 'GBI', name: 'Говьсүмбэр', days: 2, fee: 9000, free: false },
  { code: 'BLG', name: 'Булган', days: 3, fee: 10000, free: false },
  { code: 'OVR', name: 'Өвөрхангай', days: 3, fee: 12000, free: false },
  { code: 'ARH', name: 'Архангай', days: 3, fee: 12000, free: false },
  { code: 'DND', name: 'Дундговь', days: 3, fee: 12000, free: false },
  { code: 'HNT', name: 'Хэнтий', days: 4, fee: 14000, free: false },
  { code: 'OOT', name: 'Өмнөговь', days: 4, fee: 15000, free: false },
  { code: 'DRG', name: 'Дорноговь', days: 4, fee: 15000, free: false },
  { code: 'SHN', name: 'Сүхбаатар', days: 4, fee: 15000, free: false },
  { code: 'HOV', name: 'Хөвсгөл', days: 4, fee: 16000, free: false },
  { code: 'DOD', name: 'Дорнод', days: 5, fee: 18000, free: false },
  { code: 'ZAV', name: 'Завхан', days: 5, fee: 18000, free: false },
  { code: 'GOV', name: 'Говь-Алтай', days: 5, fee: 18000, free: false },
  { code: 'UVS', name: 'Увс', days: 5, fee: 18000, free: false },
  { code: 'HVD', name: 'Ховд', days: 5, fee: 18000, free: false },
  { code: 'BYN', name: 'Баян-Өлгий', days: 6, fee: 20000, free: false },
];

interface ProvinceSelectorProps {
  value: string;
  onChange: (code: string, fee: number, days: number) => void;
  orderAmount?: number;
  isGold?: boolean;
}

export function ProvinceSelector({
  value, onChange, orderAmount = 0, isGold = false,
}: ProvinceSelectorProps) {
  const [selected, setSelected] = useState(value || 'UB');
  const isFreeDelivery = isGold || orderAmount >= 50000;

  function handleSelect(code: string) {
    const province = PROVINCES.find((p) => p.code === code);
    if (!province) return;
    const fee = isFreeDelivery ? 0 : province.fee;
    setSelected(code);
    onChange(code, fee, province.days);
  }

  const current = PROVINCES.find((p) => p.code === selected);

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#222', marginBottom: 6, display: 'block' }}>
        Хүргэлтийн аймаг / хот
      </label>
      <select
        value={selected}
        onChange={(e) => handleSelect(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8,
          border: '.5px solid #d0d0d0', fontSize: 13, background: '#fff',
        }}
      >
        {PROVINCES.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
            {p.free || isFreeDelivery ? ' — Үнэгүй' : ` — ${p.fee.toLocaleString()}₮`}
          </option>
        ))}
      </select>
      {current && (
        <div style={{
          marginTop: 8, padding: '8px 12px', background: '#F0F7FF',
          borderRadius: 8, fontSize: 12, color: '#1B3A5C',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>
            {current.days === 0 ? '📍 Улаанбаатар — Өнөөдөр' : `📍 ${current.name} — ${current.days} хоногт`}
          </span>
          <span style={{ fontWeight: 500 }}>
            {isFreeDelivery || current.free ? '🎁 Үнэгүй' : `${current.fee.toLocaleString()}₮`}
          </span>
        </div>
      )}
      {isGold && (
        <p style={{ fontSize: 11, color: '#C0953C', marginTop: 4 }}>
          Gold гишүүн — бүх аймагт үнэгүй хүргэлт
        </p>
      )}
    </div>
  );
}
