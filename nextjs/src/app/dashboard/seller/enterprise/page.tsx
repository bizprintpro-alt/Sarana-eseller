'use client';

import { useState, useEffect } from 'react';
import { Globe, Check, Loader2, Palette, ExternalLink } from 'lucide-react';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function EnterpriseSetupPage() {
  const [subdomain, setSubdomain] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#1B3A5C');
  const [accentColor, setAccentColor] = useState('#E67E22');
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [enterprise, setEnterprise] = useState<any>(null);
  const [error, setError] = useState('');

  // Check if already set up
  useEffect(() => {
    fetch('/api/enterprise/my', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { if (d.data) setEnterprise(d.data); })
      .catch(() => {});
  }, []);

  const checkAvailability = async () => {
    if (subdomain.length < 3) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/enterprise/check-subdomain?subdomain=${subdomain}`);
      const data = await res.json();
      setAvailable(data.available);
      if (!data.available && data.error) setError(data.error);
      else setError('');
    } catch {}
    setChecking(false);
  };

  const setup = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/enterprise/setup', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, primaryColor, accentColor, logoUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setEnterprise(data.data?.enterprise);
      } else {
        setError(data.error || 'Алдаа гарлаа');
      }
    } catch {
      setError('Сүлжээний алдаа');
    }
    setSaving(false);
  };

  if (enterprise) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-green-600" />
            <h1 className="text-xl font-bold">Enterprise идэвхтэй</h1>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Subdomain</span>
              <a href={`https://${enterprise.subdomain}.eseller.mn`} target="_blank" rel="noreferrer"
                className="text-blue-600 flex items-center gap-1">
                {enterprise.subdomain}.eseller.mn <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Багц</span>
              <span className="font-medium">{enterprise.plan}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Үндсэн өнгө</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded" style={{ background: enterprise.primaryColor }} />
                {enterprise.primaryColor}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-blue-900" />
          <div>
            <h1 className="text-xl font-bold">Enterprise тохиргоо</h1>
            <p className="text-sm text-gray-500">Өөрийн subdomain + брэнд үүсгэх</p>
          </div>
        </div>

        {/* Subdomain */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Subdomain</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 border rounded-lg overflow-hidden flex-1">
              <input
                value={subdomain}
                onChange={(e) => { setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setAvailable(null); }}
                onBlur={checkAvailability}
                placeholder="nomin"
                className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
              />
              <span className="text-sm text-gray-400 px-2">.eseller.mn</span>
            </div>
            {checking && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            {available === true && <Check className="w-5 h-5 text-green-500" />}
            {available === false && <span className="text-red-500 text-xs">Бүртгэлтэй</span>}
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Үндсэн өнгө</label>
            <div className="flex items-center gap-2">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 border rounded px-2 py-1 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Товчны өнгө</label>
            <div className="flex items-center gap-2">
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 border rounded px-2 py-1 text-sm" />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Лого URL</label>
          <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        {/* Preview */}
        <div className="mb-6 rounded-lg overflow-hidden border">
          <div style={{ background: primaryColor }} className="px-4 py-3 flex items-center gap-3">
            {logoUrl && <img src={logoUrl} alt="" className="h-8 rounded" />}
            <span className="text-white font-bold">{subdomain || 'nomin'}.eseller.mn</span>
          </div>
          <div className="p-4 bg-gray-50 text-center">
            <button style={{ background: accentColor }} className="text-white px-4 py-2 rounded-lg text-sm font-medium">
              Жишээ товч
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={setup}
          disabled={saving || !subdomain || available === false}
          className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
          Enterprise идэвхжүүлэх
        </button>
      </div>
    </div>
  );
}
