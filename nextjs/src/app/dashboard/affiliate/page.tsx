'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AffiliateAPI, WalletAPI, ProductsAPI, Product } from '@/lib/api';
import { formatPrice, DEMO_PRODUCTS, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { useToast } from '@/components/shared/Toast';
import {
  Copy, Check, Share2, DollarSign,
  Search, Wallet, ArrowUpRight,
  Zap, Users, BarChart3, Megaphone, Gift, Star, ChevronRight, TrendingUp, QrCode,
} from 'lucide-react';
import TierProgress from '@/components/affiliate/TierProgress';
import ConversionFunnel from '@/components/affiliate/ConversionFunnel';
import ChannelPerformance from '@/components/affiliate/ChannelPerformance';
import AISuggestions from '@/components/affiliate/AISuggestions';
import SalesToolkit from '@/components/affiliate/SalesToolkit';
import AIProductMentor from '@/components/affiliate/AIProductMentor';
import AIMarketingStudio from '@/components/affiliate/AIMarketingStudio';

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

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Самбар', icon: BarChart3 },
  { key: 'products', label: 'Бүтээгдэхүүн', icon: Gift },
  { key: 'earnings', label: 'Орлого', icon: DollarSign },
  { key: 'wallet', label: 'Хэтэвч', icon: Wallet },
  { key: 'toolkit', label: 'Маркетинг', icon: Megaphone },
];

const BANKS = ['Хаан банк', 'Голомт банк', 'Худалдаа хөгжлийн банк', 'Төрийн банк', 'Хас банк', 'Богд банк'];

const QUICK_ACTIONS = [
  { icon: Share2, label: 'Линк хуваалцах', desc: 'Реферал линк', color: '#6366F1' },
  { icon: QrCode, label: 'QR код', desc: 'Poster-д ашиглах', color: '#EC4899' },
  { icon: Users, label: 'Хөтөч', desc: 'Шинэ борлуулагч', color: '#10B981' },
  { icon: TrendingUp, label: 'Аналитик', desc: 'Тайлан харах', color: '#F59E0B' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    const t = searchParams.get('tab') as Tab | null;
    if (t && ['dashboard', 'products', 'earnings', 'wallet', 'toolkit'].includes(t)) setTab(t);
  }, [searchParams]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [earnings, setEarnings] = useState<EarningsData>({});
  const [wallet, setWallet] = useState<WalletData>({});
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState(BANKS[0]);
  const [withdrawing, setWithdrawing] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mentorProduct, setMentorProduct] = useState<Product | null>(null);
  const [studioProduct, setStudioProduct] = useState<Product | null>(null);

  const username = user?.username || user?.name || 'affiliate';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://eseller.mn';
  const refLink = `${baseUrl}/store?ref=${username}`;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, earningsRes, walletRes] = await Promise.allSettled([
        ProductsAPI.list(), AffiliateAPI.getEarnings(), WalletAPI.get(),
      ]);
      if (prodRes.status === 'fulfilled' && prodRes.value.products?.length) setProducts(prodRes.value.products);
      else setProducts(DEMO_PRODUCTS as Product[]);
      if (earningsRes.status === 'fulfilled') setEarnings(earningsRes.value as EarningsData);
      else setEarnings({
        totalEarnings: 284000, monthlyEarnings: 67500, totalClicks: 1243, conversionRate: 4.8,
        sparkData: [12, 24, 18, 32, 28, 45, 38],
        earnings: [
          { _id: 'e1', productName: 'Premium цагаан цамц', amount: 3500, status: 'paid', createdAt: '2026-03-28T10:00:00Z' },
          { _id: 'e2', productName: 'Sporty гутал Air', amount: 6900, status: 'paid', createdAt: '2026-03-25T14:30:00Z' },
          { _id: 'e3', productName: 'Bluetooth чихэвч', amount: 9900, status: 'pending', createdAt: '2026-04-01T09:15:00Z' },
          { _id: 'e4', productName: 'Leather цүнх', amount: 7500, status: 'paid', createdAt: '2026-03-20T16:45:00Z' },
          { _id: 'e5', productName: 'Гоо сайхны багц', amount: 5200, status: 'pending', createdAt: '2026-04-02T11:00:00Z' },
        ],
      });
      if (walletRes.status === 'fulfilled') setWallet(walletRes.value as WalletData);
      else setWallet({ balance: 216500, pending: 67500 });
    } catch { setProducts(DEMO_PRODUCTS as Product[]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const copyToClipboard = async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.show('Хуулагдлаа!', 'ok');
      if (id) { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }
    } catch { toast.show('Хуулж чадсангүй', 'error'); }
  };

  const createAffiliateLink = async (product: Product) => {
    const link = `${baseUrl}/store?ref=${username}&product=${product._id}`;
    try { await AffiliateAPI.createLink(product._id); } catch {}
    copyToClipboard(link, product._id);
  };

  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) { toast.show('Дүнгээ оруулна уу', 'warn'); return; }
    if (amt > (wallet.balance || 0)) { toast.show('Үлдэгдэл хүрэлцэхгүй', 'error'); return; }
    setWithdrawing(true);
    try { await WalletAPI.withdraw(amt, withdrawMethod); toast.show('Амжилттай!', 'ok'); setWithdrawAmount(''); loadData(); }
    catch { toast.show('Амжилтгүй', 'error'); }
    finally { setWithdrawing(false); }
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' }) : '—';

  // Weekly performance data for chart
  const weekDays = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
  const weekData = earnings.sparkData || [12, 24, 18, 32, 28, 45, 38];
  const maxVal = Math.max(...weekData, 1);

  return (
    <div className="space-y-6">
      {/* ════════════════════════════════════════
          HEADER
          ════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Борлуулагчийн самбар
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            Сайн байна уу, <span className="text-[#0F172A] font-semibold">{username}</span>
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 text-sm bg-white border border-[#E2E8F0] hover:border-[#6366F1] text-[#475569] hover:text-[#6366F1] rounded-xl px-4 py-2.5 transition-all font-medium cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          Шинэчлэх
        </button>
      </div>

      {/* ════════════════════════════════════════
          TABS
          ════════════════════════════════════════ */}
      <nav className="flex gap-1 bg-white rounded-xl p-1 border border-[#E2E8F0] overflow-x-auto shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border-none',
              tab === t.key
                ? 'bg-[#6366F1] text-white shadow-[0_2px_8px_rgba(99,102,241,.3)]'
                : 'text-[#94A3B8] hover:text-[#475569] hover:bg-[#F8FAFC] bg-transparent'
            )}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-[3px] border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ══════════════════════════════════════
              DASHBOARD TAB
              ══════════════════════════════════════ */}
          {tab === 'dashboard' && (
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="space-y-6">
              {/* Referral Link */}
              <motion.div variants={fadeUp} custom={0} className="relative bg-gradient-to-br from-[#6366F1] to-[#4338CA] rounded-2xl p-6 overflow-hidden">
                <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-white/[.06]" />
                <div className="absolute bottom-[-30px] left-[40%] w-24 h-24 rounded-full bg-white/[.04]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 className="w-4 h-4 text-white/70" />
                    <h3 className="text-sm font-bold text-white/80">Таны реферал линк</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-4">Энэ линкээр орсон хүмүүсийн худалдан авалтаас та шимтгэл авна</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-sm font-mono text-white/90 truncate border border-white/10">
                      {refLink}
                    </div>
                    <button
                      onClick={() => copyToClipboard(refLink, 'ref')}
                      className={cn(
                        'px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 flex items-center gap-2 border-none cursor-pointer',
                        copiedId === 'ref'
                          ? 'bg-emerald-400 text-white'
                          : 'bg-white text-[#4338CA] hover:bg-white/90 shadow-lg'
                      )}
                    >
                      {copiedId === 'ref' ? <><Check className="w-4 h-4" /> Хуулсан</> : <><Copy className="w-4 h-4" /> Хуулах</>}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={fadeUp} custom={1} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK_ACTIONS.map((a, i) => (
                  <button
                    key={a.label}
                    onClick={() => {
                      if (i === 0) copyToClipboard(refLink, 'quick');
                      else if (i === 1) setTab('toolkit');
                      else if (i === 3) setTab('earnings');
                    }}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-left hover:border-[#6366F1]/30 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: a.color + '12', color: a.color }}>
                      <a.icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">{a.label}</div>
                    <div className="text-xs text-[#94A3B8]">{a.desc}</div>
                  </button>
                ))}
              </motion.div>

              {/* Stat Cards */}
              <motion.div variants={fadeUp} custom={2} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="💰" label="Нийт орлого" value={formatPrice(earnings.totalEarnings || 0)} gradient="indigo" sub="Бүх цагийн" sparkData={earnings.sparkData} />
                <StatCard icon="📈" label="Энэ сарын" value={formatPrice(earnings.monthlyEarnings || 0)} gradient="pink" sub="Сүүлийн 30 хоног" />
                <StatCard icon="👆" label="Нийт клик" value={earnings.totalClicks || 0} gradient="green" sub="Линк дарсан" />
                <StatCard icon="🎯" label="Хөрвүүлэлт" value={`${earnings.conversionRate || 0}%`} gradient="amber" sub="Клик → Захиалга" />
              </motion.div>

              {/* Performance Chart + Recent Earnings */}
              <div className="grid lg:grid-cols-5 gap-6">
                {/* Weekly Performance */}
                <motion.div variants={fadeUp} custom={3} className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#6366F1]" />
                      Долоо хоногийн гүйцэтгэл
                    </h3>
                    <span className="text-xs text-[#94A3B8] bg-[#F8FAFC] px-2.5 py-1 rounded-lg font-medium">Энэ долоо хоног</span>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-40">
                    {weekData.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex justify-center">
                          <motion.div
                            className={cn(
                              'w-full max-w-[40px] rounded-lg transition-colors',
                              i === weekData.length - 1 ? 'bg-[#6366F1]' : 'bg-[#6366F1]/20 hover:bg-[#6366F1]/40'
                            )}
                            initial={{ height: 0 }}
                            animate={{ height: `${(val / maxVal) * 120}px` }}
                            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-[#94A3B8]">{weekDays[i]}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Earnings */}
                <motion.div variants={fadeUp} custom={4} className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
                    <h3 className="font-bold text-[#0F172A] text-sm">Сүүлийн орлого</h3>
                    <button onClick={() => setTab('earnings')} className="text-xs text-[#6366F1] font-semibold bg-transparent border-none cursor-pointer hover:underline flex items-center gap-0.5">
                      Бүгд <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  {(earnings.earnings?.length ?? 0) > 0 ? (
                    <div className="divide-y divide-[#F8FAFC]">
                      {earnings.earnings?.slice(0, 4).map((e) => (
                        <div key={e._id} className="px-5 py-3 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[#0F172A] truncate">{e.productName}</div>
                            <div className="text-[11px] text-[#94A3B8]">{fmtDate(e.createdAt)}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              e.status === 'paid' ? 'bg-emerald-400' : 'bg-amber-400'
                            )} />
                            <span className="text-sm font-bold text-emerald-600">+{formatPrice(e.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[#CBD5E1] text-sm">Орлого байхгүй</div>
                  )}
                </motion.div>
              </div>

              {/* Tier + Funnel + AI */}
              <div className="grid lg:grid-cols-3 gap-6">
                <motion.div variants={fadeUp} custom={5}>
                  <TierProgress totalEarnings={earnings.totalEarnings || 0} monthlySales={earnings.monthlyEarnings || 0} />
                </motion.div>
                <motion.div variants={fadeUp} custom={6}>
                  <ConversionFunnel clicks={earnings.totalClicks} purchases={Math.round((earnings.totalClicks || 0) * (earnings.conversionRate || 0) / 100)} />
                </motion.div>
                <motion.div variants={fadeUp} custom={7}>
                  <AISuggestions />
                </motion.div>
              </div>

              {/* Channel Performance */}
              <motion.div variants={fadeUp} custom={8}>
                <ChannelPerformance />
              </motion.div>
            </motion.div>
          )}

          {/* ══════════════ PRODUCTS TAB ══════════════ */}
          {tab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Бүтээгдэхүүн хайх..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all"
                  />
                </div>
                <span className="text-xs text-[#94A3B8] bg-white border border-[#E2E8F0] px-3 py-2 rounded-lg font-medium whitespace-nowrap">
                  {filteredProducts.length} бараа
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <EmptyState icon="🛍️" title="Бүтээгдэхүүн олдсонгүй" description="Хайлтын үгээ өөрчилж үзнэ үү" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((p) => (
                    <div key={p._id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#6366F1]/30 hover:shadow-md transition-all group">
                      <div className="h-36 bg-gradient-to-br from-[#F8FAFC] to-[#EEF2FF] flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                        {p.emoji || '📦'}
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-bold text-[#0F172A] truncate">{p.name}</h4>
                        {p.store?.name && <p className="text-xs text-[#94A3B8]">{p.store.name}</p>}
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-[#0F172A]">{formatPrice(p.salePrice || p.price)}</span>
                          {p.salePrice && p.salePrice < p.price && (
                            <span className="text-xs text-[#94A3B8] line-through">{formatPrice(p.price)}</span>
                          )}
                        </div>
                        {p.commission && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <Star className="w-3 h-3" /> {p.commission}% шимтгэл
                          </div>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setMentorProduct(p)}
                            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border border-[#E2E8F0] cursor-pointer bg-white text-[#475569] hover:border-[#6366F1] hover:text-[#6366F1]"
                          >
                            🤖 AI Зөвлөх
                          </button>
                          <button
                            onClick={() => setStudioProduct(p)}
                            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border border-[#E2E8F0] cursor-pointer bg-white text-[#475569] hover:border-[#EC4899] hover:text-[#EC4899]"
                          >
                            🎨 Постер
                          </button>
                        </div>
                        <button
                          onClick={() => createAffiliateLink(p)}
                          className={cn(
                            'w-full mt-2 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer',
                            copiedId === p._id
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-[0_2px_8px_rgba(99,102,241,.25)]'
                          )}
                        >
                          {copiedId === p._id ? <><Check className="w-3.5 h-3.5" /> Хуулагдлаа!</> : <><Share2 className="w-3.5 h-3.5" /> Борлуулж эхлэх</>}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                  <div className="text-xs text-[#94A3B8] mb-1 font-medium">Нийт орлого</div>
                  <div className="text-2xl font-black text-[#0F172A]">{formatPrice(earnings.totalEarnings || 0)}</div>
                </div>
                <div className="bg-gradient-to-br from-[#6366F1] to-[#4338CA] rounded-2xl p-5 text-white">
                  <div className="text-xs text-white/60 mb-1 font-medium">Энэ сарын</div>
                  <div className="text-2xl font-black">{formatPrice(earnings.monthlyEarnings || 0)}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F1F5F9]">
                  <h3 className="font-bold text-[#0F172A] flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#6366F1]" /> Орлогын түүх</h3>
                </div>
                {(earnings.earnings?.length ?? 0) > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-[#94A3B8] border-b border-[#F8FAFC]">
                          <th className="px-6 py-3 font-medium">Бүтээгдэхүүн</th>
                          <th className="px-6 py-3 font-medium">Огноо</th>
                          <th className="px-6 py-3 font-medium">Төлөв</th>
                          <th className="px-6 py-3 font-medium text-right">Дүн</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F8FAFC]">
                        {earnings.earnings?.map((e) => (
                          <tr key={e._id} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="px-6 py-3 font-semibold text-[#0F172A]">{e.productName || '—'}</td>
                            <td className="px-6 py-3 text-[#94A3B8]">{fmtDate(e.createdAt)}</td>
                            <td className="px-6 py-3">
                              <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold',
                                e.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              )}>
                                {e.status === 'paid' ? 'Төлсөн' : 'Хүлээгдэж буй'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right font-bold text-emerald-600">+{formatPrice(e.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState icon="💰" title="Орлого байхгүй" description="Бүтээгдэхүүний линк хуваалцаж орлого олоорой" actionLabel="Бараа үзэх" onAction={() => setTab('products')} />
                )}
              </div>
            </div>
          )}

          {/* ══════════════ WALLET TAB ══════════════ */}
          {tab === 'wallet' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#6366F1] to-[#4338CA] rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full bg-white/[.08]" />
                  <Wallet className="w-5 h-5 text-white/60 mb-2" />
                  <div className="text-sm text-white/60 mb-1">Боломжит үлдэгдэл</div>
                  <div className="text-3xl font-black">{formatPrice(wallet.balance || 0)}</div>
                </div>
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                  <ArrowUpRight className="w-5 h-5 text-amber-500 mb-2" />
                  <div className="text-sm text-[#94A3B8] mb-1">Хүлээгдэж буй</div>
                  <div className="text-3xl font-black text-amber-500">{formatPrice(wallet.pending || 0)}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
                <h3 className="font-bold text-[#0F172A] flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#6366F1]" /> Мөнгө татах</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#94A3B8] block mb-1.5 font-medium">Дүн</label>
                    <div className="relative">
                      <input type="number" placeholder="0" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8]">₮</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#94A3B8] block mb-1.5 font-medium">Банк</label>
                    <select value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6366F1] transition-all appearance-none cursor-pointer">
                      {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleWithdraw} disabled={withdrawing}
                  className={cn('w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold transition-all border-none cursor-pointer',
                    withdrawing ? 'bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed'
                      : 'bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-[0_4px_12px_rgba(99,102,241,.25)]')}>
                  {withdrawing ? 'Боловсруулж байна...' : 'Татан авах'}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════ MARKETING TOOLKIT TAB ══════════════ */}
          {tab === 'toolkit' && (
            <SalesToolkit refLink={refLink} username={username} onCopy={copyToClipboard} copiedId={copiedId} />
          )}
        </>
      )}

      {/* AI Product Mentor Modal */}
      {mentorProduct && (
        <AIProductMentor
          product={mentorProduct}
          username={username}
          onClose={() => setMentorProduct(null)}
          onStartSelling={(p) => {
            createAffiliateLink(p);
            setMentorProduct(null);
          }}
        />
      )}

      {/* AI Marketing Studio Modal */}
      {studioProduct && (
        <AIMarketingStudio
          product={studioProduct}
          username={username}
          onClose={() => setStudioProduct(null)}
        />
      )}
    </div>
  );
}
