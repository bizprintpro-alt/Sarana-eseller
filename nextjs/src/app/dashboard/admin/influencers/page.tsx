'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink, Users, Star } from 'lucide-react';
import { SELLER_TIERS } from '@/lib/seller/influencerTier';

interface InfluencerRequest {
  id: string;
  displayName: string;
  username: string;
  sellerType: string;
  followers: number | null;
  socialLinks: { instagram?: string; tiktok?: string; facebook?: string } | null;
  influencerVerified: boolean;
  influencerNote: string | null;
  totalSales: number;
  totalEarned: number;
}

export default function AdminInfluencersPage() {
  const [sellers, setSellers] = useState<InfluencerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/influencers', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setSellers(data.sellers || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchSellers(); }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject', tier?: string) => {
    setActionId(id);
    const token = localStorage.getItem('token');
    await fetch('/api/admin/influencers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ id, action, tier }),
    });
    fetchSellers();
    setActionId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Star size={22} className="text-[#F59E0B]" />
        <h1 className="text-2xl font-bold text-[var(--esl-text)]">Инфлюэнсер баталгаажуулалт</h1>
      </div>

      {/* Tier legend */}
      <div className="flex flex-wrap gap-2">
        {SELLER_TIERS.map((t) => (
          <span key={t.type} className="px-3 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: `${t.color}20`, color: t.color }}>
            {t.emoji} {t.label} (+{t.bonus}%)
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[var(--esl-bg-section)] rounded-xl border border-[var(--esl-border)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--esl-text-secondary)]">Ачааллаж байна...</div>
        ) : sellers.length === 0 ? (
          <div className="p-8 text-center text-[var(--esl-text-secondary)]">Хүсэлт байхгүй</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--esl-border)] text-left text-[var(--esl-text-secondary)]">
                <th className="px-4 py-3">Борлуулагч</th>
                <th className="px-4 py-3">Дагагч</th>
                <th className="px-4 py-3">Social</th>
                <th className="px-4 py-3">Борлуулалт</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => {
                const tier = SELLER_TIERS.find((t) => t.type === s.sellerType) || SELLER_TIERS[0];
                const links = s.socialLinks || {};
                return (
                  <tr key={s.id} className="border-b border-[var(--esl-border)]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--esl-text)]">{s.displayName}</div>
                      <div className="text-xs text-[var(--esl-text-secondary)]">@{s.username}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--esl-text)]">
                      {s.followers ? s.followers.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {links.instagram && (
                          <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {links.tiktok && (
                          <a href={links.tiktok} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-600">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {links.facebook && (
                          <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--esl-text)]">{s.totalSales}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${tier.color}20`, color: tier.color }}>
                        {tier.emoji} {tier.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {!s.influencerVerified ? (
                          <>
                            <select
                              onChange={(e) => { if (e.target.value) handleAction(s.id, 'approve', e.target.value); }}
                              disabled={actionId === s.id}
                              className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg"
                              defaultValue=""
                            >
                              <option value="" disabled>Зөвшөөрөх →</option>
                              {SELLER_TIERS.slice(2).map((t) => (
                                <option key={t.type} value={t.type}>{t.emoji} {t.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAction(s.id, 'reject')}
                              disabled={actionId === s.id}
                              className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg"
                            >
                              <XCircle size={12} />
                            </button>
                          </>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle size={12} /> Баталгаажсан
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
