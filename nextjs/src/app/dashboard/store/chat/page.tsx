'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Phone, Package, MoreVertical, Send, Plus,
  Image as ImageIcon, ChevronLeft, Star, Truck, RotateCcw, Ban,
} from 'lucide-react';

/* ═══ Types ═══ */
interface Conv {
  id: string;
  customerName: string;
  lastMessage: string | null;
  lastAt: string;
  unreadCount: number;
  tag: string | null;
  orderNumber: string | null;
  productName: string | null;
  productPrice: number | null;
  customerId: string;
}

interface Msg {
  id: string;
  senderId: string;
  senderRole: string;
  text: string | null;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: string;
}


/* ═══ Helpers ═══ */
function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): [string, string] {
  const colors: [string, string][] = [
    ['#E6F1FB', '#0C447C'], ['#E1F5EE', '#085041'], ['#FBEAF0', '#72243E'],
    ['#EEEDFE', '#3C3489'], ['#FAEEDA', '#633806'], ['#FCEBEB', '#791F1F'],
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString('mn', { hour: '2-digit', minute: '2-digit' });
  if (diff < 172800000) return 'Өчигдөр';
  return `Да ${Math.floor(diff / 86400000)}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
}

function formatPrice(n: number) {
  return n.toLocaleString('mn-MN') + '₮';
}

/* ═══ Quick replies ═══ */
const QUICK_REPLIES = [
  'Таны захиалга баталгаажлаа. 2-4 цагийн дотор хүргэнэ.',
  'Таны бараа хүргэлтэнд гарлаа. Хаяг шүүгээ шүлтэнэ үү.',
  'Уучлаарай, бараа дууссан байна. Дараа нөөцөн авахад мэдэгдье.',
  'Хэдэн ширхэг авах вэ? Хүсвэл 2+ авбал 5% хямдарна.',
];

/* ═══ Page ═══ */
export default function SellerChatPage() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [activeConv, setActiveConv] = useState<Conv | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations + polling every 5s
  const fetchConvs = useCallback(() => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('filter', filter);
    if (search) params.set('search', search);

    fetch(`/api/seller/conversations?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConvs(data);
          if (!activeConv && data.length > 0) setActiveConv(data[0]);
        }
      })
      .catch(() => {});
  }, [filter, search, activeConv]);

  useEffect(() => {
    fetchConvs();
    const interval = setInterval(fetchConvs, 5000);
    return () => clearInterval(interval);
  }, [fetchConvs]);

  // Fetch messages when active conv changes
  useEffect(() => {
    if (!activeConv) return;
    const token = localStorage.getItem('token');
    fetch(`/api/seller/conversations/${activeConv.id}/messages`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setMsgs(data); })
      .catch(() => {});
  }, [activeConv?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !activeConv) return;
    const text = input.trim();
    setInput('');

    // Optimistic update
    const tempMsg: Msg = {
      id: 'temp-' + Date.now(),
      senderId: 'seller',
      senderRole: 'seller',
      text,
      imageUrl: null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMsgs(prev => [...prev, tempMsg]);
    setConvs(prev => prev.map(c => c.id === activeConv.id ? { ...c, lastMessage: text, lastAt: new Date().toISOString() } : c));

    // API call
    const token = localStorage.getItem('token');
    fetch(`/api/seller/conversations/${activeConv.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ text }),
    }).catch(() => {});
  }, [input, activeConv]);

  const selectConv = (conv: Conv) => {
    setActiveConv(conv);
    // Clear unread
    setConvs(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
  };

  const totalUnread = convs.reduce((s, c) => s + c.unreadCount, 0);

  // Filtered conversations
  const filteredConvs = convs.filter(c => {
    if (filter === 'unread' && c.unreadCount === 0) return false;
    if (filter === 'order' && c.tag !== 'order') return false;
    if (filter === 'question' && c.tag !== 'question') return false;
    if (search && !c.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '280px 1fr 260px',
      minHeight: 'calc(100vh - 64px)',
      background: 'var(--color-background-secondary, #111)',
      borderRadius: 16,
      overflow: 'hidden',
      border: '0.5px solid var(--color-border-tertiary, #2A2A2A)',
    }}>

      {/* ═══ LEFT: Conversation List ═══ */}
      <div style={{ borderRight: '0.5px solid #2A2A2A', display: 'flex', flexDirection: 'column', background: 'var(--esl-bg-page)' }}>
        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#FFF' }}>Чат</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {totalUnread > 0 && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(232,36,44,0.1)', color: '#E8242C', fontWeight: 500 }}>
                {totalUnread} шинэ
              </span>
            )}
            <button style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, cursor: 'pointer', color: '#777', border: 'none', background: 'none' }}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ margin: '10px 12px', position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Хэрэглэгч, захиалга хайх..."
            style={{ width: '100%', padding: '7px 10px 7px 30px', border: '0.5px solid #2A2A2A', borderRadius: 8, background: 'var(--esl-bg-card)', color: '#FFF', fontSize: 12, outline: 'none' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 4, padding: '0 12px 10px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'Бүгд' },
            { key: 'unread', label: 'Уншаагүй' },
            { key: 'order', label: 'Захиалга' },
            { key: 'question', label: 'Асуулт' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                padding: '3px 10px', borderRadius: 99, fontSize: 11, cursor: 'pointer',
                border: filter === f.key ? '0.5px solid rgba(232,36,44,0.3)' : '0.5px solid #2A2A2A',
                background: filter === f.key ? 'rgba(232,36,44,0.1)' : 'none',
                color: filter === f.key ? '#E8242C' : '#777',
                whiteSpace: 'nowrap',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConvs.map(conv => {
            const [bg, tc] = getAvatarColor(conv.customerName);
            const isActive = activeConv?.id === conv.id;
            return (
              <div key={conv.id} onClick={() => selectConv(conv)}
                style={{
                  display: 'flex', gap: 10, padding: '10px 14px', cursor: 'pointer',
                  borderBottom: '0.5px solid #1A1A1A', position: 'relative',
                  background: isActive ? 'rgba(232,36,44,0.06)' : 'transparent',
                  borderLeft: isActive ? '2px solid #E8242C' : '2px solid transparent',
                  transition: 'background 0.12s',
                }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: bg, color: tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                  {getInitials(conv.customerName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: isActive ? '#E8242C' : '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.customerName}
                    </span>
                    <span style={{ fontSize: 10, color: '#555', flexShrink: 0 }}>{formatTime(conv.lastAt)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.lastMessage || '...'}
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <span style={{ position: 'absolute', right: 14, bottom: 12, background: '#E8242C', color: '#fff', borderRadius: 99, fontSize: 9, fontWeight: 700, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ MIDDLE: Chat Area ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--esl-bg-page)' }}>
        {activeConv ? (
          <>
            {/* Chat header */}
            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #2A2A2A', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, cursor: 'pointer', color: '#777' }}>
                <ChevronLeft size={16} />
              </div>
              {(() => {
                const [bg, tc] = getAvatarColor(activeConv.customerName);
                return <div style={{ width: 34, height: 34, borderRadius: '50%', background: bg, color: tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500 }}>{getInitials(activeConv.customerName)}</div>;
              })()}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#FFF' }}>{activeConv.customerName}</div>
                <div style={{ fontSize: 11, color: '#555' }}>Сүүлд идэвхтэй 5 минутын өмнө</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, cursor: 'pointer', color: '#777', border: 'none', background: 'none' }} title="Утсаар залгах">
                  <Phone size={15} />
                </button>
                <button style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, cursor: 'pointer', color: '#777', border: 'none', background: 'none' }} title="Захиалга харах">
                  <Package size={15} />
                </button>
                <button style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, cursor: 'pointer', color: '#777', border: 'none', background: 'none' }}>
                  <MoreVertical size={15} />
                </button>
              </div>
            </div>

            {/* Product reference bar */}
            {activeConv.productName && (
              <div style={{ margin: '10px 14px', padding: '10px 12px', background: 'var(--esl-bg-card)', borderRadius: 8, border: '0.5px solid #2A2A2A', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--esl-bg-card-hover)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid #333' }}>
                  <Package size={20} color="#555" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeConv.productName}</div>
                  {activeConv.productPrice && <div style={{ fontSize: 13, fontWeight: 500, color: '#E8242C', marginTop: 1 }}>{formatPrice(activeConv.productPrice)}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {activeConv.orderNumber && (
                    <button style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: '0.5px solid #333', background: 'var(--esl-bg-page)', color: '#777', whiteSpace: 'nowrap' }}>
                      Захиалга {activeConv.orderNumber}
                    </button>
                  )}
                  <button style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#E8242C', color: '#FFF', whiteSpace: 'nowrap' }}>
                    Нотлох
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
              {/* Date separator */}
              <div style={{ textAlign: 'center', margin: '12px 0', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 0.5, background: 'var(--esl-bg-elevated)' }} />
                <span style={{ background: 'var(--esl-bg-page)', padding: '0 10px', fontSize: 10, color: '#555', position: 'relative', zIndex: 1 }}>
                  {msgs.length > 0 ? formatDate(msgs[0].createdAt) : 'Өнөөдөр'}
                </span>
              </div>

              {msgs.map(msg => {
                const isMe = msg.senderRole === 'seller';
                const [bg, tc] = isMe ? ['#FCEBEB', '#A32D2D'] : getAvatarColor(activeConv.customerName);
                return (
                  <div key={msg.id} style={{ display: 'flex', gap: 8, marginBottom: 12, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, color: tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, flexShrink: 0, marginTop: 2 }}>
                      {isMe ? 'Та' : getInitials(activeConv.customerName)}
                    </div>
                    <div>
                      {msg.imageUrl && (
                        <div style={{ width: 180, height: 120, borderRadius: 10, background: 'var(--esl-bg-card)', border: '0.5px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 6 }}>
                          <ImageIcon size={24} color="#555" />
                        </div>
                      )}
                      <div style={{
                        maxWidth: '72%', padding: '9px 12px', fontSize: 13, lineHeight: 1.55,
                        borderRadius: isMe ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                        background: isMe ? '#E8242C' : 'var(--esl-bg-card)',
                        color: isMe ? '#FFF' : '#E0E0E0',
                      }}>
                        {msg.text}
                      </div>
                      <div style={{
                        fontSize: 10, marginTop: 4,
                        color: isMe ? 'rgba(255,255,255,0.4)' : '#555',
                        textAlign: isMe ? 'right' : 'left',
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString('mn', { hour: '2-digit', minute: '2-digit' })}
                        {isMe && msg.isRead && ' · Илгээгдсэн ✓✓'}
                        {isMe && !msg.isRead && ' · Илгээгдсэн ✓'}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0 0 4px' }}>
                {(() => {
                  const [bg, tc] = getAvatarColor(activeConv.customerName);
                  return <div style={{ width: 24, height: 24, borderRadius: '50%', background: bg, color: tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500 }}>{getInitials(activeConv.customerName)}</div>;
                })()}
                <div style={{ background: 'var(--esl-bg-card)', borderRadius: 12, padding: '8px 12px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#555', display: 'inline-block',
                      animation: `chatBounce 1.2s infinite ${delay}s`,
                    }} />
                  ))}
                </div>
              </div>

              <div ref={msgsEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 14px', borderTop: '0.5px solid #2A2A2A', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <button style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, cursor: 'pointer', color: '#777', border: 'none', background: 'none' }}>
                <Plus size={16} />
              </button>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--esl-bg-card)', border: '0.5px solid #2A2A2A', borderRadius: 20, padding: '7px 12px' }}>
                <button style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, cursor: 'pointer', color: '#777', border: 'none', background: 'none' }}>
                  <ImageIcon size={14} />
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Мессеж бичих..."
                  style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 13, color: '#FFF', fontFamily: 'inherit' }}
                />
              </div>
              <button onClick={sendMessage}
                style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8242C', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={15} color="#FFF" />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 14 }}>
            Чат сонгоно уу
          </div>
        )}
      </div>

      {/* ═══ RIGHT: Info Panel ═══ */}
      <div style={{ borderLeft: '0.5px solid #2A2A2A', background: 'var(--esl-bg-page)', display: 'flex', flexDirection: 'column' }}>
        {activeConv ? (
          <>
            {/* Panel header */}
            <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#FFF' }}>Дэлгэрэнгүй мэдээлэл</span>
            </div>

            {/* Buyer info */}
            <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #2A2A2A' }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Хэрэглэгч</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                {(() => {
                  const [bg, tc] = getAvatarColor(activeConv.customerName);
                  return <div style={{ width: 38, height: 38, borderRadius: '50%', background: bg, color: tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500 }}>{getInitials(activeConv.customerName)}</div>;
                })()}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#FFF' }}>{activeConv.customerName}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>Битүүн · 14 сар</div>
                </div>
              </div>
              {[
                ['Нийт захиалга', '23'],
                ['Зарцуулсан дүн', '1.2M₮'],
                ['Утас', '+976 9911 2233'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: '#777' }}>{k}</span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#777' }}>Tier</span>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#FEFCE8', color: '#854D0E', fontWeight: 500 }}>Алт ⭐</span>
              </div>
            </div>

            {/* Order info */}
            {activeConv.orderNumber && (
              <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #2A2A2A' }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Захиалга {activeConv.orderNumber}</div>
                {[
                  ['Статус', null, <span key="s" style={{ fontSize: 10, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: 'rgba(245,158,11,0.12)', color: '#FBBF24' }}>Хүлээгдэж буй</span>],
                  ['Бараа', activeConv.productName || '—', null],
                  ['Дүн', activeConv.productPrice ? formatPrice(activeConv.productPrice) : '—', null],
                  ['Төлбөр', null, <span key="p" style={{ fontSize: 10, fontWeight: 500, padding: '3px 9px', borderRadius: 99, background: 'rgba(34,197,94,0.12)', color: '#4ADE80' }}>QPay ✓</span>],
                  ['Огноо', new Date().toLocaleDateString('mn-MN') + ' 09:41', null],
                ].map(([k, v, badge]) => (
                  <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: '#777' }}>{k}</span>
                    {badge || <span style={{ color: k === 'Дүн' ? '#E8242C' : '#FFF', fontWeight: 500 }}>{v}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Quick replies */}
            <div style={{ padding: '10px 16px' }}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Хурдан хариу</div>
              {QUICK_REPLIES.map((text, i) => (
                <button key={i} onClick={() => setInput(text)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '7px 10px', marginBottom: 5,
                    borderRadius: 6, border: '0.5px solid #2A2A2A', background: 'var(--esl-bg-card)',
                    color: '#777', fontSize: 11, cursor: 'pointer', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8242C'; e.currentTarget.style.color = '#E8242C'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#777'; }}
                >
                  {text.slice(0, 40)}...
                </button>
              ))}
            </div>

            {/* Seller actions */}
            <div style={{ padding: '14px 16px', marginTop: 'auto', borderTop: '0.5px solid #2A2A2A' }}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Үйлдэл</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { label: 'Нотлох', icon: <Star size={12} />, bg: '#E8242C', color: '#FFF', border: 'none' },
                  { label: 'Хүргэлт', icon: <Truck size={12} />, bg: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: '0.5px solid rgba(59,130,246,0.25)' },
                  { label: 'Буцаалт', icon: <RotateCcw size={12} />, bg: 'rgba(245,158,11,0.12)', color: '#FBBF24', border: '0.5px solid rgba(245,158,11,0.25)' },
                  { label: 'Блоклох', icon: <Ban size={12} />, bg: 'rgba(239,68,68,0.12)', color: '#F87171', border: '0.5px solid rgba(239,68,68,0.25)' },
                ].map(a => (
                  <button key={a.label} style={{
                    padding: '7px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                    cursor: 'pointer', textAlign: 'center', border: a.border,
                    background: a.bg, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 12, padding: 20, textAlign: 'center' }}>
            Чат сонгоход дэлгэрэнгүй мэдээлэл харагдана
          </div>
        )}
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes chatBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
