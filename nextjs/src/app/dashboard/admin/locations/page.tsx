'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn, formatPrice } from '@/lib/utils';
import {
  Search, MapPin, Check, X, AlertCircle, ChevronLeft, ChevronRight,
  Download, Plus, Filter, RefreshCw, ExternalLink, Save,
} from 'lucide-react';

/* ═══ Types ═══ */
interface ShopLocation {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  lat?: number | null;
  lng?: number | null;
  district?: string | null;
  khoroo?: string | null;
  locationNote?: string | null;
  locationStatus: string;
  locationVerifiedAt?: string | null;
  user?: { name: string; email: string };
  shopType?: { type: string } | null;
}

interface Stats { total: number; verified: number; pending: number; noCoords: number }

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  verified: { label: 'Баталгаажсан', color: 'text-green-400', bg: 'bg-green-500/15' },
  pending: { label: 'Хүлээгдэж буй', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  rejected: { label: 'Татгалзсан', color: 'text-red-400', bg: 'bg-red-500/15' },
};

const DISTRICTS = ['СБД', 'ЧД', 'БЗД', 'ХУД', 'СХД', 'БГД', 'НД', 'ХН-Уул', 'Налайх', 'Багануур'];

/* ═══ Demo Data (API fallback) ═══ */
const DEMO_SHOPS: ShopLocation[] = [
  { id: '1', name: 'Misheel Market', slug: 'misheel', industry: 'Хүнсний дэлгүүр', lat: 47.8894, lng: 106.9175, district: 'Хан-Уул', khoroo: '19-р хороо', locationStatus: 'verified', user: { name: 'Б. Батболд', email: 'b@test.mn' } },
  { id: '2', name: 'TechUB Store', slug: 'techub', industry: 'Электроник', lat: 47.9168, lng: 106.9177, district: 'СБД', khoroo: '1-р хороо', locationStatus: 'verified', user: { name: 'Д. Дорж', email: 'd@test.mn' } },
  { id: '3', name: 'FashionMN', slug: 'fashionmn', industry: 'Хувцас', lat: 47.9088, lng: 106.9204, district: 'БЗД', khoroo: '3-р хороо', locationStatus: 'pending', user: { name: 'О. Оюунаа', email: 'o@test.mn' } },
  { id: '4', name: 'BeautyMN', slug: 'beautymn', industry: 'Гоо сайхан', lat: null, lng: null, district: 'ЧД', khoroo: '14-р хороо', locationStatus: 'pending', user: { name: 'С. Сараа', email: 's@test.mn' } },
  { id: '5', name: 'SportsMN', slug: 'sportsmn', industry: 'Спорт', lat: 47.9231, lng: 106.9413, district: 'СХД', khoroo: '2-р хороо', locationStatus: 'verified', user: { name: 'Г. Ган-Эрдэнэ', email: 'g@test.mn' } },
  { id: '6', name: 'GreenMN', slug: 'greenmn', industry: 'Гэр ахуй', lat: null, lng: null, district: 'НД', khoroo: '5-р хороо', locationStatus: 'pending', user: { name: 'Н. Нараа', email: 'n@test.mn' } },
  { id: '7', name: 'LuxuryMN', slug: 'luxurymn', industry: 'Хувцас', lat: 47.9145, lng: 106.9092, district: 'СБД', khoroo: '8-р хороо', locationStatus: 'pending', user: { name: 'Л. Лхагва', email: 'l@test.mn' } },
  { id: '8', name: 'BurgerMN', slug: 'burgermn', industry: 'Хоол хүнс', lat: 47.9052, lng: 106.9301, district: 'БЗД', khoroo: '7-р хороо', locationStatus: 'verified', user: { name: 'Б. Бат-Эрдэнэ', email: 'bb@test.mn' } },
  { id: '9', name: 'PizzaMN', slug: 'pizzamn', industry: 'Хоол хүнс', lat: null, lng: null, district: 'ЧД', khoroo: '11-р хороо', locationStatus: 'pending', user: { name: 'П. Пүрэв', email: 'p@test.mn' } },
  { id: '10', name: 'HomeDecorMN', slug: 'homedecormn', industry: 'Гэр ахуй', lat: 47.9312, lng: 106.8754, district: 'ХУД', khoroo: '2-р хороо', locationStatus: 'verified', user: { name: 'Х. Хишигт', email: 'h@test.mn' } },
];

const DEMO_STATS: Stats = { total: 312, verified: 241, pending: 48, noCoords: 23 };

/* ═══ Page ═══ */
export default function AdminLocationsPage() {
  const [shops, setShops] = useState<ShopLocation[]>(DEMO_SHOPS);
  const [stats, setStats] = useState<Stats>(DEMO_STATS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<ShopLocation | null>(null);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Edit state for right panel
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editKhoroo, setEditKhoroo] = useState('');
  const [editNote, setEditNote] = useState('');

  // Select a shop
  const selectShop = (shop: ShopLocation) => {
    setSelected(shop);
    setEditLat(shop.lat?.toString() || '');
    setEditLng(shop.lng?.toString() || '');
    setEditDistrict(shop.district || '');
    setEditKhoroo(shop.khoroo || '');
    setEditNote(shop.locationNote || '');
  };

  // Filter
  const filtered = shops.filter((s) => {
    if (statusFilter === 'verified' && s.locationStatus !== 'verified') return false;
    if (statusFilter === 'pending' && s.locationStatus !== 'pending') return false;
    if (statusFilter === 'no_coords' && s.lat !== null) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || (s.district || '').toLowerCase().includes(q) || (s.industry || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Save location
  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/shops/${selected.id}/location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lat: editLat ? parseFloat(editLat) : null,
          lng: editLng ? parseFloat(editLng) : null,
          district: editDistrict || null,
          khoroo: editKhoroo || null,
          locationNote: editNote || null,
        }),
      });
      // Update local
      setShops((prev) => prev.map((s) => s.id === selected.id ? {
        ...s, lat: editLat ? parseFloat(editLat) : null, lng: editLng ? parseFloat(editLng) : null,
        district: editDistrict, khoroo: editKhoroo, locationNote: editNote,
      } : s));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally { setSaving(false); }
  };

  // Verify/Reject
  const handleStatusChange = async (status: string) => {
    if (!selected) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/shops/${selected.id}/location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ locationStatus: status }),
      });
      setShops((prev) => prev.map((s) => s.id === selected.id ? { ...s, locationStatus: status } : s));
      setSelected((prev) => prev ? { ...prev, locationStatus: status } : null);
    } catch {}
  };

  const verifiedPct = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Байршил удирдлага</h1>
          <p className="text-sm text-gray-500 mt-0.5">Админ · Дэлгүүр / байршил баталгаажуулалт</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition">
            <Download className="w-3.5 h-3.5" /> CSV экспорт
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 cursor-pointer transition border-none">
            <Plus className="w-3.5 h-3.5" /> Дэлгүүр нэмэх
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Нийт дэлгүүр', value: stats.total, sub: 'Бүртгэлтэй', color: 'text-white' },
          { label: 'Байршил баталгаажсан', value: stats.verified, sub: `${verifiedPct}% хувь`, color: 'text-green-400' },
          { label: 'Хүлээгдэж буй', value: stats.pending, sub: 'Шалгах шаардлагатай', color: 'text-amber-400' },
          { label: 'Координатгүй', value: stats.noCoords, sub: 'Засах шаардлагатай', color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#1A1A2E] rounded-xl p-4 text-white">
            <div className="text-xs text-white/50 mb-1">{s.label}</div>
            <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500">Байршлын бүрэн байдал</span>
          <span className="font-bold text-gray-900">{verifiedPct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', verifiedPct >= 80 ? 'bg-green-500' : verifiedPct >= 50 ? 'bg-amber-500' : 'bg-red-500')}
            style={{ width: `${verifiedPct}%` }} />
        </div>
      </div>

      {/* Main content — Table + Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ Table ═══ */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search + filter */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Дэлгүүр хайх..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none">
                <option value="all">Бүгд</option>
                <option value="verified">Баталгаажсан</option>
                <option value="pending">Хүлээгдэж буй</option>
                <option value="no_coords">Координатгүй</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-2.5 w-8"><input type="checkbox" className="rounded" /></th>
                  <th className="px-4 py-2.5 font-medium">Дэлгүүр</th>
                  <th className="px-4 py-2.5 font-medium">Байршил</th>
                  <th className="px-4 py-2.5 font-medium">Координат</th>
                  <th className="px-4 py-2.5 font-medium">Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((shop) => {
                  const st = STATUS_MAP[shop.locationStatus] || STATUS_MAP.pending;
                  const isActive = selected?.id === shop.id;
                  return (
                    <tr key={shop.id} onClick={() => selectShop(shop)}
                      className={cn('cursor-pointer transition', isActive ? 'bg-indigo-50' : 'hover:bg-gray-50/50')}>
                      <td className="px-4 py-3"><input type="checkbox" className="rounded" onClick={(e) => e.stopPropagation()} /></td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{shop.name}</div>
                        <div className="text-[10px] text-gray-400">{shop.industry || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-700">{shop.district || '—'}</div>
                        <div className="text-[10px] text-gray-400">{shop.khoroo || ''}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {shop.lat && shop.lng ? (
                          <span className="text-gray-700">{shop.lat.toFixed(4)}, {shop.lng.toFixed(4)}</span>
                        ) : (
                          <span className="text-red-400 font-medium">Оруулаагүй</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', st.bg, st.color)}>
                          {shop.lat && shop.lng ? '' : '● '}{st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              <span>{stats.total}-с {((page - 1) * 10) + 1}–{Math.min(page * 10, stats.total)} харагдаж байна</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 bg-white">
                  <ChevronLeft className="w-3 h-3" />
                </button>
                {[1, 2, 3].map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={cn('w-7 h-7 rounded border flex items-center justify-center cursor-pointer text-xs font-medium',
                      page === p ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'border-gray-200 hover:bg-gray-50 bg-white')}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(page + 1)} className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 bg-white">
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-700">Хурдан шүүлтүүр</h4>
            {[
              { label: `Координатгүй дэлгүүрүүд (${stats.noCoords})`, color: 'text-red-500', dot: 'bg-red-500', filter: 'no_coords' },
              { label: `Баталгаажуулалт хүлээгдэж буй (${stats.pending})`, color: 'text-amber-500', dot: 'bg-amber-500', filter: 'pending' },
            ].map((f) => (
              <button key={f.filter} onClick={() => setStatusFilter(f.filter)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-left cursor-pointer bg-transparent border-none transition">
                <span className={cn('w-2 h-2 rounded-full', f.dot)} />
                <span className={cn('text-xs font-medium', f.color)}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Right Panel ═══ */}
        <div className="space-y-4">
          {selected ? (
            <>
              {/* Map placeholder */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                  {selected.lat && selected.lng ? (
                    <iframe
                      src={`https://maps.google.com/maps?q=${selected.lat},${selected.lng}&z=15&output=embed`}
                      className="w-full h-full border-none"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Дэлгүүр сонгоно уу</p>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 text-sm">{selected.name}</h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Өргөрөг (lat)</label>
                      <input type="text" value={editLat} onChange={(e) => setEditLat(e.target.value)} placeholder="47.9077..."
                        className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Уртраг (lng)</label>
                      <input type="text" value={editLng} onChange={(e) => setEditLng(e.target.value)} placeholder="106.8832..."
                        className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Дүүрэг</label>
                    <select value={editDistrict} onChange={(e) => setEditDistrict(e.target.value)}
                      className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none">
                      <option value="">—</option>
                      {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Хороо</label>
                    <input type="text" value={editKhoroo} onChange={(e) => setEditKhoroo(e.target.value)} placeholder="1-р хороо"
                      className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Ойролцоох газар</label>
                    <input type="text" value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Улаанбаатар хотын..."
                      className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition',
                        saved ? 'bg-green-600 text-white' : 'bg-[#1A1A2E] text-white hover:bg-[#2D2B55]')}>
                      {saved ? <><Check className="w-3.5 h-3.5" /> Хадгалсан</> : <><Save className="w-3.5 h-3.5" /> Хадгалах</>}
                    </button>
                    <button className="w-10 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 bg-white" title="Газрын зураг дээр тэмдэглэх">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-gray-700 mb-2">Баталгаажуулалт</h4>
                <div className="flex gap-2">
                  <button onClick={() => handleStatusChange('verified')}
                    className={cn('flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer transition border-none',
                      selected.locationStatus === 'verified' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100')}>
                    <Check className="w-3 h-3 inline mr-1" /> Баталгаажуулах
                  </button>
                  <button onClick={() => handleStatusChange('rejected')}
                    className={cn('flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer transition border-none',
                      selected.locationStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100')}>
                    <X className="w-3 h-3 inline mr-1" /> Татгалзах
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-400">Дэлгүүр сонгоно уу</p>
              <p className="text-xs text-gray-300 mt-1">Зүүн талын хүснэгтээс дэлгүүр сонговол газрын зургийн мэдээлэл харагдана</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
