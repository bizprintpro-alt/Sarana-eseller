'use client';

import { useState, useEffect, useCallback } from 'react';
import { AffiliateAPI, WalletAPI, ProductsAPI, Product } from '@/lib/api';
import { formatPrice, DEMO_PRODUCTS, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { useToast } from '@/components/shared/Toast';

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

type Tab = 'dashboard' | 'products' | 'earnings' | 'wallet' | 'toolkit';

interface Earning {
  _id?: string;
  product?: string;
  productName?: string;
  amount?: number;
  status?: string;
  orderId?: string;
  createdAt?: string;
}

interface WalletData {
  balance?: number;
  pending?: number;
  history?: { _id?: string; amount?: number; method?: string; status?: string; createdAt?: string }[];
}

interface EarningsData {
  earnings?: Earning[];
  totalEarnings?: number;
  monthlyEarnings?: number;
  totalClicks?: number;
  conversionRate?: number;
  sparkData?: number[];
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Самбар', icon: '📊' },
  { key: 'products', label: 'Бүтээгдэхүүн', icon: '🛍️' },
  { key: 'earnings', label: 'Орлого', icon: '💰' },
  { key: 'wallet', label: 'Хэтэвч', icon: '👛' },
  { key: 'toolkit', label: 'Маркетинг', icon: '🎯' },
];

const BANKS = [
  'Хаан банк',
  'Голомт банк',
  'Худалдаа хөгжлийн банк',
  'Төрийн банк',
  'Хас банк',
  'Богд банк',
];

const SOCIAL_TEMPLATES = [
  {
    icon: '📱',
    title: 'Facebook пост',
    template: '🔥 Та энэ бүтээгдэхүүнийг шалгаж үзсэн үү? Миний линкээр орж үзээрэй! {link}',
  },
  {
    icon: '💬',
    title: 'Instagram story',
    template: '✨ Шинэ бүтээгдэхүүн олдлоо! Swipe up 👆 {link}',
  },
  {
    icon: '🐦',
    title: 'Twitter/X пост',
    template: 'Энэ бүтээгдэхүүнийг санал болгож байна 🚀 {link} #eseller #shopping',
  },
  {
    icon: '📩',
    title: 'Мессежний загвар',
    template: 'Сайн байна уу! Танд энэ бүтээгдэхүүнийг санал болгоё. Чанартай, хямд үнэтэй. {link}',
  },
];

// ═══════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [earnings, setEarnings] = useState<EarningsData>({});
  const [wallet, setWallet] = useState<WalletData>({});
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState(BANKS[0]);
  const [withdrawing, setWithdrawing] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const username = user?.username || user?.name || 'affiliate';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://eseller.mn';
  const refLink = `${baseUrl}/storefront?ref=${username}`;

  // ─── Load data ───
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, earningsRes, walletRes] = await Promise.allSettled([
        ProductsAPI.list(),
        AffiliateAPI.getEarnings(),
        WalletAPI.get(),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.products?.length) {
        setProducts(prodRes.value.products);
      } else {
        setProducts(DEMO_PRODUCTS as Product[]);
      }

      if (earningsRes.status === 'fulfilled') {
        setEarnings(earningsRes.value as EarningsData);
      } else {
        setEarnings({
          totalEarnings: 284000,
          monthlyEarnings: 67500,
          totalClicks: 1243,
          conversionRate: 4.8,
          sparkData: [12, 24, 18, 32, 28, 45, 38],
          earnings: [
            { _id: 'e1', productName: 'Premium цагаан цамц', amount: 3500, status: 'paid', createdAt: '2026-03-28T10:00:00Z' },
            { _id: 'e2', productName: 'Sporty гутал Air', amount: 6900, status: 'paid', createdAt: '2026-03-25T14:30:00Z' },
            { _id: 'e3', productName: 'Bluetooth чихэвч', amount: 9900, status: 'pending', createdAt: '2026-04-01T09:15:00Z' },
            { _id: 'e4', productName: 'Leather цүнх', amount: 7500, status: 'paid', createdAt: '2026-03-20T16:45:00Z' },
            { _id: 'e5', productName: 'Гоо сайхны багц', amount: 5200, status: 'pending', createdAt: '2026-04-02T11:00:00Z' },
          ],
        });
      }

      if (walletRes.status === 'fulfilled') {
        setWallet(walletRes.value as WalletData);
      } else {
        setWallet({ balance: 216500, pending: 67500 });
      }
    } catch {
      setProducts(DEMO_PRODUCTS as Product[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Clipboard helpers ───
  const copyToClipboard = async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.show('Линк хуулагдлаа!', 'ok');
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      toast.show('Хуулж чадсангүй', 'error');
    }
  };

  const createAffiliateLink = async (product: Product) => {
    const link = `${baseUrl}/storefront?ref=${username}&product=${product._id}`;
    try {
      await AffiliateAPI.createLink(product._id);
    } catch {
      // OK — still copy the link even if API fails
    }
    copyToClipboard(link, product._id);
  };

  // ─── Withdraw handler ───
  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      toast.show('Дүнгээ оруулна уу', 'warn');
      return;
    }
    if (amt > (wallet.balance || 0)) {
      toast.show('Үлдэгдэл хүрэлцэхгүй байна', 'error');
      return;
    }
    setWithdrawing(true);
    try {
      await WalletAPI.withdraw(amt, withdrawMethod);
      toast.show('Татан авалт амжилттай!', 'ok');
      setWithdrawAmount('');
      loadData();
    } catch {
      toast.show('Татан авалт амжилтгүй', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  // ─── Filtered products ───
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ─── Format date ───
  const fmtDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ═══════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* ── Topbar ── */}
      <header className="sticky top-0 z-30 bg-[#0F172A]/90 backdrop-blur-md border-b border-white/[.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-[#6366F1] to-[#A78BFA] bg-clip-text text-transparent">
                Борлуулагчийн самбар
              </span>
            </h1>
            <p className="text-xs text-white/40 mt-0.5">
              Сайн байна уу, <span className="text-white/60 font-semibold">{username}</span>
            </p>
          </div>
          <button
            onClick={loadData}
            className="text-xs bg-white/[.06] hover:bg-white/[.12] text-white/60 hover:text-white rounded-lg px-3 py-2 transition-all"
          >
            🔄 Шинэчлэх
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Tab navigation ── */}
        <nav className="flex gap-1 bg-[#161B2E] rounded-xl p-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
                tab === t.key
                  ? 'bg-[#6366F1] text-white shadow-[0_2px_12px_rgba(99,102,241,.35)]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[.04]'
              )}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-3 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ══════════════ DASHBOARD TAB ══════════════ */}
            {tab === 'dashboard' && (
              <div className="space-y-6">
                {/* Referral box */}
                <div className="rounded-2xl p-6 bg-gradient-to-r from-[#1E1B4B] to-[#312E81] relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[.04]" />
                  <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/[.03]" />
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-white/70 mb-1">🔗 Таны реферал линк</h3>
                    <p className="text-xs text-white/40 mb-3">
                      Энэ линкээр орсон хүмүүсийн худалдан авалтаас та шимтгэл авна
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-black/30 rounded-xl px-4 py-3 text-sm font-mono text-white/80 truncate border border-white/[.08]">
                        {refLink}
                      </div>
                      <button
                        onClick={() => copyToClipboard(refLink, 'ref')}
                        className={cn(
                          'px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0',
                          copiedId === 'ref'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-[#1E1B4B] hover:bg-white/90'
                        )}
                      >
                        {copiedId === 'ref' ? '✓ Хуулсан' : '📋 Хуулах'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon="💰"
                    label="Нийт орлого"
                    value={formatPrice(earnings.totalEarnings || 0)}
                    gradient="indigo"
                    sub="Бүх цагийн"
                    sparkData={earnings.sparkData}
                  />
                  <StatCard
                    icon="📈"
                    label="Энэ сарын"
                    value={formatPrice(earnings.monthlyEarnings || 0)}
                    gradient="pink"
                    sub="Сүүлийн 30 хоног"
                  />
                  <StatCard
                    icon="👆"
                    label="Нийт клик"
                    value={earnings.totalClicks || 0}
                    gradient="green"
                    sub="Линк дарсан"
                  />
                  <StatCard
                    icon="🎯"
                    label="Хөрвүүлэлт"
                    value={`${earnings.conversionRate || 0}%`}
                    gradient="amber"
                    sub="Клик → Захиалга"
                  />
                </div>

                {/* Recent earnings preview */}
                <div className="bg-[#161B2E] rounded-2xl border border-white/[.06] overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/[.06] flex items-center justify-between">
                    <h3 className="font-bold text-white/90">📋 Сүүлийн орлого</h3>
                    <button
                      onClick={() => setTab('earnings')}
                      className="text-xs text-[#6366F1] hover:text-[#818CF8] font-semibold transition-colors"
                    >
                      Бүгдийг харах →
                    </button>
                  </div>
                  {(earnings.earnings?.length ?? 0) > 0 ? (
                    <div className="divide-y divide-white/[.04]">
                      {earnings.earnings?.slice(0, 3).map((e) => (
                        <div key={e._id} className="px-6 py-3 flex items-center justify-between hover:bg-white/[.02] transition-colors">
                          <div>
                            <div className="text-sm font-semibold text-white/80">{e.productName}</div>
                            <div className="text-xs text-white/40">{fmtDate(e.createdAt)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full font-medium',
                              e.status === 'paid'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-amber-500/15 text-amber-400'
                            )}>
                              {e.status === 'paid' ? 'Төлсөн' : 'Хүлээгдэж буй'}
                            </span>
                            <span className="text-sm font-bold text-white/90">+{formatPrice(e.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-white/30 text-sm">Орлого байхгүй байна</div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ PRODUCTS TAB ══════════════ */}
            {tab === 'products' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
                    <input
                      type="text"
                      placeholder="Бүтээгдэхүүн хайх..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-[#161B2E] border border-white/[.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#6366F1]/50 transition-colors"
                    />
                  </div>
                  <div className="text-xs text-white/40 whitespace-nowrap">
                    {filteredProducts.length} бүтээгдэхүүн
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <EmptyState
                    icon="🛍️"
                    title="Бүтээгдэхүүн олдсонгүй"
                    description="Хайлтын үгээ өөрчилж үзнэ үү"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((p) => (
                      <div
                        key={p._id}
                        className="bg-[#161B2E] rounded-2xl border border-white/[.06] overflow-hidden hover:border-[#6366F1]/30 transition-all group"
                      >
                        {/* Product image / emoji area */}
                        <div className="h-32 bg-gradient-to-br from-[#1E1B4B]/50 to-[#0F172A] flex items-center justify-center text-5xl">
                          {p.emoji || '📦'}
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="text-sm font-bold text-white/90 truncate">{p.name}</h4>
                          {p.store?.name && (
                            <p className="text-xs text-white/40">{p.store.name}</p>
                          )}
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-white/90">
                              {formatPrice(p.salePrice || p.price)}
                            </span>
                            {p.salePrice && p.salePrice < p.price && (
                              <span className="text-xs text-white/30 line-through">
                                {formatPrice(p.price)}
                              </span>
                            )}
                          </div>
                          {p.commission && (
                            <p className="text-xs text-emerald-400/80">
                              💎 {p.commission}% шимтгэл
                            </p>
                          )}
                          <button
                            onClick={() => createAffiliateLink(p)}
                            className={cn(
                              'w-full mt-2 py-2.5 rounded-xl text-xs font-bold transition-all',
                              copiedId === p._id
                                ? 'bg-emerald-500 text-white'
                                : 'bg-[#6366F1]/15 text-[#6366F1] hover:bg-[#6366F1] hover:text-white'
                            )}
                          >
                            {copiedId === p._id ? '✓ Линк хуулагдлаа!' : '📢 Линк үүсгэх'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════ EARNINGS TAB ══════════════ */}
            {tab === 'earnings' && (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#161B2E] rounded-2xl border border-white/[.06] p-5">
                    <div className="text-xs text-white/40 mb-1">Нийт орлого</div>
                    <div className="text-2xl font-black text-white/90">{formatPrice(earnings.totalEarnings || 0)}</div>
                  </div>
                  <div className="bg-[#161B2E] rounded-2xl border border-white/[.06] p-5">
                    <div className="text-xs text-white/40 mb-1">Энэ сарын орлого</div>
                    <div className="text-2xl font-black text-[#EC4899]">{formatPrice(earnings.monthlyEarnings || 0)}</div>
                  </div>
                </div>

                {/* Earnings table */}
                <div className="bg-[#161B2E] rounded-2xl border border-white/[.06] overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/[.06]">
                    <h3 className="font-bold text-white/90">💰 Орлогын түүх</h3>
                  </div>
                  {(earnings.earnings?.length ?? 0) > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-white/30 border-b border-white/[.04]">
                            <th className="px-6 py-3 font-medium">Бүтээгдэхүүн</th>
                            <th className="px-6 py-3 font-medium">Огноо</th>
                            <th className="px-6 py-3 font-medium">Төлөв</th>
                            <th className="px-6 py-3 font-medium text-right">Дүн</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[.04]">
                          {earnings.earnings?.map((e) => (
                            <tr key={e._id} className="hover:bg-white/[.02] transition-colors">
                              <td className="px-6 py-3 font-semibold text-white/80">{e.productName || '—'}</td>
                              <td className="px-6 py-3 text-white/50">{fmtDate(e.createdAt)}</td>
                              <td className="px-6 py-3">
                                <span className={cn(
                                  'text-xs px-2.5 py-1 rounded-full font-medium',
                                  e.status === 'paid'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-amber-500/15 text-amber-400'
                                )}>
                                  {e.status === 'paid' ? '✅ Төлсөн' : '⏳ Хүлээгдэж буй'}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right font-bold text-emerald-400">
                                +{formatPrice(e.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      icon="💰"
                      title="Орлого байхгүй"
                      description="Бүтээгдэхүүний линк хуваалцаж орлого олоорой"
                      actionLabel="Бүтээгдэхүүн үзэх"
                      onAction={() => setTab('products')}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ WALLET TAB ══════════════ */}
            {tab === 'wallet' && (
              <div className="space-y-6">
                {/* Balance cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#6366F1] to-[#4338CA] rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/[.08]" />
                    <div className="relative z-10">
                      <div className="text-sm text-white/60 mb-1">Боломжит үлдэгдэл</div>
                      <div className="text-3xl font-black">{formatPrice(wallet.balance || 0)}</div>
                      <div className="text-xs text-white/40 mt-1">Татан авах боломжтой</div>
                    </div>
                  </div>
                  <div className="bg-[#161B2E] rounded-2xl border border-white/[.06] p-6">
                    <div className="text-sm text-white/40 mb-1">Хүлээгдэж буй</div>
                    <div className="text-3xl font-black text-amber-400">{formatPrice(wallet.pending || 0)}</div>
                    <div className="text-xs text-white/30 mt-1">Баталгаажих хүртэл хүлээнэ</div>
                  </div>
                </div>

                {/* Withdraw form */}
                <div className="bg-[#161B2E] rounded-2xl border border-white/[.06] p-6 space-y-4">
                  <h3 className="font-bold text-white/90">🏦 Мөнгө татах</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/40 block mb-1.5">Дүн</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full bg-[#0F172A] border border-white/[.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#6366F1]/50 transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">₮</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/40 block mb-1.5">Банк</label>
                      <select
                        value={withdrawMethod}
                        onChange={(e) => setWithdrawMethod(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/[.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#6366F1]/50 transition-colors appearance-none"
                      >
                        {BANKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawing}
                      className={cn(
                        'w-full py-3 rounded-xl text-sm font-bold transition-all',
                        withdrawing
                          ? 'bg-white/[.06] text-white/30 cursor-not-allowed'
                          : 'bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-[0_4px_16px_rgba(99,102,241,.3)] hover:shadow-[0_8px_24px_rgba(99,102,241,.4)]'
                      )}
                    >
                      {withdrawing ? '⏳ Боловсруулж байна...' : '💸 Татан авах'}
                    </button>
                  </div>
                </div>

                {/* Withdrawal history */}
                {wallet.history && wallet.history.length > 0 && (
                  <div className="bg-[#161B2E] rounded-2xl border border-white/[.06] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[.06]">
                      <h3 className="font-bold text-white/90">📜 Татан авалтын түүх</h3>
                    </div>
                    <div className="divide-y divide-white/[.04]">
                      {wallet.history.map((h) => (
                        <div key={h._id} className="px-6 py-3 flex items-center justify-between hover:bg-white/[.02] transition-colors">
                          <div>
                            <div className="text-sm font-semibold text-white/80">{h.method}</div>
                            <div className="text-xs text-white/40">{fmtDate(h.createdAt)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full font-medium',
                              h.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-amber-500/15 text-amber-400'
                            )}>
                              {h.status === 'completed' ? 'Амжилттай' : 'Хүлээгдэж буй'}
                            </span>
                            <span className="text-sm font-bold text-white/90">-{formatPrice(h.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════ MARKETING TOOLKIT TAB ══════════════ */}
            {tab === 'toolkit' && (
              <div className="space-y-6">
                {/* QR Code section */}
                <div className="bg-[#161B2E] rounded-2xl border border-white/[.06] p-6">
                  <h3 className="font-bold text-white/90 mb-4">📱 QR код үүсгэгч</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center p-3 shrink-0">
                      {/* QR Code via external API */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(refLink)}&bgcolor=ffffff&color=1E1B4B`}
                        alt="QR Code"
                        className="w-full h-full"
                        width={150}
                        height={150}
                      />
                    </div>
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <p className="text-sm text-white/60">
                        Энэ QR кодыг хэвлэж, нийтлэл дээрээ тавьж болно.
                        Уншуулсан хүн таны реферал линк рүү шилжинэ.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <a
                          href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(refLink)}&bgcolor=ffffff&color=1E1B4B&format=png`}
                          download="eseller-qr.png"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#6366F1]/15 text-[#6366F1] hover:bg-[#6366F1] hover:text-white rounded-xl text-xs font-bold transition-all"
                        >
                          📥 PNG татах
                        </a>
                        <button
                          onClick={() => copyToClipboard(refLink, 'qr')}
                          className={cn(
                            'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                            copiedId === 'qr'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/[.06] text-white/60 hover:bg-white/[.12]'
                          )}
                        >
                          {copiedId === 'qr' ? '✓ Хуулсан' : '📋 Линк хуулах'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social media templates */}
                <div className="bg-[#161B2E] rounded-2xl border border-white/[.06] p-6">
                  <h3 className="font-bold text-white/90 mb-4">📣 Нийтлэлийн загварууд</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SOCIAL_TEMPLATES.map((s, i) => (
                      <div
                        key={i}
                        className="bg-[#0F172A] rounded-xl border border-white/[.06] p-4 space-y-3 hover:border-[#6366F1]/20 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{s.icon}</span>
                          <span className="text-sm font-bold text-white/80">{s.title}</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          {s.template.replace('{link}', refLink)}
                        </p>
                        <button
                          onClick={() => copyToClipboard(s.template.replace('{link}', refLink), `social-${i}`)}
                          className={cn(
                            'w-full py-2 rounded-lg text-xs font-bold transition-all',
                            copiedId === `social-${i}`
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/[.06] text-white/50 hover:bg-white/[.12] hover:text-white/80'
                          )}
                        >
                          {copiedId === `social-${i}` ? '✓ Хуулагдлаа' : '📋 Хуулах'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-r from-[#1E1B4B]/50 to-[#312E81]/50 rounded-2xl border border-[#6366F1]/10 p-6">
                  <h3 className="font-bold text-white/90 mb-3">💡 Борлуулалтын зөвлөгөө</h3>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-start gap-2">
                      <span className="text-[#6366F1] mt-0.5">●</span>
                      Бүтээгдэхүүнийг өөрөө туршиж үзсэн бол илүү итгэлтэй санал болгоно
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6366F1] mt-0.5">●</span>
                      Story, reels зэрэг богино контент илүү хурдан тархдаг
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6366F1] mt-0.5">●</span>
                      Найзууддаа мессежээр биш, нийтлэлээр хуваалцвал илүү олон хүнд хүрнэ
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#6366F1] mt-0.5">●</span>
                      QR кодоо нийтлэл, визит карт, poster дээрээ тавиарай
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
