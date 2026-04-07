'use client';

import { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';

export default function InfluencerApplyPage() {
  const [form, setForm] = useState({
    instagram: '',
    tiktok: '',
    facebook: '',
    followers: '',
    note: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const handleSubmit = async () => {
    setStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/seller/influencer-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          socialLinks: {
            instagram: form.instagram || undefined,
            tiktok: form.tiktok || undefined,
            facebook: form.facebook || undefined,
          },
          followers: parseInt(form.followers) || 0,
          note: form.note,
        }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-20">
        <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
        <h2 className="text-xl font-bold text-[var(--esl-text)]">Хүсэлт илгээсэн!</h2>
        <p className="text-sm text-[var(--esl-text-secondary)] mt-2">
          Admin шалгаж зөвшөөрсний дараа таны tier дэвшинэ.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Star size={22} className="text-[#F59E0B]" />
        <h1 className="text-2xl font-bold text-[var(--esl-text)]">Инфлюэнсер хүсэлт</h1>
      </div>

      <p className="text-sm text-[var(--esl-text-secondary)]">
        Нийгмийн сүлжээний мэдээллээ оруулж инфлюэнсер tier-д хүсэлт илгээнэ үү.
        Батлагдсан тохиолдолд commission bonus нэмэгдэнэ.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-[var(--esl-text)] mb-1 block">Instagram URL</label>
          <input
            placeholder="https://instagram.com/username"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--esl-text)] mb-1 block">TikTok URL</label>
          <input
            placeholder="https://tiktok.com/@username"
            value={form.tiktok}
            onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--esl-text)] mb-1 block">Facebook URL</label>
          <input
            placeholder="https://facebook.com/pagename"
            value={form.facebook}
            onChange={(e) => setForm({ ...form, facebook: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--esl-text)] mb-1 block">Нийт дагагчийн тоо</label>
          <input
            type="number"
            placeholder="Жишээ: 5000"
            value={form.followers}
            onChange={(e) => setForm({ ...form, followers: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--esl-text)] mb-1 block">Нэмэлт тэмдэглэл</label>
          <textarea
            placeholder="Ямар чиглэлээр контент бүтээдэг вэ..."
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-[var(--esl-bg-section)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={status === 'loading' || (!form.instagram && !form.tiktok && !form.facebook)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#E8242C] text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
      >
        <Send size={14} /> {status === 'loading' ? 'Илгээж байна...' : 'Хүсэлт илгээх'}
      </button>

      {status === 'error' && <p className="text-xs text-red-500 text-center">Алдаа гарлаа. Дахин оролдоно уу.</p>}
    </div>
  );
}
