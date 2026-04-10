'use client';

import { useState } from 'react';
import { Tag, Loader2, Check, X } from 'lucide-react';

interface CouponResult {
  valid: boolean;
  discount?: number;
  finalAmount?: number;
  error?: string;
  coupon?: { code: string; discountType: string; discountValue: number; title?: string };
}

export default function CouponInput({ cartAmount, onDiscount }: { cartAmount: number; onDiscount: (discount: number, code: string) => void }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CouponResult | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase(), cartAmount }),
      });
      const data = await res.json();
      setResult(data);
      if (data.valid && data.discount) onDiscount(data.discount, code.toUpperCase());
    } catch {
      setResult({ valid: false, error: 'Алдаа гарлаа' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--esl-text-muted)' }} />
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && validate()}
            placeholder="Купон код..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--esl-bg-section)', border: '1px solid var(--esl-border)', color: 'var(--esl-text-primary)' }} />
        </div>
        <button onClick={validate} disabled={loading || !code.trim()}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer text-white"
          style={{ background: code.trim() ? '#E8242C' : 'var(--esl-border)' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Шалгах'}
        </button>
      </div>
      {result?.valid && (
        <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(22,163,74,0.08)', color: '#16A34A' }}>
          <Check className="w-4 h-4" /> <span className="text-sm font-semibold">-{result.discount?.toLocaleString()}₮ хямдрал!</span>
        </div>
      )}
      {result && !result.valid && (
        <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(232,36,44,0.08)', color: '#E8242C' }}>
          <X className="w-4 h-4" /> <span className="text-sm">{result.error}</span>
        </div>
      )}
    </div>
  );
}
