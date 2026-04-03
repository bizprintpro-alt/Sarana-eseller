'use client';

import { motion } from 'framer-motion';
import { Eye, MousePointerClick, ShoppingCart, CreditCard } from 'lucide-react';

interface FunnelStep {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

interface ConversionFunnelProps {
  views?: number;
  clicks?: number;
  addToCart?: number;
  purchases?: number;
}

export default function ConversionFunnel({
  views = 3240,
  clicks = 1243,
  addToCart = 186,
  purchases = 62,
}: ConversionFunnelProps) {
  const steps: FunnelStep[] = [
    { label: 'Линк нээсэн', value: views, icon: Eye, color: '#6366F1' },
    { label: 'Клик хийсэн', value: clicks, icon: MousePointerClick, color: '#EC4899' },
    { label: 'Сагсанд нэмсэн', value: addToCart, icon: ShoppingCart, color: '#F59E0B' },
    { label: 'Худалдан авсан', value: purchases, icon: CreditCard, color: '#10B981' },
  ];

  const maxVal = steps[0].value || 1;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
      <h3 className="font-bold text-[#0F172A] mb-5 flex items-center gap-2 text-sm">
        <ShoppingCart className="w-4 h-4 text-[#6366F1]" />
        Борлуулалтын шүүлтүүр (Funnel)
      </h3>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const pct = (step.value / maxVal) * 100;
          const convRate = i > 0 ? ((step.value / steps[i - 1].value) * 100).toFixed(1) : '100';
          const StepIcon = step.icon;

          return (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <StepIcon className="w-4 h-4" style={{ color: step.color }} />
                  <span className="text-xs font-semibold text-[#475569]">{step.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[#0F172A]">{step.value.toLocaleString()}</span>
                  {i > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: step.color + '15', color: step.color }}>
                      {convRate}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: step.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
        <span className="text-xs text-[#94A3B8]">Нийт хөрвүүлэлт</span>
        <span className="text-sm font-black text-[#10B981]">
          {((purchases / (views || 1)) * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
