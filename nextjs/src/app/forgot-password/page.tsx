'use client';

import { useState } from 'react';
import Link from 'next/link';
import EsellerLogo from '@/components/shared/EsellerLogo';
import { Mail, ArrowLeft, Check, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setSent(true);
      else setError(data.error || 'Алдаа гарлаа');
    } catch { setError('Сүлжээний алдаа'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--esl-bg-page)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 no-underline mb-4">
            <EsellerLogo size={32} />
            <span className="text-xl font-black" style={{ color: 'var(--esl-text-primary)' }}>eseller<span className="text-[#E8242C]">.mn</span></span>
          </Link>
        </div>

        <div className="rounded-2xl border p-8" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[rgba(22,163,74,0.1)] flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#16A34A]" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--esl-text-primary)' }}>Линк илгээгдлээ!</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--esl-text-muted)' }}>
                <strong>{email}</strong> хаяг руу сэргээх линк илгээлээ. Имэйлээ шалгана уу.
              </p>
              <Link href="/login" className="text-sm text-[#E8242C] font-semibold no-underline">← Нэвтрэх хуудас руу</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--esl-text-primary)' }}>Нууц үг мартсан уу?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--esl-text-muted)' }}>Бүртгэлтэй имэйл хаягаа оруулна уу</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--esl-text-secondary)' }}>Имэйл хаяг</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--esl-text-muted)' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="email@example.com"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-[#E8242C]"
                      style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
                  </div>
                </div>

                {error && <p className="text-xs text-[#DC2626]">{error}</p>}

                <button type="submit" disabled={loading || !email}
                  className="w-full h-11 rounded-xl text-sm font-bold bg-[#E8242C] text-white border-none cursor-pointer hover:bg-[#C41E25] transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сэргээх линк илгээх'}
                </button>
              </form>

              <div className="text-center mt-4">
                <Link href="/login" className="text-xs font-semibold no-underline flex items-center justify-center gap-1" style={{ color: 'var(--esl-text-muted)' }}>
                  <ArrowLeft className="w-3 h-3" /> Нэвтрэх хуудас руу буцах
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
