'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Ban, Shield, Store } from 'lucide-react';

interface ShopRow {
  id: string;
  name: string;
  slug: string;
  isBlocked: boolean;
  blockReason: string | null;
  user: { name: string; email: string };
  subscription: { planKey: string; commissionRate: number | null; expiresAt: string | null } | null;
}

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free:     { label: 'Үнэгүй',    color: '#94A3B8' },
  standard: { label: 'Стандарт',   color: '#6366F1' },
  ultimate: { label: 'Алтимэйт',  color: '#D97706' },
  ai_pro:   { label: 'AI Pro',     color: '#EC4899' },
};

export default function AdminShopsPage() {
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [planBreakdown, setPlanBreakdown] = useState({ free: 0, standard: 0, ultimate: 0, ai_pro: 0 });

  const fetchShops = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/shops?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (data.data?.shops) setShops(data.data.shops);
    if (data.data?.planBreakdown) setPlanBreakdown(data.data.planBreakdown);
    setLoading(false);
  };

  useEffect(() => { fetchShops(); }, [page, search]);

  const changePlan = async (shopId: string, planKey: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/shops/${shopId}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ planKey }),
    });
    fetchShops();
  };

  const setCommission = async (shopId: string, rate: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/shops/${shopId}/commission`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ commissionRate: rate ? parseFloat(rate) : null }),
    });
    fetchShops();
  };

  const toggleBlock = async (shopId: string, blocked: boolean) => {
    if (blocked && !confirm('Энэ дэлгүүрийг блоклох уу?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/shops/${shopId}/block`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ blocked, reason: blocked ? 'Админ блоклосон' : null }),
    });
    fetchShops();
  };

  return (
    <div>
      <div className="bg-dash-sidebar border-b border-dash-border px-8 py-4">
        <h1 className="text-white text-lg font-black flex items-center gap-2"><Store className="w-5 h-5" /> Дэлгүүр удирдлага</h1>
        <p className="text-white/35 text-xs mt-0.5">Багц, комисс, блоклох</p>
      </div>

      <div className="p-8">
        {/* Plan breakdown */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.entries(PLAN_LABELS).map(([key, { label, color }]) => (
            <div key={key} className="bg-dash-card border border-dash-border rounded-xl p-4">
              <div className="text-xs text-white/40 mb-1">{label}</div>
              <div className="text-2xl font-black" style={{ color }}>{(planBreakdown as Record<string, number>)[key] || 0}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Дэлгүүр хайх..."
            className="w-full pl-10 pr-4 py-2.5 bg-dash-card border border-dash-border rounded-xl text-sm text-white outline-none focus:border-dash-accent" />
        </div>

        {/* Table */}
        <div className="bg-dash-card border border-dash-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[.03]">
                  {['Дэлгүүр', 'Эзэн', 'Багц', 'Комисс %', 'Статус', 'Үйлдэл'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-dash-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shops.map(shop => {
                  const planKey = shop.subscription?.planKey || 'free';
                  const planInfo = PLAN_LABELS[planKey] || PLAN_LABELS.free;
                  const commRate = shop.subscription?.commissionRate;
                  return (
                    <tr key={shop.id} className={`border-b border-white/[.04] hover:bg-white/[.02] ${shop.isBlocked ? 'bg-red-500/5' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="text-white font-bold">{shop.name}</div>
                        <div className="text-[10px] text-white/30">{shop.slug}</div>
                      </td>
                      <td className="px-5 py-3 text-white/50 text-xs">{shop.user?.email || '—'}</td>
                      <td className="px-5 py-3">
                        <select value={planKey} onChange={e => changePlan(shop.id, e.target.value)}
                          className="bg-dash-elevated text-white border border-dash-border rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                          style={{ color: planInfo.color }}>
                          {Object.entries(PLAN_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            defaultValue={commRate ?? ''}
                            placeholder="default"
                            onBlur={e => setCommission(shop.id, e.target.value)}
                            className="w-16 bg-dash-elevated text-white border border-dash-border rounded-lg px-2 py-1 text-xs outline-none"
                          />
                          <span className="text-white/30 text-xs">%</span>
                          {commRate != null && (
                            <button onClick={() => setCommission(shop.id, '')}
                              className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border-none cursor-pointer">
                              reset
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {shop.isBlocked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-500/15 text-red-400">Блоклогдсон</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-green-500/15 text-green-400">Идэвхтэй</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => toggleBlock(shop.id, !shop.isBlocked)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border-none cursor-pointer ${
                            shop.isBlocked ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                          {shop.isBlocked ? <><Shield className="w-3 h-3" /> Блок арилгах</> : <><Ban className="w-3 h-3" /> Блоклох</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {loading && <div className="text-center text-white/30 py-8 text-sm">Ачааллаж байна...</div>}
        </div>
      </div>
    </div>
  );
}
