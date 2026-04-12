'use client';
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export function CouponInput({ cartTotal, onApply }: {
  cartTotal: number;
  onApply: (discount: number, code: string) => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/checkout/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setSuccess(true);
        setMessage(data.message);
        onApply(data.discount, data.code);
      } else {
        setSuccess(false);
        setMessage(data.error);
      }
    } catch {
      setMessage('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Купон код оруулах"
          className="flex-1 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-[10px] px-3.5 py-2.5 text-[var(--esl-text)] text-sm outline-none tracking-widest focus:border-[#E8242C] transition-colors"
        />
        <button
          onClick={apply}
          disabled={loading || success}
          className={`px-5 rounded-[10px] border-none font-semibold text-sm cursor-pointer ${
            success ? 'bg-[#34A853] text-white' : 'bg-[#E8242C] text-white'
          }`}
        >
          {loading ? '...' : success ? '✓' : 'Хэрэглэх'}
        </button>
      </div>
      {message && (
        <p className={`mt-1.5 text-[13px] ${success ? 'text-[#34A853]' : 'text-[#E8242C]'}`}>
          {success ? <CheckCircle className="w-4 h-4 inline-block mr-1 align-text-bottom" /> : <XCircle className="w-4 h-4 inline-block mr-1 align-text-bottom" />}{message}
        </p>
      )}
    </div>
  );
}
