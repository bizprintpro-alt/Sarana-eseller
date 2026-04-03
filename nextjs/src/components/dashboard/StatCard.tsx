'use client';

import { useEffect, useRef } from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  gradient: 'indigo' | 'pink' | 'green' | 'amber';
  animate?: boolean;
  sparkData?: number[];
}

const GRADIENTS = {
  indigo: 'from-[#6366F1] to-[#4338CA]',
  pink: 'from-[#EC4899] to-[#DB2777]',
  green: 'from-[#10B981] to-[#059669]',
  amber: 'from-[#F59E0B] to-[#D97706]',
};

export default function StatCard({
  icon,
  label,
  value,
  sub,
  gradient,
  animate = true,
  sparkData,
}: StatCardProps) {
  const valRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || typeof value !== 'number' || !valRef.current) return;
    const el = valRef.current;
    const target = value;
    const duration = 1200;
    const start = performance.now();

    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current.toLocaleString('mn-MN');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [value, animate]);

  return (
    <div
      className={`bg-gradient-to-br ${GRADIENTS[gradient]} rounded-2xl p-5 px-6 text-white relative overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.3)]`}
    >
      {/* Decorative circle */}
      <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/[.08]" />

      <div className="text-white/40 text-2xl mb-1">{icon}</div>
      <div ref={valRef} className="text-2xl font-black mb-1 animate-count-up">
        {typeof value === 'number' ? value.toLocaleString('mn-MN') : value}
      </div>
      <div className="text-sm text-white/70 font-medium">{label}</div>
      {sub && <div className="text-xs text-white/50 mt-1">{sub}</div>}

      {/* Sparkline */}
      {sparkData && sparkData.length > 0 && (
        <div className="flex items-end gap-0.5 h-7 mt-2">
          {sparkData.map((v, i) => {
            const max = Math.max(...sparkData, 1);
            const h = Math.max(4, (v / max) * 28);
            return (
              <div
                key={i}
                className="flex-1 rounded-sm bg-white/25 hover:bg-white/50 transition-all"
                style={{
                  height: h,
                  animationDelay: `${i * 0.05}s`,
                  animation: 'sparkGrow .8s ease both',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
