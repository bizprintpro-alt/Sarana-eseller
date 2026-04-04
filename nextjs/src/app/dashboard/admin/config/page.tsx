'use client';

import { useState, useEffect } from 'react';
import { Save, Settings } from 'lucide-react';

interface Config { key: string; value: string; updatedAt?: string }

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/config', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setConfigs(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateConfig = async (key: string, value: string) => {
    setSaving(key);
    const token = localStorage.getItem('token');
    await fetch('/api/admin/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ key, value }),
    });
    setConfigs(prev => prev.map(c => c.key === key ? { ...c, value, updatedAt: new Date().toISOString() } : c));
    setSaving('');
  };

  const getVal = (key: string) => configs.find(c => c.key === key)?.value ?? '';
  const getDate = (key: string) => {
    const d = configs.find(c => c.key === key)?.updatedAt;
    return d ? new Date(d).toLocaleDateString('mn-MN') : '';
  };

  return (
    <div>
      <div className="bg-dash-sidebar border-b border-dash-border px-8 py-4">
        <h1 className="text-white text-lg font-black">⚙️ Платформ тохиргоо</h1>
        <p className="text-white/35 text-xs mt-0.5">Комисс, бүртгэл, maintenance</p>
      </div>

      <div className="p-8 max-w-2xl space-y-6">
        {/* Commission */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">💰 Комисс тохиргоо</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Platform комисс (%) <span className="text-white/20 font-normal">— бүх шинэ захиалгад</span>
              </label>
              <div className="flex gap-2">
                <input type="number" defaultValue={getVal('commission_rate') || '5'}
                  onBlur={e => updateConfig('commission_rate', e.target.value)}
                  className="flex-1 bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
                <button onClick={() => updateConfig('commission_rate', (document.querySelector('input[type=number]') as HTMLInputElement)?.value || '5')}
                  disabled={saving === 'commission_rate'}
                  className="px-4 bg-dash-accent text-white rounded-xl font-bold text-xs border-none cursor-pointer hover:bg-[#4F46E5] transition flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> {saving === 'commission_rate' ? '...' : 'Хадгалах'}
                </button>
              </div>
              {getDate('commission_rate') && <p className="text-[10px] text-white/20 mt-1">Сүүлд өөрчилсөн: {getDate('commission_rate')}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Affiliate комисс (%) <span className="text-white/20 font-normal">— борлуулагчид</span>
              </label>
              <div className="flex gap-2">
                <input type="number" defaultValue={getVal('affiliate_rate') || '15'}
                  onBlur={e => updateConfig('affiliate_rate', e.target.value)}
                  className="flex-1 bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
                <button onClick={() => updateConfig('affiliate_rate', '15')}
                  disabled={saving === 'affiliate_rate'}
                  className="px-4 bg-dash-accent text-white rounded-xl font-bold text-xs border-none cursor-pointer hover:bg-[#4F46E5] transition flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Хадгалах
                </button>
              </div>
              {getDate('affiliate_rate') && <p className="text-[10px] text-white/20 mt-1">Сүүлд өөрчилсөн: {getDate('affiliate_rate')}</p>}
            </div>
          </div>
        </div>

        {/* Platform toggles */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2"><Settings className="w-4 h-4" /> Платформ</h3>

          <div className="space-y-4">
            {[
              { key: 'seller_registration', label: 'Seller бүртгэл нээлттэй', desc: 'Шинэ дэлгүүр эзэн бүртгүүлэх боломж' },
              { key: 'maintenance_mode', label: 'Maintenance mode', desc: 'Идэвхжүүлбэл бүх хэрэглэгчид "засвартай" мессеж харна' },
            ].map(item => {
              const isOn = getVal(item.key) === 'true';
              return (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm text-white font-medium">{item.label}</div>
                    <div className="text-xs text-white/30">{item.desc}</div>
                  </div>
                  <button onClick={() => updateConfig(item.key, isOn ? 'false' : 'true')}
                    className="relative w-11 h-6 rounded-full border-none cursor-pointer transition-colors"
                    style={{ background: isOn ? '#6366F1' : '#333' }}>
                    <div className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all"
                      style={{ left: isOn ? '22px' : '3px' }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
