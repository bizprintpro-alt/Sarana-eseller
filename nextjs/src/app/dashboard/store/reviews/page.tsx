'use client';

import { useState } from 'react';
import { useToast } from '@/components/shared/Toast';
import { timeAgo } from '@/lib/utils';
import StatCard from '@/components/dashboard/StatCard';

interface Review {
  id: string;
  customerName: string;
  productName: string;
  productEmoji: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
}

const INITIAL_REVIEWS: Review[] = [
  { id: '1', customerName: 'Бат-Эрдэнэ', productName: 'Premium цагаан цамц', productEmoji: '👕', rating: 5, comment: 'Чанар маш сайн, хэмжээ яг таарсан. Дахин захиална!', createdAt: '2026-04-02T10:00:00Z' },
  { id: '2', customerName: 'Сарангэрэл', productName: 'Bluetooth чихэвч', productEmoji: '🎧', rating: 4, comment: 'Дуу чанар сайн, батарей удаан барина. Загвар нь бас гоё.', reply: 'Баярлалаа! Таалагдсанд баяртай байна.', createdAt: '2026-04-01T14:30:00Z' },
  { id: '3', customerName: 'Ганбаатар', productName: 'Sporty гутал Air', productEmoji: '👟', rating: 5, comment: 'Хөнгөн, тохилог. Спорт хийхэд тохиромжтой.', createdAt: '2026-03-30T09:15:00Z' },
  { id: '4', customerName: 'Оюунчимэг', productName: 'Нүүрний крем SPF50', productEmoji: '💄', rating: 3, comment: 'Чийгшүүлэгч сайн, гэхдээ үнэр нь хүчтэй.', createdAt: '2026-03-28T16:45:00Z' },
  { id: '5', customerName: 'Тэмүүлэн', productName: 'Yoga mat pro', productEmoji: '🧘', rating: 5, comment: 'Гулсахгүй, зузаан нь яг тохирсон. Маш сэтгэл хангалуун!', reply: 'Танд баярлалаа! Эрүүл мэндэд тань тустай байг!', createdAt: '2026-03-25T08:00:00Z' },
  { id: '6', customerName: 'Энхтүвшин', productName: 'iPhone 15 Pro case', productEmoji: '📱', rating: 4, comment: 'Хамгаалалт сайн, магнит хүчтэй. Зөвлөж байна.', createdAt: '2026-03-22T12:00:00Z' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-sm ${i <= rating ? 'text-amber-400' : 'text-[var(--esl-text-disabled)]'}`}>&#9733;</span>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const toast = useToast();

  function handleReply(id: string) {
    if (!replyText.trim()) {
      toast.show('Хариу бичнэ үү', 'warn');
      return;
    }
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: replyText } : r)));
    setReplyingTo(null);
    setReplyText('');
    toast.show('Хариу илгээгдлээ', 'ok');
  }

  const filtered = filterRating ? reviews.filter((r) => r.rating === filterRating) : reviews;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  return (
    <div className="min-h-screen bg-[var(--esl-bg-section)] p-6">
      <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] p-6 mb-6">
        <h1 className="text-2xl font-bold text-[var(--esl-text-primary)]">Сэтгэгдэлүүд</h1>
        <p className="text-[var(--esl-text-secondary)] mt-1">Харилцагчдын сэтгэгдэл, үнэлгээ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon="⭐" label="Дундаж үнэлгээ" value={avgRating} gradient="amber" />
        <StatCard icon="📝" label="Нийт сэтгэгдэл" value={reviews.length} gradient="indigo" />
        <StatCard icon="🏆" label="5 од" value={fiveStarCount} gradient="green" />
        <StatCard icon="💬" label="Хариу бичсэн" value={reviews.filter((r) => r.reply).length} gradient="pink" />
      </div>

      {/* Filter by rating */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterRating(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !filterRating ? 'bg-indigo-600 text-white' : 'bg-[var(--esl-bg-card)] text-[var(--esl-text-secondary)] border border-[var(--esl-border)] hover:bg-[var(--esl-bg-section)]'
          }`}
        >
          Бүгд
        </button>
        {[5, 4, 3, 2, 1].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRating(r)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterRating === r ? 'bg-indigo-600 text-white' : 'bg-[var(--esl-bg-card)] text-[var(--esl-text-secondary)] border border-[var(--esl-border)] hover:bg-[var(--esl-bg-section)]'
            }`}
          >
            {r} &#9733;
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] p-12 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <h3 className="text-lg font-semibold text-[var(--esl-text-primary)]">Сэтгэгдэл олдсонгүй</h3>
          <p className="text-[var(--esl-text-muted)] mt-1">Энэ үнэлгээтэй сэтгэгдэл байхгүй байна</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div key={review.id} className="bg-[var(--esl-bg-card)] rounded-xl border border-[var(--esl-border)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {review.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--esl-text-primary)]">{review.customerName}</span>
                      <StarRating rating={review.rating} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--esl-text-muted)]">{review.productEmoji} {review.productName}</span>
                      <span className="text-xs text-[var(--esl-text-muted)]">|</span>
                      <span className="text-xs text-[var(--esl-text-muted)]">{timeAgo(review.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[var(--esl-text-primary)] mt-2">{review.comment}</p>

                    {/* Reply */}
                    {review.reply && (
                      <div className="mt-3 bg-indigo-50 rounded-lg p-3 border-l-3 border-indigo-400">
                        <p className="text-xs text-indigo-600 font-medium mb-1">Таны хариу:</p>
                        <p className="text-sm text-indigo-700">{review.reply}</p>
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === review.id && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Хариу бичих..."
                          rows={2}
                          className="w-full px-3 py-2 border border-[var(--esl-border)] rounded-lg text-sm text-[var(--esl-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleReply(review.id)} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
                            Илгээх
                          </button>
                          <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="px-4 py-1.5 bg-[var(--esl-bg-section)] text-[var(--esl-text-secondary)] rounded-lg text-xs font-medium hover:bg-[var(--esl-bg-card-hover)]">
                            Болих
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {!review.reply && replyingTo !== review.id && (
                  <button
                    onClick={() => { setReplyingTo(review.id); setReplyText(''); }}
                    className="px-3 py-1.5 text-xs font-medium bg-[var(--esl-bg-section)] text-[var(--esl-text-primary)] rounded-lg hover:bg-[var(--esl-bg-card-hover)] transition-colors flex-shrink-0"
                  >
                    💬 Хариу
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
