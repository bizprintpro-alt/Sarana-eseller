'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/shared/Toast';
import { PLANS } from '@/lib/subscription';
import { formatPrice, getInitials } from '@/lib/utils';
import { Check, ChevronRight, Store, Palette, Package, Zap, Crown } from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { num: 1, label: 'Багц сонгох', icon: Crown },
  { num: 2, label: 'Дэлгүүрийн мэдээлэл', icon: Store },
  { num: 3, label: 'Дизайн тохиргоо', icon: Palette },
  { num: 4, label: 'Эхний бараа', icon: Package },
];

const COLORS = [
  { value: '#4F46E5', name: 'Индиго' },
  { value: '#DC2626', name: 'Улаан' },
  { value: '#059669', name: 'Ногоон' },
  { value: '#D97706', name: 'Шар' },
  { value: '#7C3AED', name: 'Нил ягаан' },
  { value: '#0891B2', name: 'Цэнхэр' },
  { value: '#EC4899', name: 'Ягаан' },
  { value: '#0F172A', name: 'Хар' },
];

const INDUSTRIES = [
  { value: 'fashion', emoji: '👗', label: 'Хувцас & Загвар' },
  { value: 'food', emoji: '🍔', label: 'Хоол & Ундаа' },
  { value: 'electronics', emoji: '📱', label: 'Электроник' },
  { value: 'beauty', emoji: '💄', label: 'Гоо сайхан' },
  { value: 'home', emoji: '🏡', label: 'Гэр & Тавилга' },
  { value: 'sports', emoji: '⚽', label: 'Спорт' },
  { value: 'books', emoji: '📚', label: 'Ном & Сургалт' },
  { value: 'other', emoji: '📦', label: 'Бусад' },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<Step>(1);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [storeName, setStoreName] = useState(user?.name ? user.name + 'ийн дэлгүүр' : '');
  const [storeDesc, setStoreDesc] = useState('');
  const [industry, setIndustry] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productEmoji, setProductEmoji] = useState('📦');

  const canNext = () => {
    if (step === 1) return true;
    if (step === 2) return storeName.trim().length >= 2 && industry;
    if (step === 3) return true;
    if (step === 4) return true;
    return false;
  };

  const handleFinish = () => {
    // Save all settings to localStorage
    const config = {
      storeName,
      storeDescription: storeDesc,
      industry,
      primaryColor: color,
      plan: selectedPlan,
      onboardingComplete: true,
    };
    localStorage.setItem('eseller_store_config', JSON.stringify(config));
    localStorage.setItem('eseller_onboarding_done', 'true');
    toast.show('🎉 Дэлгүүр амжилттай үүслээ!');
    router.push('/dashboard/seller');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ═══ Header ═══ */}
      <div className="bg-white border-b border-slate-100 px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-slate-900">
              eseller<span className="text-indigo-600">.mn</span>
            </span>
          </div>
          <span className="text-sm text-slate-400">Дэлгүүр тохируулах</span>
        </div>
      </div>

      {/* ═══ Progress ═══ */}
      <div className="bg-white border-b border-slate-100 px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${step >= s.num ? '' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                    step > s.num
                      ? 'bg-green-100 text-green-600'
                      : step === s.num
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="text-xs font-medium text-slate-600 hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${step > s.num ? 'bg-green-300' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Content ═══ */}
      <div className="flex-1 px-8 py-10">
        <div className="max-w-4xl mx-auto">

          {/* Step 1 — Plan Selection */}
          {step === 1 && (
            <div className="animate-fade-up">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Багцаа сонгоорой</h1>
                <p className="text-sm text-slate-500">Дараа нь хүссэн үедээ шинэчлэх боломжтой</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`card p-5 text-left cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-indigo-500 shadow-[0_0_0_2px_rgba(79,70,229,0.2)] bg-indigo-50/30'
                        : 'hover:border-slate-300'
                    }`}
                  >
                    {plan.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 inline-block"
                        style={{ background: plan.color + '15', color: plan.color }}>
                        {plan.badge}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1 mb-2">
                      <span className="text-xl font-bold text-slate-900">{plan.price === 0 ? 'Үнэгүй' : formatPrice(plan.price)}</span>
                      {plan.price > 0 && <span className="text-xs text-slate-400">/сар</span>}
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{plan.description}</p>
                    <ul className="space-y-1.5">
                      {plan.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <Check className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Store Info */}
          {step === 2 && (
            <div className="max-w-lg mx-auto animate-fade-up">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Дэлгүүрийн мэдээлэл</h1>
                <p className="text-sm text-slate-500">Дэлгүүрийнхээ үндсэн мэдээллийг оруулна уу</p>
              </div>
              <div className="card p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Дэлгүүрийн нэр *</label>
                  <input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                    placeholder="Миний дэлгүүр"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Хаяг: <span className="font-medium text-indigo-600">{(storeName || 'store').toLowerCase().replace(/\s+/g, '-')}.eseller.mn</span>
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Тайлбар</label>
                  <textarea
                    value={storeDesc}
                    onChange={(e) => setStoreDesc(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition resize-none"
                    placeholder="Дэлгүүрийнхээ тухай товч бичнэ үү..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Салбар *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind.value}
                        onClick={() => setIndustry(ind.value)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition-all ${
                          industry === ind.value
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-lg">{ind.emoji}</span>
                        <span>{ind.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Design */}
          {step === 3 && (
            <div className="max-w-lg mx-auto animate-fade-up">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Дизайн тохиргоо</h1>
                <p className="text-sm text-slate-500">Дэлгүүрийнхээ гол өнгийг сонгоно уу</p>
              </div>
              <div className="card p-6">
                <label className="block text-xs font-semibold text-slate-500 mb-3">Брэндийн өнгө</label>
                <div className="flex flex-wrap gap-3 mb-6">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={`w-12 h-12 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                        color === c.value ? 'border-slate-900 scale-110 shadow-lg' : 'border-transparent shadow-sm'
                      }`}
                      style={{ background: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>

                {/* Preview */}
                <label className="block text-xs font-semibold text-slate-500 mb-3">Урьдчилсан харагдах байдал</label>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="h-3" style={{ background: color }} />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: color }}>
                        {getInitials(storeName)}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{storeName || 'Миний дэлгүүр'}</span>
                    </div>
                    <div className="rounded-xl p-4 text-center text-white text-sm font-semibold" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                      {storeDesc || 'Манай дэлгүүрт тавтай морил!'}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {[1,2,3].map((i) => (
                        <div key={i} className="flex-1 bg-slate-50 rounded-lg h-16" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — First Product */}
          {step === 4 && (
            <div className="max-w-lg mx-auto animate-fade-up">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Эхний бараагаа нэмэх</h1>
                <p className="text-sm text-slate-500">Дараа нь хүссэн хэдэн ч бараа нэмэх боломжтой</p>
              </div>
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl cursor-pointer hover:bg-slate-100 transition shrink-0"
                    onClick={() => {
                      const emojis = ['📦','👕','🍔','📱','💄','🧘','🎧','👜','🌿','⚽'];
                      const idx = emojis.indexOf(productEmoji);
                      setProductEmoji(emojis[(idx + 1) % emojis.length]);
                    }}
                  >
                    {productEmoji}
                  </button>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 mb-1">Дүрс дарж солих</p>
                    <p className="text-xs text-slate-500">Дараа нь зургаар орлуулах боломжтой</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Барааны нэр</label>
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                    placeholder="Жишээ: Premium цагаан цамц"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Үнэ (₮)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                    placeholder="35,000"
                  />
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                  <p className="text-xs text-indigo-600">
                    💡 Та дараа нь <strong>Бараа удирдлага</strong> хэсгээс зураг, тайлбар, ангилал зэргийг нэмж болно
                  </p>
                </div>
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    // Skip adding product
                    handleFinish();
                  }}
                  className="text-sm text-slate-400 bg-transparent border-none cursor-pointer hover:text-slate-600 transition"
                >
                  Алгасах, дараа нэмнэ →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Footer Nav ═══ */}
      <div className="bg-white border-t border-slate-100 px-8 py-4 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as Step)}
              className="text-sm font-medium text-slate-500 bg-transparent border-none cursor-pointer hover:text-slate-700 transition"
            >
              ← Буцах
            </button>
          ) : <div />}

          <button
            onClick={() => {
              if (step < 4) {
                setStep((step + 1) as Step);
              } else {
                handleFinish();
              }
            }}
            disabled={!canNext()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {step === 4 ? '🎉 Дэлгүүр нээх' : 'Үргэлжлүүлэх'}
            {step < 4 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
