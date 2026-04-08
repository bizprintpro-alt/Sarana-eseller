'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Settings, Loader2 } from 'lucide-react';

interface Config { key: string; value: string; updatedAt?: string }

function MaintenanceControl({ getVal, updateConfig, saving }: {
  getVal: (k: string) => string;
  updateConfig: (k: string, v: string) => Promise<void>;
  saving: string;
}) {
  const isOn = getVal('maintenance_mode') === 'true';
  const isSaving = saving === 'maintenance_mode';

  const handleToggle = async () => {
    if (!isOn) {
      if (!window.confirm('Maintenance mode АСААХ уу?\n\nБүх хэрэглэгчид "засвартай" мессеж харна.\nАдмин самбар хэвийн ажиллана.')) return;
    }
    await updateConfig('maintenance_mode', isOn ? 'false' : 'true');
  };

  return (
    <div style={{
      background: isOn ? 'rgba(232,36,44,0.08)' : 'var(--esl-bg-card, #1a1a2e)',
      border: isOn ? '2px solid #E8242C' : '1px solid var(--esl-border, #2a2a3e)',
      borderRadius: 16, padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>{isOn ? '\u26A0\uFE0F' : '\uD83D\uDEE0\uFE0F'}</span>
        <h3 style={{ color: '#FFF', fontWeight: 700, fontSize: 15, margin: 0 }}>Maintenance Mode</h3>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99,
          background: isOn ? '#E8242C' : '#333',
          color: isOn ? '#FFF' : '#888',
          marginLeft: 8,
        }}>
          {isOn ? 'ИДЭВХТЭЙ' : 'УНТАРСАН'}
        </span>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
        {isOn
          ? 'Сайт одоо засвартай горимд байна. Бүх хэрэглэгчид maintenance хуудас харагдаж байна. Админ самбар хэвийн ажиллаж байна.'
          : 'Идэвхжүүлбэл бүх хэрэглэгчид "Тун удахгүй" мессеж харна. Админ самбар хэвийн ажиллана.'}
      </p>

      <button
        type="button"
        onClick={handleToggle}
        disabled={isSaving}
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: 12,
          border: 'none',
          fontSize: 14,
          fontWeight: 700,
          cursor: isSaving ? 'wait' : 'pointer',
          background: isOn ? '#333' : '#E8242C',
          color: '#FFF',
          transition: 'all 0.2s',
        }}
      >
        {isSaving ? 'Хадгалж байна...' : isOn ? '\u274C Maintenance унтраах' : '\u26A0\uFE0F Maintenance асаах'}
      </button>
    </div>
  );
}

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('token');

  const loadConfigs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config', {
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setConfigs(data);
    } catch (e) {
      setError('Config ачааллахад алдаа: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfigs(); }, [loadConfigs]);

  const updateConfig = async (key: string, value: string) => {
    setSaving(key);
    setError('');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify({ key, value }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      // Update local state
      setConfigs(prev => {
        const exists = prev.some(c => c.key === key);
        if (exists) return prev.map(c => c.key === key ? { ...c, value, updatedAt: new Date().toISOString() } : c);
        return [...prev, { key, value, updatedAt: new Date().toISOString() }];
      });
    } catch (e) {
      setError(`"${key}" хадгалахад алдаа: ${(e as Error).message}`);
    } finally {
      setSaving('');
    }
  };

  const getVal = (key: string) => configs.find(c => c.key === key)?.value ?? '';
  const getDate = (key: string) => {
    const d = configs.find(c => c.key === key)?.updatedAt;
    return d ? new Date(d).toLocaleDateString('mn-MN') : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-dash-sidebar border-b border-dash-border px-8 py-4">
        <h1 className="text-white text-lg font-black">&#9881;&#65039; Платформ тохиргоо</h1>
        <p className="text-white/35 text-xs mt-0.5">Комисс, бүртгэл, maintenance</p>
      </div>

      <div className="p-8 max-w-2xl space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Commission */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">&#128176; Комисс тохиргоо</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Platform комисс (%) <span className="text-white/20 font-normal">— бүх шинэ захиалгад</span>
              </label>
              <div className="flex gap-2">
                <input id="commission_rate_input" type="number" defaultValue={getVal('commission_rate') || '5'}
                  className="flex-1 bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
                <button onClick={() => {
                  const el = document.getElementById('commission_rate_input') as HTMLInputElement;
                  updateConfig('commission_rate', el?.value || '5');
                }}
                  disabled={saving === 'commission_rate'}
                  className="px-4 bg-dash-accent text-white rounded-xl font-bold text-xs border-none cursor-pointer hover:bg-[#4F46E5] transition flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> {saving === 'commission_rate' ? '...' : 'Хадгалах'}
                </button>
              </div>
              {getDate('commission_rate') && <p className="text-[10px] text-white/20 mt-1">Сүүлд: {getDate('commission_rate')}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Affiliate комисс (%) <span className="text-white/20 font-normal">— борлуулагчид</span>
              </label>
              <div className="flex gap-2">
                <input id="affiliate_rate_input" type="number" defaultValue={getVal('affiliate_rate') || '15'}
                  className="flex-1 bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
                <button onClick={() => {
                  const el = document.getElementById('affiliate_rate_input') as HTMLInputElement;
                  updateConfig('affiliate_rate', el?.value || '15');
                }}
                  disabled={saving === 'affiliate_rate'}
                  className="px-4 bg-dash-accent text-white rounded-xl font-bold text-xs border-none cursor-pointer hover:bg-[#4F46E5] transition flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> {saving === 'affiliate_rate' ? '...' : 'Хадгалах'}
                </button>
              </div>
              {getDate('affiliate_rate') && <p className="text-[10px] text-white/20 mt-1">Сүүлд: {getDate('affiliate_rate')}</p>}
            </div>
          </div>
        </div>

        {/* Seller Registration */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Settings className="w-4 h-4" /> Платформ</h3>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm text-white font-medium">Seller бүртгэл нээлттэй</div>
              <div className="text-xs text-white/30">Шинэ дэлгүүр эзэн бүртгүүлэх боломж</div>
            </div>
            <button
              type="button"
              onClick={() => updateConfig('seller_registration', getVal('seller_registration') === 'true' ? 'false' : 'true')}
              disabled={saving === 'seller_registration'}
              style={{
                position: 'relative', width: 48, height: 26, borderRadius: 13,
                border: 'none', cursor: 'pointer',
                background: getVal('seller_registration') === 'true' ? '#22C55E' : '#555',
              }}
            >
              <div style={{
                position: 'absolute', top: 3,
                left: getVal('seller_registration') === 'true' ? 25 : 3,
                width: 20, height: 20, borderRadius: 10,
                background: '#FFF', boxShadow: '0 1px 4px rgba(0,0,0,.3)',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>

        {/* ═══ MAINTENANCE MODE ═══ */}
        <MaintenanceControl getVal={getVal} updateConfig={updateConfig} saving={saving} />
      </div>
    </div>
  );
}
