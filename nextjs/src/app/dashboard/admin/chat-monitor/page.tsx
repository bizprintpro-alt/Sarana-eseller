'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Search, MessageCircle, Shield, AlertTriangle, Ban, Eye,
  ChevronLeft, ChevronRight, Download, ExternalLink, ToggleLeft, ToggleRight,
  Phone, Link2, RefreshCw, Clock,
} from 'lucide-react';

interface ChatEntry {
  id: string;
  customerId: string;
  customerName: string;
  sellerName: string;
  lastMessage: string;
  spamRisk: 'high' | 'medium' | 'low' | 'none';
  status: 'active' | 'flagged' | 'blocked' | 'pending_review';
  messageCount: number;
  createdAt: string;
  flags: string[];
}

const DEMO_CHATS: ChatEntry[] = [
  { id: 'CHT-0041', customerId: 'c1', customerName: 'Б. Мөнхбат', sellerName: 'TechUB Store', lastMessage: 'За баярлалаа', spamRisk: 'none', status: 'active', messageCount: 12, createdAt: '2026-04-03', flags: [] },
  { id: 'CHT-0038', customerId: 'c2', customerName: 'Д. Оюунчимэг', sellerName: 'BeautyMN', lastMessage: 'Утасны дугаар байхгүй!', spamRisk: 'high', status: 'flagged', messageCount: 8, createdAt: '2026-04-03', flags: ['Утасны дугаар'] },
  { id: 'CHT-0035', customerId: 'c3', customerName: 'Э. Анхбаяр', sellerName: 'SportsMN', lastMessage: 'Жижиг хэмжээ хэд вэ?', spamRisk: 'none', status: 'active', messageCount: 5, createdAt: '2026-04-02', flags: [] },
  { id: 'CHT-0033', customerId: 'c4', customerName: 'Г. Нандинцэцэг', sellerName: 'FashionMN', lastMessage: 't.me/fashionmn_real дээр үз', spamRisk: 'high', status: 'flagged', messageCount: 3, createdAt: '2026-04-02', flags: ['Telegram холбоос'] },
  { id: 'CHT-0031', customerId: 'c5', customerName: 'С. Батбаяр', sellerName: 'BurgerMN', lastMessage: 'За', spamRisk: 'none', status: 'active', messageCount: 2, createdAt: '2026-04-01', flags: [] },
  { id: 'CHT-0028', customerId: 'c6', customerName: 'Н. Дэлгэрмаа', sellerName: 'LuxuryMN', lastMessage: 'Wechat дээр ярьцгаая: lux...', spamRisk: 'medium', status: 'flagged', messageCount: 6, createdAt: '2026-04-01', flags: ['Гадаад мессенжер'] },
  { id: 'CHT-0025', customerId: 'c7', customerName: 'О. Мөнхзул', sellerName: 'GreenMN', lastMessage: 'Ойлголоо баярлалаа', spamRisk: 'none', status: 'active', messageCount: 4, createdAt: '2026-03-31', flags: [] },
  { id: 'CHT-0022', customerId: 'c8', customerName: 'Х. Болд', sellerName: 'HomeDecorMN', lastMessage: '30000₮ хийчихье', spamRisk: 'medium', status: 'pending_review', messageCount: 9, createdAt: '2026-03-31', flags: ['Системийн гадуур төлбөр'] },
  { id: 'CHT-0019', customerId: 'c9', customerName: 'Ч. Нарантуяа', sellerName: 'TechUB Store', lastMessage: 'Урьдчилгаа хийх боломжтой...', spamRisk: 'low', status: 'active', messageCount: 15, createdAt: '2026-03-30', flags: ['Хэрэглэгч блоклогдсон'] },
  { id: 'CHT-0017', customerId: 'c10', customerName: 'Б. Энхтуяа', sellerName: 'PizzaMN', lastMessage: 'Яаж төлбөр хийх вэ?', spamRisk: 'none', status: 'active', messageCount: 3, createdAt: '2026-03-30', flags: [] },
];

const RISK_STYLE = {
  high: { label: 'Өндөр', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  medium: { label: 'Дунд', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  low: { label: 'Бага', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  none: { label: 'Хэвийн', bg: 'bg-[var(--esl-bg-section)]', text: 'text-[var(--esl-text-secondary)]', dot: 'bg-gray-400' },
};

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  active: { label: 'Идэвхтэй', color: 'text-green-600' },
  flagged: { label: 'Анхааруулга', color: 'text-red-500' },
  blocked: { label: 'Блоклогдсон', color: 'text-[var(--esl-text-muted)]' },
  pending_review: { label: 'Шалгах', color: 'text-amber-500' },
};

export default function ChatMonitorPage() {
  const [chats] = useState(DEMO_CHATS);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selected, setSelected] = useState<ChatEntry | null>(null);
  const [spamAutoBlock, setSpamAutoBlock] = useState(true);
  const [phoneFilter, setPhoneFilter] = useState(true);
  const [linkFilter, setLinkFilter] = useState(true);
  const [repeatFilter, setRepeatFilter] = useState(false);

  const filtered = chats.filter((c) => {
    if (riskFilter === 'spam' && c.spamRisk !== 'high' && c.spamRisk !== 'medium') return false;
    if (riskFilter === 'pending' && c.status !== 'pending_review') return false;
    if (riskFilter === 'blocked' && c.status !== 'blocked') return false;
    if (riskFilter === 'high_risk' && c.spamRisk !== 'high') return false;
    if (search) {
      const q = search.toLowerCase();
      return c.customerName.toLowerCase().includes(q) || c.sellerName.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
    }
    return true;
  });

  const spamCount = chats.filter((c) => c.spamRisk === 'high' || c.spamRisk === 'medium').length;
  const pendingCount = chats.filter((c) => c.status === 'pending_review').length;
  const blockedCount = chats.filter((c) => c.status === 'blocked').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--esl-text-primary)]">Чат хяналтын самбар</h1>
          <p className="text-sm text-[var(--esl-text-secondary)]">Админ · Бүх харилцан яриа, spam шүүлт, лог</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 cursor-pointer transition border-none">
            <Shield className="w-3.5 h-3.5" /> Spam дүрэм
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-xl text-xs font-semibold text-[var(--esl-text-secondary)] hover:bg-[var(--esl-bg-section)] cursor-pointer transition">
            <Download className="w-3.5 h-3.5" /> Тайлан экспорт
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Нийт чат', value: '4,821', sub: 'Нийт харилцан яриа', color: 'text-white' },
          { label: 'Өнөөдөр идэвхтэй', value: '312', sub: '↑ 18% өчигдрөөс', color: 'text-green-400' },
          { label: 'Spam илэрсэн', value: '47', sub: 'Энэ сард', color: 'text-red-400' },
          { label: 'Шалгах хүлээгдэж буй', value: String(pendingCount), sub: 'Гараар шалгах', color: 'text-amber-400' },
          { label: 'Блоклогдсон хэрэглэгч', value: '29', sub: 'Нийт', color: 'text-[var(--esl-text-muted)]' },
        ].map((s) => (
          <div key={s.label} className="bg-[#1A1A2E] rounded-xl p-4 text-white">
            <div className="text-[10px] text-white/50 mb-1">{s.label}</div>
            <div className={cn('text-xl font-black', s.color)}>{s.value}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ Chat List ═══ */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-xl p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--esl-text-muted)]" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Хэрэглэгч, мессеж хайх..."
                className="w-full pl-10 pr-4 py-2 border border-[var(--esl-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-2">
              <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-1.5 border border-[var(--esl-border)] rounded-lg text-xs bg-[var(--esl-bg-card)] cursor-pointer">
                <option value="all">Бүгд</option>
                <option value="spam">Spam илэрсэн</option>
                <option value="pending">Шалгах хүлээгдэж буй</option>
                <option value="high_risk">Өндөр эрсдэлтэй</option>
                <option value="blocked">Блоклогдсон</option>
              </select>
              <select className="px-3 py-1.5 border border-[var(--esl-border)] rounded-lg text-xs bg-[var(--esl-bg-card)] cursor-pointer">
                <option>Эрсдэл: бүгд</option>
                <option>Өндөр</option>
                <option>Дунд</option>
                <option>Бага</option>
              </select>
            </div>
          </div>

          <div className="bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] text-[var(--esl-text-secondary)] uppercase tracking-wider border-b border-[var(--esl-border)] bg-[var(--esl-bg-section)]/50">
                  <th className="px-4 py-2.5 w-8"><input type="checkbox" className="rounded" /></th>
                  <th className="px-4 py-2.5 font-medium">Хэрэглэгч</th>
                  <th className="px-4 py-2.5 font-medium">Борлуулагч</th>
                  <th className="px-4 py-2.5 font-medium">Сүүлийн мессеж</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((chat) => {
                  const risk = RISK_STYLE[chat.spamRisk];
                  const isActive = selected?.id === chat.id;
                  return (
                    <tr key={chat.id} onClick={() => setSelected(chat)}
                      className={cn('cursor-pointer transition', isActive ? 'bg-indigo-50' : 'hover:bg-[var(--esl-bg-section)]/50')}>
                      <td className="px-4 py-3"><input type="checkbox" className="rounded" onClick={(e) => e.stopPropagation()} /></td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--esl-text-primary)]">{chat.customerName}</div>
                        <div className="text-[10px] text-[var(--esl-text-muted)]">{chat.id}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--esl-text-primary)]">{chat.sellerName}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-[var(--esl-text-primary)] truncate max-w-[200px]">{chat.lastMessage}</div>
                        {chat.flags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {chat.flags.map((f) => (
                              <span key={f} className="text-[9px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">! {f}</span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--esl-border)] text-xs text-[var(--esl-text-secondary)]">
              <span>10 чат</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((p) => (
                  <button key={p} className={cn('w-7 h-7 rounded border flex items-center justify-center cursor-pointer text-xs font-medium',
                    p === 1 ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'border-[var(--esl-border)] bg-[var(--esl-bg-card)] hover:bg-[var(--esl-bg-section)]')}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Right Panel ═══ */}
        <div className="space-y-4">
          {selected ? (
            <>
              {/* Chat detail */}
              <div className="bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--esl-text-primary)]">Чат дэлгэрэнгүй</h3>
                  <button onClick={() => setSelected(null)} className="text-xs text-[var(--esl-text-muted)] hover:text-[var(--esl-text-secondary)] bg-transparent border-none cursor-pointer">—</button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                    {selected.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--esl-text-primary)]">{selected.customerName}</div>
                    <div className="text-[10px] text-[var(--esl-text-muted)]">{selected.id}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {[
                    { label: 'Чат ID', value: selected.id },
                    { label: 'Нийт мессеж', value: String(selected.messageCount) },
                    { label: 'Эхэлсэн', value: selected.createdAt },
                    { label: 'Сүүлийн идэвх', value: 'Өнөөдөр' },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-[var(--esl-text-muted)]">{r.label}</span>
                      <span className="text-[var(--esl-text-primary)] font-medium">{r.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[var(--esl-bg-section)] text-[var(--esl-text-primary)] hover:bg-[var(--esl-bg-card-hover)] cursor-pointer border-none transition">
                    Дэлгэрэнгүй харах
                  </button>
                  <button className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer border-none transition">
                    <Ban className="w-3 h-3 inline mr-1" /> Блоклох
                  </button>
                </div>
                <button className="w-full py-2 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer border-none transition">
                  <AlertTriangle className="w-3 h-3 inline mr-1" /> Spam тайлагнах
                </button>
              </div>

              {/* Spam auto filter */}
              <div className="bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-[var(--esl-text-primary)]">Spam автомат шүүлт</h4>
                {[
                  { label: 'Spam автомат блок', state: spamAutoBlock, setter: setSpamAutoBlock },
                  { label: 'Утасны дугаар шүүлт', state: phoneFilter, setter: setPhoneFilter },
                  { label: 'Гадаад холбоос шүүлт', state: linkFilter, setter: setLinkFilter },
                  { label: 'Хэт давтамжтай мессеж', state: repeatFilter, setter: setRepeatFilter },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <span className="text-xs text-[var(--esl-text-secondary)]">{t.label}</span>
                    <button onClick={() => t.setter(!t.state)} className="bg-transparent border-none cursor-pointer p-0">
                      {t.state ? <ToggleRight className="w-6 h-6 text-indigo-600" /> : <ToggleLeft className="w-6 h-6 text-[var(--esl-text-muted)]" />}
                    </button>
                  </div>
                ))}
                <button className="w-full py-2 rounded-lg text-xs font-semibold bg-[var(--esl-bg-section)] text-[var(--esl-text-primary)] hover:bg-[var(--esl-bg-card-hover)] cursor-pointer border-none transition flex items-center justify-center gap-1">
                  Дүрэм тохируулах <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </>
          ) : (
            <div className="bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-xl p-8 text-center">
              <MessageCircle className="w-10 h-10 text-[var(--esl-text-muted)] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--esl-text-muted)]">Хэрэглэгч сонгоно уу</p>
              <p className="text-xs text-[var(--esl-text-muted)] mt-1">Чат сонгоход мессеж харагдана</p>
            </div>
          )}

          {/* Quick filters */}
          <div className="bg-[var(--esl-bg-card)] border border-[var(--esl-border)] rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-[var(--esl-text-primary)]">Хурдан шүүлтүүр</h4>
            {[
              { label: `Spam илэрсэн чатууд (${spamCount})`, dot: 'bg-red-500', filter: 'spam' },
              { label: `Шалгах хүлээгдэж буй (${pendingCount})`, dot: 'bg-amber-500', filter: 'pending' },
              { label: 'Өндөр эрсдэлтэй (8)', dot: 'bg-red-500', filter: 'high_risk' },
              { label: `Блоклогдсон (${blockedCount})`, dot: 'bg-gray-400', filter: 'blocked' },
            ].map((f) => (
              <button key={f.filter} onClick={() => setRiskFilter(f.filter)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--esl-bg-section)] text-left cursor-pointer bg-transparent border-none transition">
                <span className={cn('w-2 h-2 rounded-full', f.dot)} />
                <span className="text-xs font-medium text-[var(--esl-text-secondary)]">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
