'use client';

import { useState, useEffect } from 'react';
import { Save, Calculator, AlertTriangle, TrendingUp } from 'lucide-react';

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Үнэгүй', color: '#94A3B8' },
  standard: { label: 'Стандарт', color: '#6366F1' },
  ultimate: { label: 'Алтимэйт', color: '#D97706' },
  ai_pro: { label: 'AI Pro', color: '#EC4899' },
};

function formatMNT(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'сая₮';
  if (n >= 1000) return Math.round(n / 1000) + 'K₮';
  return n.toLocaleString() + '₮';
}

export default function CommissionPage() {
  const [platformRate, setPlatformRate] = useState(5);
  const [affiliateRate, setAffiliateRate] = useState(10);
  const [planRates, setPlanRates] = useState({ free: 5, standard: 4, ultimate: 3, ai_pro: 2 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Calculator
  const [calcTotal, setCalcTotal] = useState(50000);
  const [calcPlan, setCalcPlan] = useState('free');
  const [calcAffiliate, setCalcAffiliate] = useState(false);
  const [calcResult, setCalcResult] = useState<Record<string, number> | null>(null);

  // Load config
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/commission', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(data => {
        if (data.platformRate) setPlatformRate(data.platformRate);
        if (data.affiliateRate) setAffiliateRate(data.affiliateRate);
        if (data.planRates) setPlanRates(data.planRates);
      })
      .catch(() => {});
  }, []);

  // Save config
  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');
    await fetch('/api/admin/commission', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ platformRate, affiliateRate, planRates }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Calculate preview
  const handleCalculate = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/commission/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ orderTotal: calcTotal, planKey: calcPlan, hasAffiliate: calcAffiliate }),
    });
    setCalcResult(await res.json());
  };

  // Live preview calculation
  const sellerCommission = (planRates as Record<string, number>)[calcPlan] || 5;
  const liveAffiliate = calcAffiliate ? affiliateRate : 0;
  const livePlatform = Math.round(calcTotal * sellerCommission / 100);
  const liveAffiliateAmt = Math.round(calcTotal * liveAffiliate / 100);
  const liveSeller = calcTotal - livePlatform - liveAffiliateAmt;
  const liveSellerPct = Math.round((liveSeller / calcTotal) * 100);

  const warning = affiliateRate > platformRate;

  // Monthly projection (1000 orders)
  const monthlyPlatform = livePlatform * 1000;

  return (
    <div>
      <div className="bg-dash-sidebar border-b border-dash-border px-8 py-4">
        <h1 className="text-white text-lg font-black">💰 Комисс тохиргоо</h1>
        <p className="text-white/35 text-xs mt-0.5">Платформ, affiliate, plan хувь удирдлага</p>
      </div>

      <div className="p-8 max-w-4xl space-y-6">
        {/* ═══ Section A: Rate config ═══ */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-6">Хувь тохируулах</h3>

          {/* Platform rate */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Платформ</span>
              <span className="text-sm font-bold text-white">{platformRate}%</span>
            </div>
            <input type="range" min={0} max={20} step={0.5} value={platformRate}
              onChange={e => setPlatformRate(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #3B82F6 ${platformRate * 5}%, #333 ${platformRate * 5}%)` }} />
          </div>

          {/* Affiliate rate */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Affiliate</span>
              <span className="text-sm font-bold text-white">{affiliateRate}%</span>
            </div>
            <input type="range" min={0} max={20} step={0.5} value={affiliateRate}
              onChange={e => setAffiliateRate(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #F59E0B ${affiliateRate * 5}%, #333 ${affiliateRate * 5}%)` }} />
          </div>

          {warning && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-xs text-red-400">Affiliate хувь ({affiliateRate}%) платформын хувиас ({platformRate}%) их байна!</span>
            </div>
          )}

          {/* Plan rates */}
          <div className="border-t border-white/[.06] pt-4 mt-2">
            <h4 className="text-xs text-white/40 uppercase tracking-wider mb-4">Subscription plan-ийн комисс</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(PLAN_LABELS).map(([key, cfg]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-xs font-bold text-white">{(planRates as Record<string, number>)[key]}%</span>
                  </div>
                  <input type="range" min={0} max={15} step={0.5}
                    value={(planRates as Record<string, number>)[key]}
                    onChange={e => setPlanRates(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${cfg.color} ${(planRates as Record<string, number>)[key] * 6.67}%, #333 ${(planRates as Record<string, number>)[key] * 6.67}%)` }} />
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-none cursor-pointer transition ${
              saved ? 'bg-green-600 text-white' : 'bg-dash-accent text-white hover:bg-[#4F46E5]'
            }`}>
            <Save className="w-4 h-4" /> {saved ? 'Хадгалсан ✓' : saving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>

        {/* ═══ Section B: Calculator ═══ */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2"><Calculator className="w-4 h-4 text-dash-accent" /> Комиссын тооцоолуур</h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Захиалгын дүн</label>
              <input type="number" value={calcTotal} onChange={e => setCalcTotal(Number(e.target.value))}
                className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none focus:border-dash-accent" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Plan</label>
              <select value={calcPlan} onChange={e => setCalcPlan(e.target.value)}
                className="w-full bg-dash-elevated text-white border border-dash-border rounded-xl px-4 py-3 text-sm outline-none cursor-pointer">
                {Object.entries(PLAN_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Affiliate</label>
              <button onClick={() => setCalcAffiliate(!calcAffiliate)}
                className="w-full py-3 rounded-xl text-sm font-semibold border cursor-pointer transition"
                style={{
                  background: calcAffiliate ? 'rgba(245,158,11,0.1)' : 'var(--esl-bg-card)',
                  borderColor: calcAffiliate ? '#F59E0B' : '#2A2A2A',
                  color: calcAffiliate ? '#F59E0B' : '#777',
                }}>
                {calcAffiliate ? 'Тийм ✓' : 'Үгүй'}
              </button>
            </div>
          </div>

          {/* Live result */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/[.02] rounded-xl p-4">
              <div className="text-[10px] text-white/40 uppercase mb-1">Дэлгүүр эзэн авна</div>
              <div className="text-2xl font-black text-green-400">{formatMNT(liveSeller)}</div>
              <div className="text-xs text-white/30">{liveSellerPct}% авна</div>
            </div>
            <div className="bg-white/[.02] rounded-xl p-4">
              <div className="text-[10px] text-white/40 uppercase mb-1">Платформ авна</div>
              <div className="text-2xl font-black text-blue-400">{formatMNT(livePlatform)}</div>
              <div className="text-xs text-white/30">{sellerCommission}% авна</div>
            </div>
            <div className="bg-white/[.02] rounded-xl p-4">
              <div className="text-[10px] text-white/40 uppercase mb-1">Affiliate авна</div>
              <div className="text-2xl font-black text-amber-400">{formatMNT(liveAffiliateAmt)}</div>
              <div className="text-xs text-white/30">{liveAffiliate}% авна</div>
            </div>
          </div>

          {/* Visual bar */}
          <div className="mb-4">
            <div className="text-xs text-white/40 mb-2">Хуваарилалт</div>
            <div className="flex h-8 rounded-lg overflow-hidden">
              <div className="flex items-center justify-center text-[10px] font-bold text-white bg-green-500 transition-all" style={{ width: `${liveSellerPct}%` }}>
                {liveSellerPct}%
              </div>
              <div className="flex items-center justify-center text-[10px] font-bold text-white bg-blue-500 transition-all" style={{ width: `${sellerCommission}%` }}>
                {sellerCommission > 3 ? `${sellerCommission}%` : ''}
              </div>
              {liveAffiliate > 0 && (
                <div className="flex items-center justify-center text-[10px] font-bold text-white bg-amber-500 transition-all" style={{ width: `${liveAffiliate}%` }}>
                  {liveAffiliate > 3 ? `${liveAffiliate}%` : ''}
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-2 text-[10px] text-white/40">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500" /> Дэлгүүр эзэн</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500" /> Платформ</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" /> Affiliate</span>
            </div>
          </div>
        </div>

        {/* ═══ Section C: Monthly projection ═══ */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Сард 1,000 захиалга байвал платформын орлого
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[.02] rounded-xl p-4">
              <div className="text-[10px] text-white/40 uppercase mb-1">Өдөрт</div>
              <div className="text-xl font-black text-white">{formatMNT(Math.round(monthlyPlatform / 30))}</div>
            </div>
            <div className="bg-white/[.02] rounded-xl p-4">
              <div className="text-[10px] text-white/40 uppercase mb-1">Сард</div>
              <div className="text-xl font-black text-white">{formatMNT(monthlyPlatform)}</div>
            </div>
            <div className="bg-white/[.02] rounded-xl p-4">
              <div className="text-[10px] text-white/40 uppercase mb-1">Жилд</div>
              <div className="text-xl font-black text-white">{formatMNT(monthlyPlatform * 12)}</div>
            </div>
          </div>
          <p className="text-[10px] text-white/20 mt-3 leading-relaxed">
            Дэлхийн benchmark: Shopify 0.5–2%, Amazon 8–15%, Wolt ~30%, Gumroad 10%. Монголын зах зээлд seller татах үед 5%, брэнд болсны дараа 8–10% оновчтой.
          </p>
        </div>
      </div>
    </div>
  );
}
