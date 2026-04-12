'use client';

import { useEffect, useRef, ReactNode } from 'react';

type Variant = 'primary' | 'success' | 'warning' | 'info';
// Keep old gradient names for backward compat
type LegacyGradient = 'indigo' | 'pink' | 'green' | 'amber';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  variant?: Variant;
  gradient?: LegacyGradient; // backward compat — mapped to variant
  animate?: boolean;
  sparkData?: number[];
}

const VARIANT_STYLES: Record<Variant, { bg: string; accent: string; icon: string }> = {
  primary: {
    bg: 'var(--esl-brand)',
    accent: 'rgba(255,255,255,0.15)',
    icon: 'rgba(255,255,255,0.4)',
  },
  success: {
    bg: 'var(--esl-success)',
    accent: 'rgba(255,255,255,0.15)',
    icon: 'rgba(255,255,255,0.4)',
  },
  warning: {
    bg: 'var(--esl-warning)',
    accent: 'rgba(255,255,255,0.15)',
    icon: 'rgba(255,255,255,0.4)',
  },
  info: {
    bg: 'var(--esl-info)',
    accent: 'rgba(255,255,255,0.15)',
    icon: 'rgba(255,255,255,0.4)',
  },
};

// Map old gradient names to new variants
const GRADIENT_TO_VARIANT: Record<LegacyGradient, Variant> = {
  indigo: 'primary',
  pink: 'primary',
  green: 'success',
  amber: 'warning',
};

export default function StatCard({
  icon,
  label,
  value,
  sub,
  variant,
  gradient,
  animate = true,
  sparkData,
}: StatCardProps) {
  const resolvedVariant = variant || (gradient ? GRADIENT_TO_VARIANT[gradient] : 'primary');
  const style = VARIANT_STYLES[resolvedVariant];
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
      className="rounded-2xl p-5 px-6 text-white relative overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ background: style.bg }}
    >
      {/* Decorative circle */}
      <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ background: style.accent }} />

      <div className="text-2xl mb-1" style={{ color: style.icon }}>{icon}</div>
      <div ref={valRef} className="text-2xl font-black mb-1">
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
