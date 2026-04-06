'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import EsellerLogo from '@/components/shared/EsellerLogo';
import { Lock, Check, Loader2, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Нууц үг таарахгүй байна'); return; }
    if (password.length < 6) { setError('Хамгийн бага 6 тэмдэгт'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else setError(data.error || 'Алдаа гарлаа');
    } catch { setError('Сүлжээний алдаа'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--esl-bg-page)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 no-underline">
            <EsellerLogo size={32} />
            <span className="text-xl font-black" style={{ color: 'var(--esl-text-primary)' }}>eseller<span className="text-[#E8242C]">.mn</span></span>
          </Link>
        </div>

        <div className="rounded-2xl border p-8" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[rgba(22,163,74,0.1)] flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#16A34A]" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--esl-text-primary)' }}>Нууц үг шинэчлэгдлээ!</h2>
              <p className="text-sm" style={{ color: 'var(--esl-text-muted)' }}>Нэвтрэх хуудас руу шилжиж байна...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--esl-text-primary)' }}>Шинэ нууц үг</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--esl-text-muted)' }}>Шинэ нууц үгээ оруулна уу</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--esl-text-secondary)' }}>Шинэ нууц үг</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--esl-text-muted)' }} />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                      placeholder="Хамгийн бага 6 тэмдэгт"
                      className="w-full h-11 pl-10 pr-10 rounded-xl border text-sm outline-none focus:border-[#E8242C]"
                      style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer" style={{ color: 'var(--esl-text-muted)' }}>
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--esl-text-secondary)' }}>Баталгаажуулах</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--esl-text-muted)' }} />
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                      placeholder="Дахин оруулна уу"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-[#E8242C]"
                      style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
                  </div>
                </div>

                {error && <p className="text-xs text-[#DC2626]">{error}</p>}

                <button type="submit" disabled={loading || !password || !confirm}
                  className="w-full h-11 rounded-xl text-sm font-bold bg-[#E8242C] text-white border-none cursor-pointer hover:bg-[#C41E25] transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Нууц үг шинэчлэх'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
