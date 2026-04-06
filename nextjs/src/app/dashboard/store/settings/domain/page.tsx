'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Globe, Check, AlertCircle, RefreshCw, Copy, ExternalLink, Shield } from 'lucide-react';

interface DomainData {
  domain: string;
  verified: boolean;
}

export default function DomainSettingsPage() {
  const [domain, setDomain] = useState('');
  const [current, setCurrent] = useState<DomainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ verified: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const shopId = typeof window !== 'undefined' ? localStorage.getItem('eseller_shop_id') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!shopId) { setLoading(false); return; }
    fetch(`/api/shop/${shopId}/domain`)
      .then((r) => r.json())
      .then(({ data }) => { if (data) { setCurrent(data); setDomain(data.domain); } })
      .finally(() => setLoading(false));
  }, [shopId]);

  const handleSave = async () => {
    if (!domain.trim() || !shopId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/shop/${shopId}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain: domain.trim().toLowerCase() }),
      });
      const { data, error } = await res.json();
      if (error) { alert(error); return; }
      setCurrent(data);
      setVerifyResult(null);
    } finally { setSaving(false); }
  };

  const handleVerify = async () => {
    if (!shopId) return;
    setVerifying(true);
    try {
      const res = await fetch(`/api/shop/${shopId}/domain/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data } = await res.json();
      setVerifyResult(data);
      if (data?.verified) setCurrent((prev) => prev ? { ...prev, verified: true } : prev);
    } finally { setVerifying(false); }
  };

  const copyValue = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-sm text-[var(--esl-text-muted)]">Ачааллаж байна...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--esl-text-primary)] tracking-tight">Домайн тохиргоо</h1>
        <p className="text-sm text-[var(--esl-text-secondary)] mt-1">Өөрийн домайн нэрийг дэлгүүртэй холбох (жишээ: minii-salon.mn)</p>
      </div>

      {/* Domain input card */}
      <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Globe className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--esl-text-primary)]">Custom домайн</h3>
            <p className="text-xs text-[var(--esl-text-secondary)]">Жишээ: minii-salon.mn, myshop.com</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourdomain.mn"
            className="flex-1 px-4 py-2.5 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          <button onClick={handleSave} disabled={saving || !domain.trim()}
            className={cn('px-5 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition',
              saving ? 'bg-gray-200 text-[var(--esl-text-muted)]' : 'bg-indigo-600 text-white hover:bg-indigo-700')}>
            {saving ? '...' : 'Хадгалах'}
          </button>
        </div>

        {/* Status badge */}
        {current && (
          <div className={cn('flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold',
            current.verified ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200')}>
            {current.verified ? <Shield className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {current.verified
              ? <><span>{current.domain}</span> <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Баталгаажсан</span></>
              : <span>{current.domain} — DNS баталгаажуулах шаардлагатай</span>
            }
          </div>
        )}
      </div>

      {/* DNS Instructions */}
      {current && !current.verified && (
        <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--esl-text-primary)]">DNS тохируулах заавар</h3>
          <p className="text-sm text-[var(--esl-text-secondary)]">Домайн нэрийнхээ DNS тохиргоонд дараах бичлэгийг нэмнэ үү:</p>

          {/* DNS record table */}
          <div className="bg-[var(--esl-bg-section)] rounded-lg border border-[var(--esl-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--esl-text-secondary)] border-b border-[var(--esl-border)] bg-[var(--esl-bg-section)]/50">
                  <th className="px-4 py-2.5 font-medium">Төрөл</th>
                  <th className="px-4 py-2.5 font-medium">Нэр</th>
                  <th className="px-4 py-2.5 font-medium">Утга</th>
                  <th className="px-4 py-2.5 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 font-mono font-semibold text-[var(--esl-text-primary)]">CNAME</td>
                  <td className="px-4 py-3 font-mono text-[var(--esl-text-primary)]">{current.domain}</td>
                  <td className="px-4 py-3 font-mono text-indigo-600 font-semibold">cname.eseller.mn</td>
                  <td className="px-4 py-3">
                    <button onClick={() => copyValue('cname.eseller.mn')}
                      className="w-7 h-7 rounded-lg bg-[var(--esl-bg-card)] border border-[var(--esl-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--esl-bg-section)] transition text-[var(--esl-text-muted)] hover:text-indigo-600">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700">
            <strong>Тэмдэглэл:</strong> DNS өөрчлөлт хүчин төгөлдөр болоход 1-48 цаг шаардагдана. Cloudflare ашиглаж байвал Proxy (шар үүл) идэвхгүй болго.
          </div>

          <button onClick={handleVerify} disabled={verifying}
            className={cn('flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition',
              verifying ? 'bg-gray-200 text-[var(--esl-text-muted)]' : 'bg-green-600 text-white hover:bg-green-700')}>
            {verifying ? <><RefreshCw className="w-4 h-4 animate-spin" /> Шалгаж байна...</> : <><Check className="w-4 h-4" /> DNS шалгах</>}
          </button>

          {verifyResult && !verifyResult.verified && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
              {verifyResult.message}
            </div>
          )}

          {verifyResult?.verified && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" /> {verifyResult.message}
            </div>
          )}
        </div>
      )}

      {/* Verified success */}
      {current?.verified && (
        <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[var(--esl-text-primary)]">Домайн амжилттай холбогдсон</h3>
              <p className="text-xs text-[var(--esl-text-secondary)]">Таны хэрэглэгчид {current.domain} хаягаар хандаж болно</p>
            </div>
            <a href={`https://${current.domain}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 no-underline transition">
              <ExternalLink className="w-4 h-4" /> Нээх
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
