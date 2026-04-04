'use client';

import { useState, useEffect } from 'react';
import { Search, Store, Crown, Ban, Shield, DollarSign } from 'lucide-react';

interface SellerRow {
  id: string; name: string; email: string; phone: string | null;
  store: { name: string | null; commission: number | null } | null;
  shop: { id: string; name: string; slug: string; industry: string | null; subscription: { planKey: string; commissionRate: number | null } | null } | null;
  createdAt: string;
}

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Үнэгүй', color: '#94A3B8' },
  standard: { label: 'Стандарт', color: '#6366F1' },
  ultimate: { label: 'Алтимэйт', color: '#D97706' },
  ai_pro: { label: 'AI Pro', color: '#EC4899' },
};

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSellers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ role: 'seller' });
    if (search) params.set('q', search);
    try {
      const res = await fetch(`/api/admin/users?${params}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      // Enrich with shop data
      if (data.users) {
        const enriched = await Promise.all(data.users.map(async (u: SellerRow) => {
          try {
            const shopRes = await fetch(`/api/admin/shops?search=${encodeURIComponent(u.email)}&limit=1`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const shopData = await shopRes.json();
            const shop = shopData.data?.shops?.[0] || null;
            return { ...u, shop };
          } catch { return { ...u, shop: null }; }
        }));
        setSellers(enriched);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchSellers(); }, [search]);

  const changePlan = async (shopId: string, planKey: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/shops/${shopId}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ planKey }),
    });
    fetchSellers();
  };

  const setCommission = async (shopId: string, rate: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/shops/${shopId}/commission`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ commissionRate: rate ? parseFloat(rate) : null }),
    });
  };

  return (
    <div>
      <div className="bg-dash-sidebar border-b border-dash-border px-8 py-4">
        <h1 className="text-white text-lg font-black flex items-center gap-2"><Store className="w-5 h-5" /> Борлуулагч удирдлага</h1>
        <p className="text-white/35 text-xs mt-0.5">Plan, commission, payout удирдлага</p>
      </div>

      <div className="p-8">
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Борлуулагч хайх..."
            className="w-full pl-10 pr-4 py-2.5 bg-dash-card border border-dash-border rounded-xl text-sm text-white outline-none focus:border-dash-accent" />
        </div>

        <div className="bg-dash-card border border-dash-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[.03]">
                {['Борлуулагч', 'Дэлгүүр', 'Салбар', 'Багц', 'Комисс %', 'Үйлдэл'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-dash-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/30">Ачааллаж байна...</td></tr>
              ) : sellers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/30">Борлуулагч олдсонгүй</td></tr>
              ) : sellers.map(s => {
                const planKey = s.shop?.subscription?.planKey || 'free';
                const planInfo = PLAN_LABELS[planKey] || PLAN_LABELS.free;
                const commRate = s.shop?.subscription?.commissionRate;
                return (
                  <tr key={s.id} className="border-b border-white/[.04] hover:bg-white/[.02]">
                    <td className="px-5 py-3">
                      <div className="text-white font-semibold">{s.name}</div>
                      <div className="text-[10px] text-white/30">{s.email}</div>
                    </td>
                    <td className="px-5 py-3 text-white/60 text-xs">{s.shop?.name || s.store?.name || '—'}</td>
                    <td className="px-5 py-3 text-white/40 text-xs">{s.shop?.industry || '—'}</td>
                    <td className="px-5 py-3">
                      {s.shop ? (
                        <select value={planKey} onChange={e => changePlan(s.shop!.id, e.target.value)}
                          className="bg-dash-elevated text-white border border-dash-border rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                          style={{ color: planInfo.color }}>
                          {Object.entries(PLAN_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      ) : <span className="text-white/20 text-xs">Дэлгүүргүй</span>}
                    </td>
                    <td className="px-5 py-3">
                      {s.shop ? (
                        <div className="flex items-center gap-1">
                          <input type="number" defaultValue={commRate ?? ''} placeholder="def"
                            onBlur={e => setCommission(s.shop!.id, e.target.value)}
                            className="w-14 bg-dash-elevated text-white border border-dash-border rounded-lg px-2 py-1 text-xs outline-none" />
                          <span className="text-white/30 text-xs">%</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <span title="Verified badge"><Crown className="w-4 h-4 text-amber-400 cursor-pointer" /></span>
                        <span title="Payout"><DollarSign className="w-4 h-4 text-green-400 cursor-pointer" /></span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
