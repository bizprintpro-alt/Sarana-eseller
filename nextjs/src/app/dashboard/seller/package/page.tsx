'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';
import { formatPrice } from '@/lib/utils';
import {
  PLANS,
  PlanId,
  getSubscription,
  saveSubscription,
  getCurrentPlan,
  getRemainingDays,
  getUsagePercent,
} from '@/lib/subscription';

function UsageBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{percent === 0 ? 'Хязгааргүй' : `${percent}%`}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function PackagePage() {
  const toast = useToast();
  const [yearly, setYearly] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>('free');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentPlanId(getSubscription().planId);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const plan = getCurrentPlan();
  const sub = getSubscription();
  const remaining = getRemainingDays();
  const usageProducts = getUsagePercent('products');
  const usageStaff = getUsagePercent('staff');
  const usageStorage = getUsagePercent('storage');
  const usageAI = getUsagePercent('aiCredits');

  function handleSelect(planId: PlanId) {
    if (planId === currentPlanId) return;
    const newPlan = PLANS.find((p) => p.id === planId)!;
    const newSub = {
      ...sub,
      planId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    saveSubscription(newSub);
    setCurrentPlanId(planId);
    toast.show(`${newPlan.name} багц идэвхжлээ!`, 'ok');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">📦</span>
          <h1 className="text-2xl font-bold text-gray-900">Үнийн багц</h1>
        </div>
        <p className="text-gray-500 text-sm">Дэлгүүрийнхээ боломжийг нэмэгдүүлж, борлуулалтаа өсгөөрэй</p>
      </div>

      {/* Current Plan Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: plan.color }}
            >
              {plan.nameEn[0]}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{plan.name} багц</h2>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
              {remaining} хоног үлдсэн
            </span>
            {plan.id !== 'free' && (
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                Идэвхтэй
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UsageBar label="Бараа" percent={usageProducts} color="#6366F1" />
          <UsageBar label="Ажилтан" percent={usageStaff} color="#8B5CF6" />
          <UsageBar label="Хадгалах зай" percent={usageStorage} color="#06B6D4" />
          <UsageBar label="AI кредит" percent={usageAI} color="#EC4899" />
        </div>
      </div>

      {/* Monthly / Yearly Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-1 flex">
          <button
            onClick={() => setYearly(false)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              !yearly ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Сарын
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              yearly ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Жилийн
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-7xl mx-auto mb-10">
        {PLANS.map((p) => {
          const isCurrent = p.id === currentPlanId;
          const isAIPro = p.id === 'ai_pro';
          const price = yearly ? p.yearlyPrice : p.price;

          return (
            <div
              key={p.id}
              className={`relative rounded-2xl overflow-hidden transition-all ${
                isAIPro
                  ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border-2 border-pink-300 shadow-lg shadow-pink-100'
                  : isCurrent
                  ? 'bg-white border-2 border-green-400 shadow-md'
                  : p.id === 'standard'
                  ? 'bg-white border-2 border-indigo-400 shadow-md shadow-indigo-50'
                  : p.id === 'ultimate'
                  ? 'bg-white border-2 border-amber-400 shadow-md shadow-amber-50'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {/* Badge */}
              {p.badge && (
                <div
                  className="absolute top-0 right-0 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg"
                  style={{ backgroundColor: p.color }}
                >
                  {p.badge}
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg">
                  Одоогийн багц
                </div>
              )}

              <div className="p-6 pt-8">
                {/* Name */}
                <div className="text-center mb-5">
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.id === 'free' ? '🆓' : p.id === 'standard' ? '⭐' : p.id === 'ultimate' ? '💎' : '🤖'}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                  <div className="mt-3">
                    {price === 0 ? (
                      <span className="text-3xl font-black text-gray-900">Үнэгүй</span>
                    ) : (
                      <div>
                        <span className="text-3xl font-black text-gray-900">{formatPrice(price)}</span>
                        <span className="text-gray-500 text-sm">{yearly ? '/жил' : '/сар'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">&#10003;</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => handleSelect(p.id)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : isAIPro
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-md'
                      : p.id === 'standard'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : p.id === 'ultimate'
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrent ? 'Одоогийн багц' : 'Сонгох'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-7xl mx-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Багцуудын харьцуулалт</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-600">Боломж</th>
                {PLANS.map((p) => (
                  <th key={p.id} className="p-4 text-center font-semibold" style={{ color: p.color }}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Бараа', key: 'maxProducts' as const },
                { label: 'Ажилтан', key: 'maxStaff' as const },
                { label: 'Салбар', key: 'maxBranches' as const },
                { label: 'Ангилал', key: 'maxCategories' as const },
                { label: 'Брэнд', key: 'maxBrands' as const },
                { label: 'Хадгалах зай (MB)', key: 'maxStorage' as const },
                { label: 'AI кредит', key: 'aiCredits' as const },
                { label: 'Блог нийтлэл', key: 'blogPosts' as const },
                { label: 'Промо код', key: 'promoCodesLimit' as const },
              ].map((row, i) => (
                <tr key={row.key} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-4 text-gray-700 font-medium">{row.label}</td>
                  {PLANS.map((p) => {
                    const val = p.limits[row.key];
                    return (
                      <td key={p.id} className="p-4 text-center text-gray-800">
                        {val === -1 ? (
                          <span className="text-green-600 font-semibold">Хязгааргүй</span>
                        ) : (
                          <span>{typeof val === 'number' ? val.toLocaleString() : val ? '✓' : '—'}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {[
                { label: 'Хувийн домайн', key: 'customDomain' as const },
                { label: 'Лого арилгах', key: 'removeBranding' as const },
                { label: 'Аналитик', key: 'analytics' as const },
                { label: 'Тэргүүлэх дэмжлэг', key: 'prioritySupport' as const },
                { label: 'Бэлгийн карт', key: 'giftCards' as const },
                { label: 'Олон хэл', key: 'multiLanguage' as const },
                { label: 'API хандалт', key: 'apiAccess' as const },
                { label: 'Дата экспорт', key: 'exportData' as const },
                { label: 'SEO хэрэгсэл', key: 'seoTools' as const },
              ].map((row, i) => (
                <tr key={row.key} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="p-4 text-gray-700 font-medium">{row.label}</td>
                  {PLANS.map((p) => (
                    <td key={p.id} className="p-4 text-center">
                      {p.limits[row.key] ? (
                        <span className="text-green-500 text-lg">&#10003;</span>
                      ) : (
                        <span className="text-gray-300 text-lg">&#10007;</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto mt-10 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Түгээмэл асуултууд</h2>
        <div className="space-y-4">
          {[
            ['Багц хэзээ идэвхждэг вэ?', 'Төлбөр баталгаажмагц шууд идэвхжинэ.'],
            ['Буцаан олголт авч болох уу?', 'Тийм, 7 хоногийн дотор бүрэн буцаан олголт авна.'],
            ['Багцаа хэзээ ч өөрчилж болох уу?', 'Тийм, хүссэн үедээ дээшлүүлэх эсвэл бууруулах боломжтой.'],
            ['AI кредит дуусвал яах вэ?', 'Дараа сард автоматаар шинэчлэгдэнэ, эсвэл дээд багц руу шилжиж болно.'],
          ].map(([q, a], i) => (
            <div key={i} className="border-b border-gray-100 pb-3 last:border-0">
              <p className="text-sm font-semibold text-gray-800">{q}</p>
              <p className="text-sm text-gray-500 mt-1">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
