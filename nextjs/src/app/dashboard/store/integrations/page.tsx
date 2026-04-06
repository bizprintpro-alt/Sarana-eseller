'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ExternalLink, Check, X, Settings, Link2, ToggleLeft, ToggleRight,
  RefreshCw, Shield, Crown, Clock,
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: 'sales' | 'chat' | 'analytics' | 'marketing';
  tier: 'free' | 'pro';
  connected: boolean;
  lastSync?: string;
  status?: 'active' | 'error' | 'pending';
  stats?: { synced?: number; failed?: number };
}

const INTEGRATIONS: Integration[] = [
  { id: 'facebook', name: 'Facebook Shop', desc: 'Барааг Facebook Marketplace-д автоматаар sync хийх', icon: '📱', category: 'sales', tier: 'free', connected: false },
  { id: 'instagram', name: 'Instagram Shopping', desc: 'Зураг дээр бараа tag хийж шууд зарах', icon: '📸', category: 'sales', tier: 'free', connected: false },
  { id: 'messenger', name: 'Facebook Messenger', desc: 'Messenger мессежийг нэг дор удирдах', icon: '💬', category: 'chat', tier: 'free', connected: false },
  { id: 'google_merchant', name: 'Google Merchant Center', desc: 'Google Shopping-д бараа гаргах', icon: '🔍', category: 'sales', tier: 'pro', connected: false },
  { id: 'tiktok', name: 'TikTok Shop', desc: 'TikTok дээр бараа зарах', icon: '🎵', category: 'sales', tier: 'pro', connected: false },
  { id: 'viber', name: 'Viber Business', desc: 'Viber-ээр мессеж хүлээн авах', icon: '💜', category: 'chat', tier: 'free', connected: false },
  { id: 'ga4', name: 'Google Analytics 4', desc: 'Хандалт, борлуулалтын аналитик', icon: '📊', category: 'analytics', tier: 'free', connected: true, status: 'active', lastSync: 'Автомат' },
  { id: 'hotjar', name: 'Hotjar Heatmaps', desc: 'Хэрэглэгчийн зан төлөв, heatmap', icon: '🔥', category: 'analytics', tier: 'pro', connected: false },
  { id: 'mailchimp', name: 'Mailchimp Email', desc: 'Имэйл маркетинг автоматжуулалт', icon: '📧', category: 'marketing', tier: 'pro', connected: false },
];

const CATEGORIES = [
  { key: 'all', label: 'Бүгд' },
  { key: 'sales', label: '🛒 Борлуулалт' },
  { key: 'chat', label: '💬 Чат' },
  { key: 'analytics', label: '📊 Аналитик' },
  { key: 'marketing', label: '📢 Маркетинг' },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [catFilter, setCatFilter] = useState('all');
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const filtered = catFilter === 'all' ? integrations : integrations.filter((i) => i.category === catFilter);
  const connectedCount = integrations.filter((i) => i.connected).length;

  const handleConnect = (id: string) => {
    setConnectingId(id);
    // Simulate connection
    setTimeout(() => {
      setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, connected: true, status: 'active', lastSync: 'Дөнгөж сая' } : i));
      setConnectingId(null);
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, connected: false, status: undefined, lastSync: undefined } : i));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--esl-text-primary)]">Интеграцууд</h1>
          <p className="text-sm text-[var(--esl-text-secondary)]">Гадаад платформуудтай холбогдож борлуулалтаа өсгөх</p>
        </div>
        <div className="text-sm text-[var(--esl-text-secondary)] bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-xl px-4 py-2">
          <Link2 className="w-4 h-4 inline mr-1.5 text-indigo-500" />
          <span className="font-bold text-[var(--esl-text-primary)]">{connectedCount}</span>/{integrations.length} холбогдсон
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5">
        {CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => setCatFilter(c.key)}
            className={cn('px-3.5 py-2 rounded-xl text-xs font-semibold border-none cursor-pointer transition',
              catFilter === c.key ? 'bg-indigo-600 text-white' : 'bg-[var(--esl-bg-card)] text-[var(--esl-text-secondary)] border border-[var(--esl-border)] hover:bg-[var(--esl-bg-section)]')}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((intg) => (
          <div key={intg.id} className={cn('bg-[var(--esl-bg-card)] rounded-2xl border p-5 transition-all hover:shadow-sm',
            intg.connected ? 'border-green-200' : 'border-[var(--esl-border)]')}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{intg.icon}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[var(--esl-text-primary)]">{intg.name}</h3>
                    {intg.tier === 'pro' && (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--esl-text-secondary)] mt-0.5 leading-relaxed">{intg.desc}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            {intg.connected && (
              <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-green-50 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Холбогдсон
                </div>
                {intg.lastSync && (
                  <div className="flex items-center gap-1 text-[10px] text-green-600">
                    <Clock className="w-3 h-3" /> {intg.lastSync}
                  </div>
                )}
              </div>
            )}

            {/* Sync stats */}
            {intg.stats && (
              <div className="flex gap-4 mb-3 text-xs">
                <span className="text-[var(--esl-text-secondary)]">Sync: <strong className="text-[var(--esl-text-primary)]">{intg.stats.synced}</strong></span>
                {(intg.stats.failed ?? 0) > 0 && <span className="text-red-500">Алдаа: <strong>{intg.stats.failed}</strong></span>}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {intg.connected ? (
                <>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-[var(--esl-bg-section)] text-[var(--esl-text-primary)] hover:bg-[var(--esl-bg-section)] cursor-pointer border-none transition">
                    <Settings className="w-3.5 h-3.5" /> Тохиргоо
                  </button>
                  <button onClick={() => handleDisconnect(intg.id)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer border-none transition">
                    Салгах
                  </button>
                </>
              ) : (
                <button onClick={() => handleConnect(intg.id)} disabled={connectingId === intg.id}
                  className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition',
                    connectingId === intg.id ? 'bg-[var(--esl-bg-section)] text-[var(--esl-text-muted)]' :
                    intg.tier === 'pro' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                    'bg-indigo-600 text-white hover:bg-indigo-700')}>
                  {connectingId === intg.id
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Холбогдож байна...</>
                    : intg.tier === 'pro'
                    ? <><Crown className="w-3.5 h-3.5" /> Pro шаардлагатай</>
                    : <><Link2 className="w-3.5 h-3.5" /> Холбох</>}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-[var(--esl-text-primary)]">Аюулгүй холболт</h4>
          <p className="text-xs text-[var(--esl-text-secondary)] mt-0.5">Бүх холболт OAuth 2.0 стандартаар хийгдэнэ. Таны нууц үг хадгалагдахгүй. Хүссэн үедээ салгах боломжтой.</p>
        </div>
      </div>
    </div>
  );
}
