'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ENTITY_LABELS, type EntityType } from '@/lib/types/entity';
import {
  Search, Filter, Check, X, Eye, Shield, Ban, MoreVertical,
  ChevronLeft, ChevronRight, Download, Building2, Users,
} from 'lucide-react';

interface EntityRow {
  id: string;
  name: string;
  slug: string;
  type: EntityType;
  ownerEmail: string;
  status: 'active' | 'pending' | 'suspended';
  isVerified: boolean;
  itemCount: number;
  joinedDate: string;
}

const DEMO_ENTITIES: EntityRow[] = [
  { id: '1', name: 'FashionMN', slug: 'fashionmn', type: 'store', ownerEmail: 'fashion@test.mn', status: 'active', isVerified: true, itemCount: 156, joinedDate: '2025-08-15' },
  { id: '2', name: 'Б. Эрдэнэбат', slug: 'erdenbat', type: 'agent', ownerEmail: 'erdenbat@test.mn', status: 'active', isVerified: true, itemCount: 24, joinedDate: '2025-09-20' },
  { id: '3', name: 'Монголиан Пропертиз', slug: 'mongolian-properties', type: 'company', ownerEmail: 'mp@test.mn', status: 'active', isVerified: true, itemCount: 8, joinedDate: '2025-07-01' },
  { id: '4', name: 'AutoCity Mongolia', slug: 'autocity', type: 'auto_dealer', ownerEmail: 'auto@test.mn', status: 'active', isVerified: true, itemCount: 45, joinedDate: '2025-10-05' },
  { id: '5', name: 'DigitalMN Studio', slug: 'digitalmn', type: 'service', ownerEmail: 'digital@test.mn', status: 'pending', isVerified: false, itemCount: 12, joinedDate: '2026-01-15' },
  { id: '6', name: 'Sarana Salon', slug: 'demo-salon', type: 'store', ownerEmail: 'salon@test.mn', status: 'active', isVerified: true, itemCount: 8, joinedDate: '2025-11-20' },
  { id: '7', name: 'Premium Auto', slug: 'premiumauto', type: 'auto_dealer', ownerEmail: 'premium@test.mn', status: 'pending', isVerified: false, itemCount: 18, joinedDate: '2026-02-10' },
  { id: '8', name: 'С. Нармандах', slug: 'narmandakh', type: 'agent', ownerEmail: 'narma@test.mn', status: 'suspended', isVerified: false, itemCount: 3, joinedDate: '2026-03-01' },
];

const TYPE_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'Бүгд' },
  ...Object.entries(ENTITY_LABELS).map(([key, val]) => ({ key, label: val.emoji + ' ' + val.label })),
];

export default function AdminEntitiesPage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = DEMO_ENTITIES.filter((e) => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total: DEMO_ENTITIES.length,
    verified: DEMO_ENTITIES.filter((e) => e.isVerified).length,
    pending: DEMO_ENTITIES.filter((e) => e.status === 'pending').length,
    suspended: DEMO_ENTITIES.filter((e) => e.status === 'suspended').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--esl-text-primary)]">Бүх нэгж удирдлага</h1>
          <p className="text-sm text-[var(--esl-text-secondary)]">Дэлгүүр, агент, компани, авто, үйлчилгээ</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-xl text-xs font-semibold hover:bg-[var(--esl-bg-section)] cursor-pointer transition">
          <Download className="w-3.5 h-3.5" /> CSV экспорт
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Нийт нэгж', value: counts.total, color: 'text-white' },
          { label: 'Баталгаажсан', value: counts.verified, color: 'text-green-400' },
          { label: 'Хүлээгдэж буй', value: counts.pending, color: 'text-amber-400' },
          { label: 'Түдгэлзүүлсэн', value: counts.suspended, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#1A1A2E] rounded-xl p-4 text-white">
            <div className="text-[10px] text-white/50 mb-1">{s.label}</div>
            <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-xl p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--esl-text-muted)]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Нэгж хайх..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--esl-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-[var(--esl-border)] rounded-lg text-xs bg-[var(--esl-bg-card)] cursor-pointer">
            <option value="all">Бүх статус</option>
            <option value="active">Идэвхтэй</option>
            <option value="pending">Хүлээгдэж буй</option>
            <option value="suspended">Түдгэлзсэн</option>
          </select>
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {TYPE_TABS.map((t) => (
            <button key={t.key} onClick={() => setTypeFilter(t.key)}
              className={cn('shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition',
                typeFilter === t.key ? 'bg-[#1A1A2E] text-white' : 'bg-[var(--esl-bg-section)] text-[var(--esl-text-secondary)] hover:bg-[var(--esl-bg-section)]')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] text-[var(--esl-text-secondary)] uppercase tracking-wider border-b border-[var(--esl-border)] bg-[var(--esl-bg-section)]/50">
              <th className="px-4 py-2.5 w-8"><input type="checkbox" className="rounded" /></th>
              <th className="px-4 py-2.5">Нэгж</th>
              <th className="px-4 py-2.5">Төрөл</th>
              <th className="px-4 py-2.5">Эзэмшигч</th>
              <th className="px-4 py-2.5">Статус</th>
              <th className="px-4 py-2.5">Баталгаа</th>
              <th className="px-4 py-2.5">Зар</th>
              <th className="px-4 py-2.5">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((e) => {
              const info = ENTITY_LABELS[e.type];
              return (
                <tr key={e.id} className="hover:bg-[var(--esl-bg-section)]/50 transition">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[var(--esl-text-primary)]">{e.name}</div>
                    <div className="text-[10px] text-[var(--esl-text-muted)]">/{e.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                      {info?.emoji} {info?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--esl-text-secondary)]">{e.ownerEmail}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full',
                      e.status === 'active' ? 'bg-green-100 text-green-700' : e.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
                      {e.status === 'active' ? 'Идэвхтэй' : e.status === 'pending' ? 'Хүлээгдэж буй' : 'Түдгэлзсэн'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {e.isVerified ? <Shield className="w-4 h-4 text-blue-500 fill-blue-500" /> : <span className="text-xs text-[var(--esl-text-muted)]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[var(--esl-text-primary)]">{e.itemCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="w-7 h-7 rounded-lg bg-transparent border border-[var(--esl-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--esl-bg-section)] transition" title="Харах">
                        <Eye className="w-3.5 h-3.5 text-[var(--esl-text-muted)]" />
                      </button>
                      {!e.isVerified && e.status === 'pending' && (
                        <button className="w-7 h-7 rounded-lg bg-green-50 border-none flex items-center justify-center cursor-pointer hover:bg-green-100 transition" title="Баталгаажуулах">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        </button>
                      )}
                      <button className="w-7 h-7 rounded-lg bg-transparent border border-[var(--esl-border)] flex items-center justify-center cursor-pointer hover:bg-red-50 transition" title="Түдгэлзүүлэх">
                        <Ban className="w-3.5 h-3.5 text-[var(--esl-text-muted)]" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
