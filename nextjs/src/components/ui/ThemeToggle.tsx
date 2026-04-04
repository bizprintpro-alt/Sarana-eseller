'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Өдрийн горим' : 'Шөнийн горим'}
      style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'var(--esl-bg-input)', border: '1px solid var(--esl-border)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--esl-text-primary)', flexShrink: 0,
      }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {([
        { value: 'light' as const, label: '☀️ Өдөр' },
        { value: 'dark' as const, label: '🌙 Шөнө' },
        { value: 'system' as const, label: '💻 Систем' },
      ]).map(opt => {
        const active = theme === opt.value;
        return (
          <button key={opt.value} onClick={() => setTheme(opt.value)}
            style={{
              flex: 1, padding: '6px 8px', borderRadius: 20,
              fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer',
              border: active ? '1.5px solid var(--esl-brand)' : '1px solid var(--esl-border)',
              background: active ? 'var(--esl-brand-bg)' : 'var(--esl-bg-input)',
              color: active ? 'var(--esl-brand)' : 'var(--esl-text-secondary)',
              whiteSpace: 'nowrap',
            }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
