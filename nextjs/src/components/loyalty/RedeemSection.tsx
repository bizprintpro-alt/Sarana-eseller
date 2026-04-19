'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { LOYALTY_CONFIG } from '@/lib/loyalty/config';
import { Star, Gift, ChevronDown } from 'lucide-react';

interface RedeemSectionProps {
  balance: number;
  orderTotal: number;
  onApply: (discount: number, couponCode: string) => void;
}

export default function RedeemSection({ balance, orderTotal, onApply }: RedeemSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [points, setPoints] = useState(LOYALTY_CONFIG.redeem.minRedeemPoints);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  if (balance < LOYALTY_CONFIG.redeem.minRedeemPoints) return null;

  const maxRedeemable = Math.min(
    balance,
    Math.floor((orderTotal * LOYALTY_CONFIG.redeem.maxRedeemPct / 100) / LOYALTY_CONFIG.redeem.pointValue),
  );
  const discount = points * LOYALTY_CONFIG.redeem.pointValue;

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, type: 'discount' }),
      });
      const body = await res.json();
      // Envelope: { success: true, data: {couponCode, ...} } | { success: false, error }
      // Legacy:    {couponCode, ...}
      if (body?.success === false) return;
      const data = body?.success === true ? body.data : body;
      if (data?.couponCode) {
        onApply(data.valueAmount, data.couponCode);
        setApplied(true);
      }
    } catch {}
    finally { setApplying(false); }
  };

  if (applied) {
    return (
      <div className="rounded-xl p-3.5 border" style={{ background: 'rgba(22,163,74,0.05)', borderColor: 'rgba(22,163,74,0.2)' }}>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-[#16A34A]" />
          <span className="text-sm font-semibold text-[#16A34A]">{points} оноо ашиглагдлаа — {formatPrice(discount)} хямдрал</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'rgba(255,215,0,0.03)', borderColor: 'rgba(255,215,0,0.15)' }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer border-none" style={{ background: 'transparent' }}>
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-[#FFD700]" />
          <span className="text-sm font-semibold" style={{ color: 'var(--esl-text-primary)' }}>
            {balance.toLocaleString()} оноо байна
          </span>
          <span className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>
            (≈ {formatPrice(balance * LOYALTY_CONFIG.redeem.pointValue)})
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} style={{ color: 'var(--esl-text-muted)' }} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Slider */}
          <div>
            <input type="range" min={LOYALTY_CONFIG.redeem.minRedeemPoints} max={maxRedeemable} step={100}
              value={points} onChange={e => setPoints(Number(e.target.value))}
              className="w-full accent-[#FFD700]" />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--esl-text-muted)' }}>
              <span>{LOYALTY_CONFIG.redeem.minRedeemPoints} оноо</span>
              <span className="font-bold text-[#FFD700]">{points} оноо = {formatPrice(discount)}</span>
              <span>{maxRedeemable} оноо</span>
            </div>
          </div>

          {/* Quick select */}
          <div className="flex gap-2">
            {[200, 500, 1000].filter(v => v <= maxRedeemable).map(v => (
              <button key={v} onClick={() => setPoints(v)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                  points === v ? 'bg-[#FFD700] text-[#0A0A0A] border-[#FFD700]' : ''
                }`} style={points !== v ? { background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-secondary)' } : undefined}>
                {v} оноо
              </button>
            ))}
          </div>

          <button onClick={handleApply} disabled={applying}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-[#FFD700] text-[#0A0A0A] border-none cursor-pointer hover:bg-[#FFC000] transition">
            {applying ? 'Ашиглаж байна...' : `${formatPrice(discount)} хямдрал авах`}
          </button>
        </div>
      )}
    </div>
  );
}
