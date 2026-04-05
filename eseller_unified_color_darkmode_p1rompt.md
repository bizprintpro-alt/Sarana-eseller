# Eseller.mn — Нэгдсэн Өнгөний Систем + Өдөр/Шөнийн Горим
## Claude Code Prompt — Брэнд засвар + Dark/Light Mode · Web + Mobile

Энэ prompt хоёр зүйлийг нэгэн зэрэг хийнэ:
1. Бүх хэсгийг хар болгосон АЛДААГ засах
2. Өдөр/шөнийн горим бүх системд нэгтгэх

---

## СУУРЬ ЗАРЧИМ — ЭХЛЭХИЙН ӨМНӨ УНШ

```
АЛДААТАЙ байсан ойлголт:
  "brand dark theme = бүх зүйл хар" гэж бодсон
  → page, card, section, admin бүгд #0A0A0A болсон ← БУРУУ

ЗӨВ ойлголт — 3 цогцлол:
  80% ЦАГААН  → page, card, modal, form, admin  (горимоор солигдоно)
  15% УЛААН   → hero, CTA, nav, badges          (хэзээ ч өөрчлөгдөхгүй)
   5% ХАР     → footer, announcement bar         (хэзээ ч өөрчлөгдөхгүй)

LIGHT MODE (default):
  page #FFFFFF · card #FFFFFF · text #0A0A0A · border #E5E5E5

DARK MODE:
  page #0A0A0A · card #1A1A1A · text #FFFFFF · border #3D3D3D

УЛААН БРЭНД (#E8242C) — хоёр горимд ИЖИЛ
FOOTER (#0A0A0A) — хоёр горимд ИЖИЛ
ANNOUNCEMENT (#1A1A1A) — хоёр горимд ИЖИЛ
```

---

## 1. CSS DESIGN TOKENS — /styles/globals.css

```css
/* /styles/globals.css
   Single source of truth — web болон mobile хоёулаа эндээс авна */

:root {
  /* ── Brand (горим хамааргүй — хэзээ ч өөрчлөгдөхгүй) ── */
  --esl-brand:          #E8242C;
  --esl-brand-dark:     #C41E25;
  --esl-brand-light:    #FF4D53;
  --esl-brand-bg:       rgba(232, 36, 44, 0.08);
  --esl-brand-border:   rgba(232, 36, 44, 0.25);

  /* ── Light mode — page/card/section ── */
  --esl-bg-page:        #FFFFFF;
  --esl-bg-section:     #F8F8F8;
  --esl-bg-card:        #FFFFFF;
  --esl-bg-card-hover:  #F5F5F5;
  --esl-bg-input:       #F5F5F5;
  --esl-bg-elevated:    #FFFFFF;
  --esl-bg-navbar:      rgba(255, 255, 255, 0.95);
  --esl-bg-overlay:     rgba(0, 0, 0, 0.50);
  --esl-bg-tooltip:     #0A0A0A;

  /* ── Light mode — borders ── */
  --esl-border:         #E5E5E5;
  --esl-border-strong:  #CCCCCC;
  --esl-border-focus:   #E8242C;

  /* ── Light mode — text ── */
  --esl-text-primary:   #0A0A0A;
  --esl-text-secondary: #555555;
  --esl-text-muted:     #9CA3AF;
  --esl-text-disabled:  #D1D5DB;
  --esl-text-inverse:   #FFFFFF;

  /* ── Light mode — semantic ── */
  --esl-success:        #16A34A;
  --esl-success-bg:     #DCFCE7;
  --esl-success-border: #BBF7D0;
  --esl-warning:        #D97706;
  --esl-warning-bg:     #FEF9C3;
  --esl-warning-border: #FDE68A;
  --esl-info:           #2563EB;
  --esl-info-bg:        #EFF6FF;
  --esl-info-border:    #BFDBFE;
  --esl-danger:         #DC2626;
  --esl-danger-bg:      #FEE2E2;
  --esl-danger-border:  #FECACA;

  /* ── Special (горим хамааргүй) ── */
  --esl-vip:            #FFD700;
  --esl-vip-bg:         #FEFCE8;
  --esl-feature-pills:  #FFF9F0;

  /* ── Always dark (горим хамааргүй — хэзээ ч цагаан болохгүй) ── */
  --esl-footer-bg:      #0A0A0A;
  --esl-footer-text:    #E0E0E0;
  --esl-announce-bg:    #1A1A1A;
  --esl-announce-text:  #E0E0E0;

  /* ── Radius ── */
  --esl-radius-sm:   6px;
  --esl-radius-md:   10px;
  --esl-radius-lg:   16px;
  --esl-radius-xl:   24px;
  --esl-radius-full: 9999px;

  /* ── Shadow (light) ── */
  --esl-shadow-sm:   0 1px 3px  rgba(0,0,0,0.08);
  --esl-shadow-md:   0 4px 12px rgba(0,0,0,0.10);
  --esl-shadow-lg:   0 8px 24px rgba(0,0,0,0.12);
  --esl-shadow-card: 0 2px 8px  rgba(0,0,0,0.06);

  /* ── Transition ── */
  --esl-transition:      150ms ease;
  --esl-transition-slow: 300ms ease;
}

/* ════════════════════════════════════
   DARK MODE
   ════════════════════════════════════ */
[data-theme="dark"],
.dark {
  --esl-bg-page:        #0A0A0A;
  --esl-bg-section:     #111111;
  --esl-bg-card:        #1A1A1A;
  --esl-bg-card-hover:  #222222;
  --esl-bg-input:       #2A2A2A;
  --esl-bg-elevated:    #2A2A2A;
  --esl-bg-navbar:      rgba(10, 10, 10, 0.95);
  --esl-bg-overlay:     rgba(0, 0, 0, 0.70);
  --esl-bg-tooltip:     #E0E0E0;

  --esl-border:         #3D3D3D;
  --esl-border-strong:  #555555;

  --esl-text-primary:   #FFFFFF;
  --esl-text-secondary: #E0E0E0;
  --esl-text-muted:     #A0A0A0;
  --esl-text-disabled:  #555555;
  --esl-text-inverse:   #0A0A0A;

  --esl-success:        #4ADE80;
  --esl-success-bg:     rgba(34,  197, 94,  0.12);
  --esl-success-border: rgba(34,  197, 94,  0.25);
  --esl-warning:        #FBBF24;
  --esl-warning-bg:     rgba(245, 158, 11,  0.12);
  --esl-warning-border: rgba(245, 158, 11,  0.25);
  --esl-info:           #60A5FA;
  --esl-info-bg:        rgba(59,  130, 246, 0.12);
  --esl-info-border:    rgba(59,  130, 246, 0.25);
  --esl-danger:         #F87171;
  --esl-danger-bg:      rgba(220, 38,  38,  0.12);
  --esl-danger-border:  rgba(220, 38,  38,  0.25);

  --esl-vip-bg:         rgba(255, 215, 0,   0.12);
  --esl-feature-pills:  #111111;

  --esl-shadow-sm:      0 1px 3px  rgba(0,0,0,0.30);
  --esl-shadow-md:      0 4px 12px rgba(0,0,0,0.40);
  --esl-shadow-lg:      0 8px 24px rgba(0,0,0,0.50);
  --esl-shadow-card:    0 2px 8px  rgba(0,0,0,0.30);
}

/* ════════════════════════════════════
   SYSTEM PREFERENCE (автомат)
   ════════════════════════════════════ */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --esl-bg-page:        #0A0A0A;
    --esl-bg-section:     #111111;
    --esl-bg-card:        #1A1A1A;
    --esl-bg-card-hover:  #222222;
    --esl-bg-input:       #2A2A2A;
    --esl-bg-elevated:    #2A2A2A;
    --esl-bg-navbar:      rgba(10, 10, 10, 0.95);
    --esl-bg-overlay:     rgba(0, 0, 0, 0.70);
    --esl-bg-tooltip:     #E0E0E0;
    --esl-border:         #3D3D3D;
    --esl-border-strong:  #555555;
    --esl-text-primary:   #FFFFFF;
    --esl-text-secondary: #E0E0E0;
    --esl-text-muted:     #A0A0A0;
    --esl-text-disabled:  #555555;
    --esl-text-inverse:   #0A0A0A;
    --esl-success:        #4ADE80;
    --esl-success-bg:     rgba(34,  197, 94,  0.12);
    --esl-success-border: rgba(34,  197, 94,  0.25);
    --esl-warning:        #FBBF24;
    --esl-warning-bg:     rgba(245, 158, 11,  0.12);
    --esl-warning-border: rgba(245, 158, 11,  0.25);
    --esl-info:           #60A5FA;
    --esl-info-bg:        rgba(59,  130, 246, 0.12);
    --esl-info-border:    rgba(59,  130, 246, 0.25);
    --esl-danger:         #F87171;
    --esl-danger-bg:      rgba(220, 38,  38,  0.12);
    --esl-danger-border:  rgba(220, 38,  38,  0.25);
    --esl-vip-bg:         rgba(255, 215, 0,   0.12);
    --esl-feature-pills:  #111111;
    --esl-shadow-sm:      0 1px 3px  rgba(0,0,0,0.30);
    --esl-shadow-md:      0 4px 12px rgba(0,0,0,0.40);
    --esl-shadow-lg:      0 8px 24px rgba(0,0,0,0.50);
    --esl-shadow-card:    0 2px 8px  rgba(0,0,0,0.30);
  }
}

/* ════════════════════════════════════
   BASE
   ════════════════════════════════════ */
html, body {
  background-color: var(--esl-bg-page);
  color:            var(--esl-text-primary);
  font-family:      'Inter', -apple-system, sans-serif;
  font-size:        14px;
  line-height:      1.6;
  -webkit-font-smoothing: antialiased;
}

/* Smooth mode switch */
*, *::before, *::after {
  transition-property: background-color, border-color, color, box-shadow;
  transition-duration: 200ms;
  transition-timing-function: ease;
}
[class*="animate-"], [class*="swiper-"], [style*="animation"] {
  transition-property: unset;
}
```

---

## 2. TAILWIND CONFIG

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content:  ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E8242C',
          dark:    '#C41E25',
          light:   '#FF4D53',
          bg:      'rgba(232,36,44,0.08)',
          border:  'rgba(232,36,44,0.25)',
        },
        footer:   '#0A0A0A',
        announce: '#1A1A1A',
        vip:      '#FFD700',
      },
      backgroundColor: {
        page:     'var(--esl-bg-page)',
        section:  'var(--esl-bg-section)',
        card:     'var(--esl-bg-card)',
        input:    'var(--esl-bg-input)',
        elevated: 'var(--esl-bg-elevated)',
      },
      textColor: {
        primary:   'var(--esl-text-primary)',
        secondary: 'var(--esl-text-secondary)',
        muted:     'var(--esl-text-muted)',
        disabled:  'var(--esl-text-disabled)',
      },
      borderColor: {
        DEFAULT: 'var(--esl-border)',
        strong:  'var(--esl-border-strong)',
        focus:   'var(--esl-border-focus)',
      },
      boxShadow: {
        card: 'var(--esl-shadow-card)',
        sm:   'var(--esl-shadow-sm)',
        md:   'var(--esl-shadow-md)',
        lg:   'var(--esl-shadow-lg)',
      },
    },
  },
}
export default config
```

---

## 3. THEME PROVIDER — Next.js

```tsx
// providers/ThemeProvider.tsx
'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme         = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeCtx {
  theme:         Theme
  resolvedTheme: ResolvedTheme
  setTheme:      (t: Theme) => void
  toggle:        () => void
}

const Ctx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,    setThemeState] = useState<Theme>('system')
  const [resolved, setResolved]   = useState<ResolvedTheme>('light')

  useEffect(() => {
    const saved = localStorage.getItem('esl-theme') as Theme | null
    if (saved) setThemeState(saved)
  }, [])

  useEffect(() => {
    const root = document.documentElement

    const apply = (t: ResolvedTheme) => {
      setResolved(t)
      root.setAttribute('data-theme', t)
      root.classList.toggle('dark', t === 'dark')
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches ? 'dark' : 'light')
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      apply(theme)
    }
  }, [theme])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('esl-theme', t)
  }

  const toggle = () => setTheme(resolved === 'light' ? 'dark' : 'light')

  return (
    <Ctx.Provider value={{ theme, resolvedTheme: resolved, setTheme, toggle }}>
      {children}
    </Ctx.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}

// Flash prevention — <head> дотор хамгийн эхэнд байна
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){
          var s=localStorage.getItem('esl-theme');
          var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
          var t=s==='dark'||((!s||s==='system')&&d)?'dark':'light';
          document.documentElement.setAttribute('data-theme',t);
          document.documentElement.classList.toggle('dark',t==='dark');
        })();`,
      }}
    />
  )
}
```

---

## 4. ROOT LAYOUT

```tsx
// app/layout.tsx
import { ThemeProvider, ThemeScript } from '@/providers/ThemeProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
        <ThemeScript />  {/* ← Заавал эхэнд — flash болохоос сэргийлнэ */}
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## 5. THEME TOGGLE COMPONENT — Web

```tsx
// components/ui/ThemeToggle.tsx
'use client'
import { useTheme } from '@/providers/ThemeProvider'

// Navbar-д — нарийн дугуй товч
export function ThemeToggle() {
  const { resolvedTheme, toggle } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button onClick={toggle}
      aria-label={isDark ? 'Өдрийн горим' : 'Шөнийн горим'}
      style={{
        width:          '36px', height: '36px',
        borderRadius:   'var(--esl-radius-full)',
        background:     'var(--esl-bg-input)',
        border:         '1px solid var(--esl-border)',
        cursor:         'pointer',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        color:          'var(--esl-text-primary)',
        flexShrink:     0,
      }}>
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1"  x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12"  x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}

// Settings хуудас, admin sidebar — 3 сонголт
export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {([
        { value: 'light',  label: '☀️ Өдөр'  },
        { value: 'dark',   label: '🌙 Шөнө'  },
        { value: 'system', label: '💻 Систем' },
      ] as const).map(opt => {
        const active = theme === opt.value
        return (
          <button key={opt.value} onClick={() => setTheme(opt.value)}
            style={{
              flex:         1,
              padding:      '6px 8px',
              borderRadius: 'var(--esl-radius-full)',
              fontSize:     '12px',
              fontWeight:   active ? 600 : 400,
              cursor:       'pointer',
              border:       active
                ? '1.5px solid var(--esl-brand)'
                : '1px solid var(--esl-border)',
              background:   active
                ? 'var(--esl-brand-bg)'
                : 'var(--esl-bg-input)',
              color:        active
                ? 'var(--esl-brand)'
                : 'var(--esl-text-secondary)',
              whiteSpace:   'nowrap',
            }}>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
```

---

## 6. NAVBAR + ADMIN SIDEBAR — var() ашигласан

```tsx
// components/layout/Navbar.tsx
export function Navbar() {
  return (
    <header style={{
      background:     'var(--esl-bg-navbar)',
      backdropFilter: 'blur(12px)',
      borderBottom:   '1px solid var(--esl-border)',
      position:       'sticky', top: 0, zIndex: 50,
    }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <Logo />
        <SearchBar />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle />   {/* ← энд байрлана */}
          <NavIcons />
        </div>
      </div>
    </header>
  )
}

// app/admin/layout.tsx — sidebar
export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--esl-bg-section)' }}>
      <aside style={{
        width:         '220px',
        background:    'var(--esl-bg-card)',
        borderRight:   '1px solid var(--esl-border)',
        flexShrink:    0,
        display:       'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--esl-border)' }}>
          <Logo />
        </div>
        <nav style={{ padding: '10px 8px', flex: 1 }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: 'var(--esl-radius-md)',
                  marginBottom: '2px',
                  background:  active ? 'var(--esl-brand-bg)' : 'transparent',
                  color:       active ? 'var(--esl-brand)' : 'var(--esl-text-secondary)',
                  borderLeft:  active
                    ? '2.5px solid var(--esl-brand)'
                    : '2.5px solid transparent',
                  fontWeight:  active ? 600 : 400,
                  fontSize:    '13px',
                }}>
                  <item.Icon size={15} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>
        {/* Sidebar доод — ThemeSelector */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--esl-border)' }}>
          <p style={{ fontSize: '10px', color: 'var(--esl-text-muted)', marginBottom: '8px',
            textTransform: 'uppercase', letterSpacing: '0.06em' }}>Горим</p>
          <ThemeSelector />
        </div>
      </aside>
      <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>{children}</main>
    </div>
  )
}
```

---

## 7. PRODUCT CARD — var() ашигласан

```tsx
// components/product/ProductCard.tsx
export function ProductCard({ product }) {
  return (
    <div style={{
      background:   'var(--esl-bg-card)',         /* горим солигдоно */
      border:       '1px solid var(--esl-border)',/* горим солигдоно */
      borderRadius: 'var(--esl-radius-lg)',
      overflow:     'hidden',
      cursor:       'pointer',
      boxShadow:    'var(--esl-shadow-card)',
    }}>
      {/* Image — горимоор дэвсгэр солигдоно */}
      <div style={{ position: 'relative', aspectRatio: '1',
        background: 'var(--esl-bg-section)' }}>
        <img src={product.images[0]} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* Badge — улаан, горим хамааргүй */}
        {product.discountPct && (
          <span style={{
            position: 'absolute', top: '8px', left: '8px',
            background: 'var(--esl-brand)', color: '#FFFFFF',
            fontSize: '11px', fontWeight: 700,
            padding: '2px 8px', borderRadius: 'var(--esl-radius-full)',
          }}>-{product.discountPct}%</span>
        )}

        {/* Wishlist */}
        <button style={{
          position: 'absolute', top: '8px', right: '8px',
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'var(--esl-bg-card)',
          border: '1px solid var(--esl-border)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <HeartIcon size={13} color="var(--esl-brand)" />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '12px' }}>
        <p style={{ fontSize: '11px', color: 'var(--esl-text-muted)', marginBottom: '4px' }}>
          {product.seller.name}
        </p>
        <h3 style={{ fontSize: '13px', fontWeight: 600,
          color: 'var(--esl-text-primary)', marginBottom: '6px', lineHeight: 1.4 }}>
          {product.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--esl-brand)' }}>
            {product.price.toLocaleString()}₮
          </span>
          {product.originalPrice && (
            <span style={{ fontSize: '12px', color: 'var(--esl-text-muted)',
              textDecoration: 'line-through' }}>
              {product.originalPrice.toLocaleString()}₮
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 8. REACT NATIVE — packages/ui/src/tokens.ts

```typescript
// packages/ui/src/tokens.ts
// Web CSS var-тай ИЖИ утгатай

import { useThemeStore } from '@/packages/store/themeStore'

// Brand — горим хамааргүй
export const brand = {
  primary: '#E8242C',
  dark:    '#C41E25',
  light:   '#FF4D53',
  bg:      'rgba(232,36,44,0.08)',
  border:  'rgba(232,36,44,0.25)',
} as const

// Always dark — горим хамааргүй
export const fixed = {
  footerBg:     '#0A0A0A',
  footerText:   '#E0E0E0',
  announceBg:   '#1A1A1A',
  announceText: '#E0E0E0',
  vip:          '#FFD700',
} as const

const light = {
  bgPage:       '#FFFFFF',
  bgSection:    '#F8F8F8',
  bgCard:       '#FFFFFF',
  bgInput:      '#F5F5F5',
  bgElevated:   '#FFFFFF',
  border:       '#E5E5E5',
  borderStrong: '#CCCCCC',
  textPrimary:  '#0A0A0A',
  textSecond:   '#555555',
  textMuted:    '#9CA3AF',
  textDisabled: '#D1D5DB',
  textInverse:  '#FFFFFF',
  success:      '#16A34A',
  successBg:    '#DCFCE7',
  warning:      '#D97706',
  warningBg:    '#FEF9C3',
  info:         '#2563EB',
  infoBg:       '#EFF6FF',
  danger:       '#DC2626',
  dangerBg:     '#FEE2E2',
  vipBg:        '#FEFCE8',
  featurePills: '#FFF9F0',
} as const

const dark = {
  bgPage:       '#0A0A0A',
  bgSection:    '#111111',
  bgCard:       '#1A1A1A',
  bgInput:      '#2A2A2A',
  bgElevated:   '#2A2A2A',
  border:       '#3D3D3D',
  borderStrong: '#555555',
  textPrimary:  '#FFFFFF',
  textSecond:   '#E0E0E0',
  textMuted:    '#A0A0A0',
  textDisabled: '#555555',
  textInverse:  '#0A0A0A',
  success:      '#4ADE80',
  successBg:    'rgba(34,197,94,0.12)',
  warning:      '#FBBF24',
  warningBg:    'rgba(245,158,11,0.12)',
  info:         '#60A5FA',
  infoBg:       'rgba(59,130,246,0.12)',
  danger:       '#F87171',
  dangerBg:     'rgba(220,38,38,0.12)',
  vipBg:        'rgba(255,215,0,0.12)',
  featurePills: '#111111',
} as const

export type ColorTokens = typeof light

// Hook — компонент дотор ашиглана
export function useColors(): ColorTokens {
  const { resolved } = useThemeStore()
  return resolved === 'dark' ? dark : light
}

// Static access — StyleSheet.create дотор
export function getColors(scheme: 'light' | 'dark'): ColorTokens {
  return scheme === 'dark' ? dark : light
}
```

---

## 9. REACT NATIVE — Theme Store

```typescript
// packages/store/themeStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'
import { Appearance } from 'react-native'

type ThemePref = 'light' | 'dark' | 'system'

interface ThemeStore {
  preference: ThemePref
  resolved:   'light' | 'dark'
  setTheme:   (p: ThemePref) => void
  toggle:     () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      preference: 'system',
      resolved:   Appearance.getColorScheme() ?? 'light',

      setTheme: (preference) => {
        const resolved = preference === 'system'
          ? (Appearance.getColorScheme() ?? 'light')
          : preference
        set({ preference, resolved })
      },

      toggle: () => {
        const next = get().resolved === 'light' ? 'dark' : 'light'
        set({ preference: next, resolved: next })
      },
    }),
    {
      name:    'esl-theme',
      storage: createJSONStorage(() => ({
        getItem:    SecureStore.getItemAsync,
        setItem:    SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      })),
    }
  )
)

// System preference listener
Appearance.addChangeListener(({ colorScheme }) => {
  const { preference } = useThemeStore.getState()
  if (preference === 'system') {
    useThemeStore.setState({ resolved: colorScheme ?? 'light' })
  }
})
```

---

## 10. REACT NATIVE — ThemeToggle + useColors жишээ

```tsx
// packages/ui/src/ThemeToggle.tsx
import { View, Text, TouchableOpacity } from 'react-native'
import { useThemeStore } from '@/packages/store/themeStore'
import { brand } from './tokens'

export function ThemeToggle() {
  const { resolved, toggle } = useThemeStore()
  const isDark = resolved === 'dark'
  return (
    <TouchableOpacity onPress={toggle} activeOpacity={0.7}
      style={{
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
        borderWidth: 1, borderColor: isDark ? '#3D3D3D' : '#E5E5E5',
        alignItems: 'center', justifyContent: 'center',
      }}>
      <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
    </TouchableOpacity>
  )
}

export function ThemeSelector() {
  const { preference, setTheme } = useThemeStore()
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {([
        { value: 'light',  label: '☀️ Өдөр'  },
        { value: 'dark',   label: '🌙 Шөнө'  },
        { value: 'system', label: '💻 Систем' },
      ] as const).map(opt => {
        const active = preference === opt.value
        return (
          <TouchableOpacity key={opt.value} onPress={() => setTheme(opt.value)}
            style={{
              flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center',
              backgroundColor: active ? brand.bg : 'transparent',
              borderWidth: active ? 1.5 : 1,
              borderColor: active ? brand.primary : '#3D3D3D',
            }}>
            <Text style={{ fontSize: 12, fontWeight: active ? '600' : '400',
              color: active ? brand.primary : '#A0A0A0' }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// ── useColors хэрэглэх загвар ──────────────────────
// import { useColors, brand, fixed } from '@/packages/ui/src/tokens'
//
// export function AnyScreen() {
//   const c = useColors()  // ← нэг мөр
//
//   return (
//     <View style={{ backgroundColor: c.bgPage }}>
//       {/* Hero — улаан, горим хамааргүй */}
//       <View style={{ backgroundColor: brand.primary }}>
//         <Text style={{ color: '#FFFFFF' }}>Нүүр хуудас</Text>
//       </View>
//
//       {/* Card — горимоор солигдоно */}
//       <View style={{ backgroundColor: c.bgCard, borderColor: c.border, borderWidth: 1 }}>
//         <Text style={{ color: c.textPrimary }}>Барааны нэр</Text>
//         <Text style={{ color: c.textMuted }}>Дэлгүүрийн нэр</Text>
//         <Text style={{ color: brand.primary }}>49,900₮</Text>
//       </View>
//
//       {/* Footer — горим хамааргүй */}
//       <View style={{ backgroundColor: fixed.footerBg }}>
//         <Text style={{ color: fixed.footerText }}>eseller.mn</Text>
//       </View>
//     </View>
//   )
// }
```

---

## 11. АУДИТ — HARDCODED ӨНГ ЗАСАХ

```bash
# Засах шаардлагатай hardcoded-уудыг ол
grep -rn "background.*#0A0A0A\|background.*#1A1A1A\|background.*#2A2A2A\|bg-\[#0A0A0A\]\|bg-\[#1A1A1A\]" \
  --include="*.tsx" --include="*.css" . \
  | grep -v "footer\|announce\|tokens\|globals"

grep -rn "background.*#FFFFFF\|background.*#F8F8F8\|bg-white\|bg-\[#FFFFFF\]" \
  --include="*.tsx" . \
  | grep -v "tokens\|globals\|hero\|brand"
```

### Орлуулах хүснэгт

```
WEB:
  background: #FFFFFF (page/card)  → var(--esl-bg-card) / var(--esl-bg-page)
  background: #0A0A0A (page) ←ЗАСАХ→ var(--esl-bg-page)
  background: #1A1A1A (card) ←ЗАСАХ→ var(--esl-bg-card)
  background: #2A2A2A (input)←ЗАСАХ→ var(--esl-bg-input)
  color: #0A0A0A              → var(--esl-text-primary)
  color: #555555              → var(--esl-text-secondary)
  color: #9CA3AF              → var(--esl-text-muted)
  border-color: #E5E5E5       → var(--esl-border)
  border-color: #3D3D3D ←ЗАСАХ→ var(--esl-border)

MOBILE:
  '#FFFFFF' (card/page)       → c.bgCard / c.bgPage
  '#0A0A0A' (card) ←ЗАСАХ    → c.bgCard
  '#1A1A1A' (card) ←ЗАСАХ    → c.bgCard
  '#2A2A2A' (input)←ЗАСАХ    → c.bgInput
  '#0A0A0A' (text)            → c.textPrimary
  '#E5E5E5' (border)          → c.border
  '#3D3D3D' (border)←ЗАСАХ   → c.border

ХЭЗЭЭ ЧИ ӨӨРЧЛӨХГҮЙ (hardcode OK):
  brand: #E8242C, #C41E25, #FF4D53
  footer bg: #0A0A0A · footer text: #E0E0E0
  announcement: #1A1A1A · #E0E0E0
  vip badge: #FFD700
  text on brand bg: #FFFFFF
```

---

## 12. ХЭРЭГЖИЛТИЙН ДАРААЛАЛ

```
── WEB ─────────────────────────────────────────
[ ] globals.css — :root + [data-theme="dark"] + @media
[ ] tailwind.config.ts
[ ] ThemeProvider + ThemeScript үүсгэх
[ ] app/layout.tsx — ThemeProvider + ThemeScript нэмэх
[ ] ThemeToggle + ThemeSelector component
[ ] Navbar — var() + ThemeToggle нэмэх
[ ] Admin sidebar — var() + ThemeSelector нэмэх
[ ] Компонентуудыг аудитлах:
    [ ] ProductCard
    [ ] SectionHeader
    [ ] HeroBanner       (улаан хэвээр)
    [ ] FeaturePills
    [ ] AnnouncementBar  (хар хэвээр)
    [ ] Modal, Form, Input
    [ ] Admin table, stat cards
[ ] /settings — ThemeSelector нэмэх

── MOBILE ──────────────────────────────────────
[ ] packages/ui/src/tokens.ts — light/dark объект
[ ] packages/store/themeStore.ts
[ ] ThemeToggle + ThemeSelector RN component
[ ] Бүх screen-д useColors() hook
[ ] Settings screen — ThemeSelector нэмэх
[ ] app/_layout.tsx — StatusBar горимоор

── QA ──────────────────────────────────────────
[ ] Web: light → dark → system switch
[ ] Web: page reload — flash байхгүй (ThemeScript)
[ ] Mobile: toggle < 100ms
[ ] Mobile: system preference дагана
[ ] Mobile: restart-д preference хадгалагдана
[ ] Брэнд #E8242C хоёр горимд ижил
[ ] Footer #0A0A0A хоёр горимд ижил
[ ] Announcement #1A1A1A хоёр горимд ижил
[ ] Бүх text contrast ratio ≥ 4.5:1
```
