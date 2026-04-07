'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle, Upload, ExternalLink } from 'lucide-react';
import { SELLER_TIERS, getTierInfo, getNextTier, getApplicableTiers, type TierInfo } from '@/lib/seller/influencerTier';

export default function InfluencerApplyPage() {
  const [currentTier, setCurrentTier] = useState('REGULAR');
  const [form, setForm] = useState({
    targetTier: 'MICRO',
    instagram: '',
    tiktok: '',
    facebook: '',
    youtube: '',
    followers: '',
    screenshot: '',
    note: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error' | 'pending'>('idle');
  const [pendingApp, setPendingApp] = useState<{ targetTier: string; createdAt: string } | null>(null);

  useEffect(() => {
    // Fetch current seller profile
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/seller/influencer-apply', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.sellerType) setCurrentTier(d.sellerType);
          if (d.pendingApp) {
            setPendingApp(d.pendingApp);
            setStatus('pending');
          }
        })
        .catch(() => {});
    }
  }, []);

  const tierInfo = getTierInfo(currentTier);
  const nextTier = getNextTier(currentTier);
  const applicableTiers = getApplicableTiers();

  const handleSubmit = async () => {
    if (!form.followers || (!form.instagram && !form.tiktok && !form.facebook)) return;
    setStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/seller/influencer-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          ...form,
          followers: parseInt(form.followers) || 0,
        }),
      });
      if (res.ok) {
        setStatus('sent');
      } else {
        const data = await res.json();
        if (data.error === 'pending') setStatus('pending');
        else setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--esl-text)]">Инфлюэнсер болох хүсэлт</h1>
        <p className="text-sm text-[var(--esl-text-secondary)] mt-1">
          Нийгмийн сүлжээний дагагчийн тоогоо баталгаажуулж, commission bonus авах
        </p>
      </div>

      {/* Current tier */}
      <div className="flex items-center gap-3 bg-[var(--esl-bg-section)] rounded-xl p-4 border border-[var(--esl-border)]">
        <span className="text-3xl">{tierInfo.emoji}</span>
        <div>
          <p className="text-sm font-medium text-[var(--esl-text)]">Таны одоогийн tier</p>
          <p className="text-lg font-bold" style={{ color: tierInfo.color }}>{tierInfo.label}</p>
          {tierInfo.bonus > 0 && (
            <p className="text-xs text-[var(--esl-text-secondary)]">Commission bonus: +{tierInfo.bonus}%</p>
          )}
        </div>
        {nextTier && (
          <div className="ml-auto text-right">
            <p className="text-xs text-[var(--esl-text-secondary)]">Дараагийн tier</p>
            <p className="text-sm font-semibold" style={{ color: nextTier.color }}>{nextTier.emoji} {nextTier.label} (+{nextTier.bonus}%)</p>
          </div>
        )}
      </div>

      {/* Tier table */}
      <div className="bg-[var(--esl-bg-section)] rounded-xl border border-[var(--esl-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--esl-border)] text-left text-[var(--esl-text-secondary)]">
              <th className="px-4 py-2.5">Tier</th>
              <th className="px-4 py-2.5">Дагагч</th>
              <th className="px-4 py-2.5">Борлуулалт</th>
              <th className="px-4 py-2.5">Bonus</th>
            </tr>
          </thead>
          <tbody>
            {SELLER_TIERS.map((t) => (
              <tr key={t.type} className={`border-b border-[var(--esl-border)] ${t.type === currentTier ? 'bg-[var(--esl-bg-hover)]' : ''}`}>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <span>{t.emoji}</span>
                    <span className="font-medium text-[var(--esl-text)]">{t.label}</span>
                    {t.type === currentTier && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Одоогийн</span>}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[var(--esl-text-secondary)]">
                  {t.minFollowers > 0 ? `${t.minFollowers.toLocaleString()}+` : '—'}
                </td>
                <td className="px-4 py-2.5 text-[var(--esl-text-secondary)]">
                  {t.minMonthlySales > 0 ? `${t.minMonthlySales}+/сар` : '—'}
                </td>
                <td className="px-4 py-2.5 font-bold" style={{ color: t.bonus > 0 ? '#E8242C' : undefined }}>
                  {t.bonus > 0 ? `+${t.bonus}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status messages */}
      {status === 'sent' && (
        <div className="text-center py-8 bg-[var(--esl-bg-section)] rounded-xl border border-[var(--esl-border)]">
          <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
          <p className="text-lg font-semibold text-[var(--esl-text)]">Хүсэлт илгээсэн!</p>
          <p className="text-sm text-[var(--esl-text-secondary)] mt-1">Admin шалгаж зөвшөөрсний дараа таны tier дэвшинэ.</p>
        </div>
      )}

      {status === 'pending' && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-sm text-yellow-700">
          Хүлээгдэж буй хүсэлт байна{pendingApp ? ` (${getTierInfo(pendingApp.targetTier).label})` : ''}. Admin шалгахыг хүлээнэ үү.
        </div>
      )}

      {/* Application form */}
      {(status === 'idle' || status === 'error' || status === 'loading') && (
        <div className="bg-[var(--esl-bg-section)] rounded-xl p-5 border border-[var(--esl-border)] space-y-4">
          <h2 className="font-semibold text-[var(--esl-text)]">Хүсэлт гаргах</h2>

          {/* Target tier */}
          <div>
            <label className="text-sm font-medium text-[var(--esl-text)] mb-1 block">Хүсэж буй tier</label>
            <div className="grid grid-cols-3 gap-2">
              {applicableTiers.map((t) => (
                <button
                  key={t.type}
                  onClick={() => setForm({ ...form, targetTier: t.type })}
                  className={`p-3 rounded-lg border text-center transition ${
                    form.targetTier === t.type
                      ? 'border-[#E8242C] bg-red-50'
                      : 'border-[var(--esl-border)]'
                  }`}
                >
                  <span className="text-xl block mb-1">{t.emoji}</span>
                  <p className="text-xs font-medium text-[var(--esl-text)]">{t.label}</p>
                  <p className="text-[10px] font-bold" style={{ color: '#E8242C' }}>+{t.bonus}%</p>
                </button>
              ))}
            </div>
          </div>

          {/* Social URLs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--esl-text-secondary)] mb-1 block">Instagram URL</label>
              <input placeholder="https://instagram.com/username" value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--esl-bg-page)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--esl-text-secondary)] mb-1 block">TikTok URL</label>
              <input placeholder="https://tiktok.com/@username" value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--esl-bg-page)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--esl-text-secondary)] mb-1 block">Facebook URL</label>
              <input placeholder="https://facebook.com/pagename" value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--esl-bg-page)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--esl-text-secondary)] mb-1 block">YouTube URL (optional)</label>
              <input placeholder="https://youtube.com/@channel" value={form.youtube}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--esl-bg-page)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]" />
            </div>
          </div>

          {/* Followers */}
          <div>
            <label className="text-sm font-medium text-[var(--esl-text)] mb-1 block">Нийт дагагчийн тоо</label>
            <input type="number" placeholder="Жишээ: 5000" value={form.followers}
              onChange={(e) => setForm({ ...form, followers: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--esl-bg-page)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]" />
          </div>

          {/* Screenshot */}
          <div>
            <label className="text-sm font-medium text-[var(--esl-text)] mb-1 block">Дагагчийн тооны screenshot</label>
            <input placeholder="Cloudinary URL эсвэл зургийн URL" value={form.screenshot}
              onChange={(e) => setForm({ ...form, screenshot: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--esl-bg-page)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]" />
            <p className="text-xs text-[var(--esl-text-disabled)] mt-1">Instagram/TikTok профайлын дагагчийн тоо харуулсан screenshot</p>
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium text-[var(--esl-text)] mb-1 block">Нэмэлт тайлбар</label>
            <textarea placeholder="Ямар чиглэлээр контент бүтээдэг вэ..." value={form.note} rows={3}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--esl-bg-page)] border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text)]" />
          </div>

          <button onClick={handleSubmit}
            disabled={status === 'loading' || !form.followers || (!form.instagram && !form.tiktok && !form.facebook)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#E8242C] text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
            <Send size={14} /> {status === 'loading' ? 'Илгээж байна...' : 'Хүсэлт илгээх'}
          </button>

          {status === 'error' && <p className="text-xs text-red-500 text-center">Алдаа гарлаа. Дахин оролдоно уу.</p>}
        </div>
      )}
    </div>
  );
}
