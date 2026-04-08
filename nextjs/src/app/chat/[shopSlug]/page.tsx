'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, Package, AlertCircle, MoreVertical,
  Image as ImageIcon, Send, Star, Check, Lock,
} from 'lucide-react';
import Link from 'next/link';

/* ═══ Types ═══ */
interface Msg {
  id: string;
  senderRole: string;
  text: string | null;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: string;
  type?: 'system';
  sys?: string;
}

/* ═══ Demo data ═══ */
const DEMO_SHOP = {
  name: 'Sarana Fashion',
  verified: true,
  online: true,
  avgReply: '5 мин',
};

const DEMO_ORDER = {
  number: '#ORD-2604-1042',
  status: 'shipping' as const,
  statusLabel: 'Хүргэлтэнд',
  productName: 'Sporty гутал Air — Цагаан, 42',
  qty: 1,
  payment: 'QPay төлсөн',
  price: 69000,
  productId: '',  // filled from real order data
  orderId: '',    // filled from real order data
};

const DEMO_MSGS: Msg[] = [
  { id: 'm1', senderRole: 'seller', text: 'Сайн байна уу! Захиалга хийсэнд баярлалаа. Таны Sporty Air 42 дугаар бэлэн болсон байна. Өнөөдөр 14:00-18:00 хооронд хүргэнэ.', imageUrl: null, isRead: true, createdAt: new Date(Date.now() - 1500000).toISOString() },
  { id: 'm2', senderRole: 'customer', text: 'За ойлголоо, баярлалаа! Гэрийн хаяг руу ирэх боломжтой юу?', imageUrl: null, isRead: true, createdAt: new Date(Date.now() - 1400000).toISOString() },
  { id: 'm3', senderRole: 'seller', text: 'Мэдээж! Жолооч залгаад байршил тодруулна. Утасны дугаар: 9911-2233 — зөв үү?', imageUrl: null, isRead: true, createdAt: new Date(Date.now() - 1300000).toISOString() },
  { id: 'm4', senderRole: 'customer', text: 'Тийм зөв. Нэмэлтээр — хэрэв 44 дугаар байвал мэдэгдээрэй, найздаа бас авмаар байна.', imageUrl: null, isRead: true, createdAt: new Date(Date.now() - 1200000).toISOString() },
  { id: 'm5', senderRole: 'seller', text: '44 дугаар одоогоор хүлээлтийн жагсаалтад байна. Ирэхэд мэдэгдье! Та имэйлээ үлдээнэ үү.', imageUrl: null, isRead: true, createdAt: new Date(Date.now() - 1100000).toISOString() },
  { id: 'm6', senderRole: 'customer', text: '', imageUrl: '/placeholder.jpg', isRead: true, createdAt: new Date(Date.now() - 1000000).toISOString() },
  { id: 'm7', senderRole: 'seller', text: 'Зураг хүлээн авлаа. Тэр загвар 42 болон 44 хоёуланд нь байгаа. Захиалга нэмэх үү?', imageUrl: null, isRead: true, createdAt: new Date(Date.now() - 800000).toISOString() },
  { id: 'sys1', senderRole: 'system', text: null, imageUrl: null, isRead: true, createdAt: new Date(Date.now() - 600000).toISOString(), type: 'system', sys: 'Жолооч таны хаяг руу гарлаа — 30 мин-д ирнэ' },
  { id: 'm8', senderRole: 'customer', text: 'Болоод байна, баярлалаа!', imageUrl: null, isRead: true, createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 'sys2', senderRole: 'system', text: null, imageUrl: null, isRead: true, createdAt: new Date(Date.now() - 60000).toISOString(), type: 'system', sys: 'Захиалга хүргэгдлээ ✓' },
];

const QUICK_CHIPS = [
  '44 дугаар байна уу?',
  'Хэзээ хүргэх вэ?',
  'Буцаах боломжтой юу?',
  'Баярлалаа!',
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: 'rgba(245,158,11,0.12)', text: '#FBBF24' },
  paid:     { bg: 'rgba(34,197,94,0.12)',  text: '#4ADE80' },
  shipping: { bg: 'rgba(59,130,246,0.12)', text: '#60A5FA' },
};

function formatPrice(n: number) {
  return n.toLocaleString('mn-MN') + '₮';
}

/* ═══ Page ═══ */
export default function BuyerChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>(DEMO_MSGS);
  const [input, setInput] = useState('');
  const [starRating, setStarRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSent, setReviewSent] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Show review card after delivered
  useEffect(() => {
    const hasDelivered = msgs.some(m => m.type === 'system' && m.sys?.includes('хүргэгдлээ'));
    if (hasDelivered) setShowReview(true);
  }, [msgs]);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    const newMsg: Msg = {
      id: 'temp-' + Date.now(),
      senderRole: 'customer',
      text,
      imageUrl: null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMsgs(prev => [...prev, newMsg]);
  }, [input]);

  const sc = STATUS_COLORS[DEMO_ORDER.status] || STATUS_COLORS.pending;

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto',
      background: 'var(--esl-bg-page)', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* ═══ Top Nav ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 16px', borderBottom: '0.5px solid #2A2A2A',
        background: 'var(--esl-bg-page)',
      }}>
        <Link href="/shops" style={{
          width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 6, color: '#777', textDecoration: 'none',
        }}>
          <ChevronLeft size={16} />
        </Link>

        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#FCEBEB', color: '#A32D2D',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 500, flexShrink: 0,
        }}>СФ</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#FFF', display: 'flex', alignItems: 'center', gap: 5 }}>
            {DEMO_SHOP.name}
            {DEMO_SHOP.verified && (
              <span style={{
                width: 14, height: 14, borderRadius: '50%', background: '#3B82F6',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={9} color="#FFF" strokeWidth={2.5} />
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
            {DEMO_SHOP.online && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />}
            Одоо онлайн · Дунджаар {DEMO_SHOP.avgReply}-д хариудаг
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { icon: <Package size={15} />, title: 'Дэлгүүр харах' },
            { icon: <AlertCircle size={15} />, title: 'Гомдол гаргах' },
            { icon: <MoreVertical size={15} />, title: 'Цэс' },
          ].map((btn, i) => (
            <button key={i} title={btn.title} style={{
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, cursor: 'pointer', color: '#777', border: 'none', background: 'none',
            }}>
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Order Banner ═══ */}
      <div style={{
        margin: '10px 14px', background: 'var(--esl-bg-card)',
        border: '0.5px solid #2A2A2A', borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderBottom: '0.5px solid #2A2A2A',
        }}>
          <span style={{ fontSize: 11, color: '#555' }}>Холбоотой захиалга</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#FFF', fontFamily: 'monospace' }}>{DEMO_ORDER.number}</span>
          <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: sc.bg, color: sc.text }}>
            {DEMO_ORDER.statusLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 8, background: 'var(--esl-bg-card-hover)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '0.5px solid #333', flexShrink: 0,
          }}>
            <Package size={22} color="#555" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#FFF', marginBottom: 2 }}>{DEMO_ORDER.productName}</div>
            <div style={{ fontSize: 11, color: '#555' }}>{DEMO_ORDER.qty} ширхэг · {DEMO_ORDER.payment}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#E8242C', whiteSpace: 'nowrap' }}>
            {formatPrice(DEMO_ORDER.price)}
          </div>
        </div>
      </div>

      {/* ═══ Messages ═══ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {/* Date separator */}
        <div style={{ textAlign: 'center', margin: '10px 0', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 0.5, background: 'var(--esl-bg-elevated)' }} />
          <span style={{ background: 'var(--esl-bg-page)', padding: '0 10px', fontSize: 10, color: '#555', position: 'relative', zIndex: 1 }}>
            Өнөөдөр
          </span>
        </div>

        {msgs.map(msg => {
          // System message
          if (msg.type === 'system') {
            return (
              <div key={msg.id} style={{ textAlign: 'center', margin: '10px 0' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, color: '#555', background: 'var(--esl-bg-card)',
                  padding: '5px 12px', borderRadius: 99, border: '0.5px solid #2A2A2A',
                }}>
                  <Check size={12} />
                  {msg.sys}
                </span>
              </div>
            );
          }

          const isMe = msg.senderRole === 'customer';

          return (
            <div key={msg.id} style={{
              display: 'flex', gap: 8, marginBottom: 14,
              flexDirection: isMe ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isMe ? 'rgba(232,36,44,0.1)' : '#FCEBEB',
                color: isMe ? '#E8242C' : '#A32D2D',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 500, flexShrink: 0,
              }}>
                {isMe ? 'Та' : 'СФ'}
              </div>

              <div>
                {/* Image bubble */}
                {msg.imageUrl && (
                  <div style={{
                    width: 200, borderRadius: 12, overflow: 'hidden',
                    border: '0.5px solid #2A2A2A', cursor: 'pointer', marginBottom: 4,
                  }}>
                    <div style={{
                      width: '100%', height: 130, background: 'var(--esl-bg-card)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ImageIcon size={28} color="#555" />
                    </div>
                  </div>
                )}

                {/* Text bubble */}
                {msg.text && (
                  <div style={{
                    maxWidth: '68%', padding: '9px 12px', fontSize: 13, lineHeight: 1.55,
                    wordBreak: 'break-word',
                    borderRadius: isMe ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    background: isMe ? '#E8242C' : 'var(--esl-bg-card)',
                    color: isMe ? '#FFF' : '#E0E0E0',
                  }}>
                    {msg.text}
                  </div>
                )}

                {/* Meta */}
                <div style={{
                  fontSize: 10, marginTop: 3,
                  color: '#555',
                  textAlign: isMe ? 'right' : 'left',
                }}>
                  {new Date(msg.createdAt).toLocaleTimeString('mn', { hour: '2-digit', minute: '2-digit' })}
                  {isMe && msg.isRead && ' · Уншсан ✓✓'}
                  {isMe && !msg.isRead && ' · Илгээгдсэн ✓'}
                  {isMe && msg.imageUrl && ' · Хүргэгдсэн ✓✓'}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={msgsEndRef} />
      </div>

      {/* ═══ Review Card ═══ */}
      {showReview && (
        <div style={{
          margin: '0 14px 10px', background: 'var(--esl-bg-card)',
          border: '0.5px solid #2A2A2A', borderRadius: 12, padding: 12,
        }}>
          {reviewSent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4ADE80' }}>
              <Check size={16} />
              Үнэлгээ хүлээн авлаа. Баярлалаа!
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#FFF', marginBottom: 8 }}>
                Та барааг хүлээн авсан уу? Үнэлгээ үлдээнэ үү
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} onClick={() => setStarRating(i)} style={{
                    width: 28, height: 28, cursor: 'pointer', border: 'none', background: 'none', padding: 0,
                  }}>
                    <Star
                      size={28}
                      fill={i <= starRating ? '#FFD700' : 'none'}
                      color={i <= starRating ? '#FFD700' : '#3D3D3D'}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              <input
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Сэтгэгдэл бичих (сонголтоос)..."
                style={{
                  width: '100%', padding: '7px 10px', border: '0.5px solid #3D3D3D',
                  borderRadius: 8, background: 'var(--esl-bg-page)', color: '#FFF',
                  fontSize: 12, outline: 'none', marginBottom: 8, boxSizing: 'border-box',
                }}
              />
              <button
                onClick={async () => {
                  if (starRating === 0) return;
                  try {
                    const res = await fetch('/api/reviews', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        productId: DEMO_ORDER.productId || '',
                        orderId: DEMO_ORDER.orderId || '',
                        rating: starRating,
                        comment: reviewText || undefined,
                      }),
                    });
                    if (!res.ok) {
                      const data = await res.json().catch(() => ({}));
                      console.error('Review submit error:', data);
                    }
                  } catch (e) {
                    console.error('Review submit failed:', e);
                  }
                  setReviewSent(true);
                }}
                style={{
                  width: '100%', padding: 8, borderRadius: 8, border: 'none',
                  background: starRating > 0 ? '#E8242C' : '#333', color: '#FFF',
                  fontSize: 12, fontWeight: 500, cursor: starRating > 0 ? 'pointer' : 'not-allowed',
                  boxSizing: 'border-box',
                }}>
                Үнэлгээ илгээх →
              </button>
            </>
          )}
        </div>
      )}

      {/* ═══ Quick Chips ═══ */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '0 14px 10px' }}>
        {QUICK_CHIPS.map(chip => (
          <button key={chip} onClick={() => setInput(chip)}
            style={{
              padding: '6px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
              border: '0.5px solid #3D3D3D', background: 'var(--esl-bg-page)', color: '#777',
              whiteSpace: 'nowrap', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8242C'; e.currentTarget.style.color = '#E8242C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#3D3D3D'; e.currentTarget.style.color = '#777'; }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ═══ Input Area ═══ */}
      <div style={{
        padding: '10px 14px 14px', borderTop: '0.5px solid #2A2A2A',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button style={{
            width: 34, height: 34, borderRadius: '50%', border: '0.5px solid #3D3D3D',
            background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#777', flexShrink: 0,
          }}>
            <ImageIcon size={16} />
          </button>

          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--esl-bg-card)', border: '0.5px solid #2A2A2A',
            borderRadius: 20, padding: '7px 14px',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Мессеж бичих..."
              style={{
                flex: 1, border: 'none', background: 'none', outline: 'none',
                fontSize: 13, color: '#FFF', fontFamily: 'inherit',
              }}
            />
          </div>

          <button onClick={sendMessage} disabled={!input.trim()}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: input.trim() ? '#E8242C' : '#333',
              border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
            <Send size={15} color="#FFF" />
          </button>
        </div>

        {/* Encryption notice */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Lock size={11} color="#555" />
          <span style={{ fontSize: 10, color: '#555' }}>Бүх мессеж шифрлэгдсэн</span>
        </div>
      </div>
    </div>
  );
}
