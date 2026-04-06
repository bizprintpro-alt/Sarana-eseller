'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';
import {
  Users, Check, X, Eye, TrendingUp, Clock, Share2, Search,
  ChevronRight, Star, ShoppingBag, BarChart3,
} from 'lucide-react';

/* ═══ Demo Data ═══ */
interface SellerRequest {
  id: string;
  seller: { displayName: string; username: string; avatar?: string; bio?: string; totalSales: number; commissionRate: number };
  products: { id: string; name: string; price: number; emoji: string }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  clicks?: number;
  conversions?: number;
  earned?: number;
}

const DEMO_REQUESTS: SellerRequest[] = [
  {
    id: 'sr1', status: 'pending', createdAt: '2026-04-04',
    seller: { displayName: 'Б. Баяраа', username: 'bayaraa', bio: 'Электроник, гоо сайхны борлуулагч', totalSales: 0, commissionRate: 15 },
    products: [
      { id: 'p1', name: 'iPhone 15 Pro', price: 3800000, emoji: '📱' },
      { id: 'p2', name: 'Wireless Earbuds', price: 65000, emoji: '🎧' },
    ],
  },
  {
    id: 'sr2', status: 'pending', createdAt: '2026-04-05',
    seller: { displayName: 'О. Сарантуяа', username: 'sarantuya', bio: 'Fashion борлуулагч, Instagram 5K+', totalSales: 0, commissionRate: 12 },
    products: [
      { id: 'p3', name: 'Cashmere цамц', price: 89000, emoji: '👗' },
      { id: 'p4', name: 'Арьсан цүнх', price: 145000, emoji: '👜' },
      { id: 'p5', name: 'Алтан бугуйвч', price: 35000, emoji: '💍' },
    ],
  },
];

const DEMO_APPROVED: SellerRequest[] = [
  {
    id: 'sr3', status: 'approved', createdAt: '2026-03-20',
    seller: { displayName: 'Д. Ганбаатар', username: 'ganbaa', totalSales: 28, commissionRate: 10 },
    products: [{ id: 'p6', name: 'Yoga mat', price: 55000, emoji: '🧘' }],
    clicks: 342, conversions: 28, earned: 154000,
  },
  {
    id: 'sr4', status: 'approved', createdAt: '2026-03-15',
    seller: { displayName: 'Э. Мөнхзул', username: 'munkhzul', totalSales: 45, commissionRate: 15 },
    products: [{ id: 'p7', name: 'Face serum', price: 45000, emoji: '✨' }, { id: 'p8', name: 'Lip gloss', price: 25000, emoji: '💄' }],
    clicks: 567, conversions: 45, earned: 303750,
  },
  {
    id: 'sr5', status: 'approved', createdAt: '2026-03-10',
    seller: { displayName: 'Б. Тэмүүлэн', username: 'temuulen', totalSales: 12, commissionRate: 10 },
    products: [{ id: 'p9', name: 'Bluetooth speaker', price: 85000, emoji: '🔊' }],
    clicks: 189, conversions: 12, earned: 102000,
  },
];

type Tab = 'pending' | 'approved' | 'all';

export default function SellerApprovalsPage() {
  const [tab, setTab] = useState<Tab>('pending');
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [approved] = useState(DEMO_APPROVED);
  const [search, setSearch] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setRejectId(null);
    setRejectReason('');
  };

  const totalEarned = approved.reduce((s, a) => s + (a.earned || 0), 0);
  const totalConversions = approved.reduce((s, a) => s + (a.conversions || 0), 0);
  const totalClicks = approved.reduce((s, a) => s + (a.clicks || 0), 0);

  const filteredApproved = search
    ? approved.filter(a => a.seller.displayName.toLowerCase().includes(search.toLowerCase()))
    : approved;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--esl-text-primary)' }}>Борлуулагчид</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--esl-text-muted)' }}>
            Борлуулагчдын хүсэлт батлах, гүйцэтгэл хянах
          </p>
        </div>
        {requests.length > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(232,36,44,0.1)] text-[#E8242C] text-xs font-bold rounded-full">
            <Clock className="w-3 h-3" /> {requests.length} хүсэлт хүлээгдэж байна
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Нийт борлуулагч" value={approved.length} variant="primary" />
        <StatCard icon="💰" label="Нийт комисс төлсөн" value={formatPrice(totalEarned)} variant="warning" />
        <StatCard icon="🎯" label="Нийт борлуулалт" value={totalConversions} variant="success" />
        <StatCard icon="👆" label="Нийт клик" value={totalClicks} variant="info" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--esl-bg-section)' }}>
        {[
          { key: 'pending' as Tab, label: `Хүсэлт (${requests.length})`, icon: Clock },
          { key: 'approved' as Tab, label: `Идэвхтэй (${approved.length})`, icon: Check },
          { key: 'all' as Tab, label: 'Бүгд', icon: Users },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all ${
              tab === t.key ? 'bg-[var(--esl-bg-card)] text-[var(--esl-text-primary)] shadow-sm' : 'bg-transparent text-[var(--esl-text-muted)]'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ PENDING REQUESTS ═══ */}
      {(tab === 'pending' || tab === 'all') && requests.length > 0 && (
        <div className="space-y-4">
          {tab === 'all' && <h3 className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>Хүлээгдэж буй хүсэлтүүд</h3>}
          {requests.map(req => (
            <div key={req.id} className="rounded-2xl border overflow-hidden" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
              {/* Seller info */}
              <div className="p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[rgba(232,36,44,0.1)] flex items-center justify-center text-lg font-bold text-[#E8242C] shrink-0">
                  {req.seller.displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--esl-text-primary)' }}>{req.seller.displayName}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--esl-bg-section)', color: 'var(--esl-text-muted)' }}>@{req.seller.username}</span>
                  </div>
                  {req.seller.bio && <p className="text-xs mb-2" style={{ color: 'var(--esl-text-secondary)' }}>{req.seller.bio}</p>}
                  <p className="text-xs" style={{ color: 'var(--esl-text-muted)' }}>Комисс: <strong className="text-[#E8242C]">{req.seller.commissionRate}%</strong> · Огноо: {req.createdAt}</p>
                </div>
              </div>

              {/* Requested products */}
              <div className="px-5 pb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--esl-text-muted)' }}>Хүссэн бараанууд ({req.products.length})</p>
                <div className="flex gap-2 flex-wrap">
                  {req.products.map(p => (
                    <span key={p.id} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border" style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }}>
                      {p.emoji} {p.name} · <strong className="text-[#E8242C]">{formatPrice(p.price)}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 flex gap-2 border-t" style={{ borderColor: 'var(--esl-border)' }}>
                <button onClick={() => handleApprove(req.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold bg-[#E8242C] text-white border-none cursor-pointer hover:bg-[#C41E25] transition">
                  <Check className="w-4 h-4" /> Зөвшөөрөх
                </button>
                <button onClick={() => setRejectId(req.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold border cursor-pointer hover:bg-[var(--esl-bg-section)] transition" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-secondary)' }}>
                  <X className="w-4 h-4" /> Татгалзах
                </button>
              </div>

              {/* Reject reason modal (inline) */}
              {rejectId === req.id && (
                <div className="px-5 pb-4 border-t" style={{ borderColor: 'var(--esl-border)' }}>
                  <p className="text-xs font-semibold mb-2 mt-3" style={{ color: 'var(--esl-text-primary)' }}>Татгалзах шалтгаан:</p>
                  <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    placeholder="Шалтгаан бичнэ үү..."
                    className="w-full p-3 rounded-lg border text-sm resize-none outline-none focus:border-[#E8242C]"
                    style={{ background: 'var(--esl-bg-section)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }}
                    rows={2} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleReject(req.id)} className="px-4 py-2 bg-[#E8242C] text-white text-xs font-bold rounded-lg border-none cursor-pointer">Илгээх</button>
                    <button onClick={() => setRejectId(null)} className="px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-muted)' }}>Болих</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══ APPROVED SELLERS ═══ */}
      {(tab === 'approved' || tab === 'all') && (
        <div className="space-y-4">
          {tab === 'all' && <h3 className="text-sm font-bold mt-4" style={{ color: 'var(--esl-text-primary)' }}>Идэвхтэй борлуулагчид</h3>}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--esl-text-muted)' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Борлуулагч хайх..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[#E8242C]"
              style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)', color: 'var(--esl-text-primary)' }} />
          </div>

          {/* Table */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--esl-bg-card)', borderColor: 'var(--esl-border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--esl-border)' }}>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--esl-text-muted)' }}>Борлуулагч</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--esl-text-muted)' }}>Бараа</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--esl-text-muted)' }}>Клик</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--esl-text-muted)' }}>Борлуулалт</th>
                  <th className="text-right px-5 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--esl-text-muted)' }}>Комисс</th>
                </tr>
              </thead>
              <tbody>
                {filteredApproved.map(a => (
                  <tr key={a.id} className="hover:bg-[var(--esl-bg-section)] transition-colors" style={{ borderBottom: '1px solid var(--esl-border)' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[rgba(232,36,44,0.1)] flex items-center justify-center text-xs font-bold text-[#E8242C]">
                          {a.seller.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--esl-text-primary)' }}>{a.seller.displayName}</p>
                          <p className="text-[10px]" style={{ color: 'var(--esl-text-muted)' }}>@{a.seller.username} · {a.seller.commissionRate}%</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3.5 text-sm font-medium" style={{ color: 'var(--esl-text-primary)' }}>{a.products.length}</td>
                    <td className="text-center px-3 py-3.5 text-sm" style={{ color: 'var(--esl-text-secondary)' }}>{a.clicks || 0}</td>
                    <td className="text-center px-3 py-3.5 text-sm font-semibold" style={{ color: 'var(--esl-text-primary)' }}>{a.conversions || 0}</td>
                    <td className="text-right px-5 py-3.5 text-sm font-bold text-[#E8242C]">{formatPrice(a.earned || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {tab === 'pending' && requests.length === 0 && (
        <div className="text-center py-16">
          <span className="text-4xl block mb-3">✅</span>
          <p className="text-sm font-semibold" style={{ color: 'var(--esl-text-primary)' }}>Хүлээгдэж буй хүсэлт байхгүй</p>
          <p className="text-xs mt-1" style={{ color: 'var(--esl-text-muted)' }}>Борлуулагчид бараагаа share хийж эхлэхэд хүсэлт ирнэ</p>
        </div>
      )}
    </div>
  );
}
