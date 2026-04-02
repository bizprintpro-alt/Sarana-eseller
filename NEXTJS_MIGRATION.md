# eseller.mn — Next.js Migration Guide

## Current Stack
- Frontend: Vanilla HTML/CSS/JS (11 pages, 37 files)
- Backend: Node.js + Express + MongoDB (Render.com)
- API: https://sarana-backend.onrender.com/api
- Repo: https://github.com/bizprintpro-alt/Sarana-eseller

## Target Stack
- Next.js 15 + TypeScript
- Tailwind CSS v4
- Shadcn/ui components
- Framer Motion animations
- Vercel deploy

## Design Tokens (from css/variables.css)
```
Colors:
  brand: #CC0000 (--p), #A30000 (--pd), #FFF0F0 (--pl)
  success: #059669, warning: #D97706, error: #DC2626, info: #0891B2
  dark: #0F172A (dashboard bg), #111527 (sidebar), #161B2E (cards)
  accent: #6366F1 (indigo - dashboard active)

Typography:
  body: Inter
  headings: Montserrat
  mono: JetBrains Mono

Spacing: 8px grid (4,8,12,16,20,24,32,40,48,64,80,96)
Radius: 6,8,12,16,20,24,9999px
```

## Pages to Migrate
1. Landing (index.html) → app/page.tsx
2. Login/Register (login.html) → app/login/page.tsx
3. Storefront (storefront.html) → app/store/page.tsx
4. Product Detail (product-detail.html) → app/store/[id]/page.tsx
5. Checkout (checkout.html) → app/checkout/page.tsx
6. Buyer Dashboard (dashboard.html) → app/dashboard/page.tsx
7. Seller Dashboard (seller.html) → app/dashboard/seller/page.tsx
8. Admin Dashboard (admin.html) → app/dashboard/admin/page.tsx
9. Affiliate Dashboard (affiliate.html) → app/dashboard/affiliate/page.tsx
10. Delivery Dashboard (delivery.html) → app/dashboard/delivery/page.tsx
11. Creator Profile (creator.html) → app/u/[username]/page.tsx

## API Endpoints (23 total)
### Auth
- POST /auth/register
- POST /auth/login
- GET /auth/me

### Products
- GET /products (list, search, filter)
- GET /products/:id
- POST /products (seller/admin)
- PUT /products/:id
- DELETE /products/:id
- POST /products/upload (Cloudinary)

### Orders
- GET /orders
- POST /orders (auto referral tracking)
- PUT /orders/:id/status

### Payment
- POST /payment/qpay/create
- GET /payment/qpay/check/:invoiceId
- POST /payment/qpay/callback (webhook)

### Affiliate
- GET /affiliate/links
- GET /affiliate/earnings
- POST /affiliate/link
- POST /affiliate/click
- GET /affiliate/profile/:username
- PUT /affiliate/profile

### Wallet
- GET /wallet
- POST /wallet/withdraw

### Admin
- GET /admin/stats
- GET /admin/users
- GET/PUT /admin/commission
- GET/PUT /admin/commission/categories

### Notifications
- GET /notifications/stream (SSE)

## Key Features to Preserve
1. Referral tracking (Ref module - cookie 30d + sessionStorage)
2. Cart (localStorage)
3. Dark dashboard theme (Valex-inspired)
4. Glassmorphism effects
5. Animated counters + sparklines
6. AI Coach chatbot (affiliate)
7. Marketing Toolkit (QR, poster, social content)
8. Learning system (8 courses)
9. Commission calculator/simulator
10. Predictive analytics
11. User behavior analytics
12. Collapsible sidebar with glow

## Dashboard Theme Colors
- Background: #0F172A
- Sidebar: #111527
- Cards: #161B2E
- Stat Card gradients:
  - Indigo: #6366F1 → #4338CA
  - Pink: #EC4899 → #DB2777
  - Green: #10B981 → #059669
  - Amber: #F59E0B → #D97706
- Active accent: #6366F1
- Text: white 80%/50%/35%
- Borders: white 6%

## Suggested Next.js Structure
```
app/
├── page.tsx                    (landing)
├── login/page.tsx              (auth)
├── store/
│   ├── page.tsx                (storefront)
│   └── [id]/page.tsx           (product detail)
├── checkout/page.tsx
├── u/[username]/page.tsx       (creator profile)
├── dashboard/
│   ├── layout.tsx              (shared sidebar + dark theme)
│   ├── page.tsx                (buyer dashboard)
│   ├── seller/page.tsx
│   ├── admin/page.tsx
│   ├── affiliate/page.tsx
│   └── delivery/page.tsx
├── layout.tsx                  (root layout)
└── globals.css

components/
├── ui/                         (shadcn components)
├── dashboard/
│   ├── Sidebar.tsx
│   ├── StatCard.tsx
│   ├── Sparkline.tsx
│   ├── AnimatedCounter.tsx
│   └── EmptyState.tsx
├── store/
│   ├── ProductCard.tsx
│   ├── CartDrawer.tsx
│   └── CategoryBar.tsx
├── ai/
│   ├── AICoach.tsx
│   └── AIChatbot.tsx
└── shared/
    ├── Navbar.tsx
    ├── Footer.tsx
    └── MobileNav.tsx

lib/
├── api.ts                      (API client)
├── auth.ts                     (Auth context)
├── cart.ts                     (Cart store - zustand)
├── ref.ts                      (Referral tracking)
└── utils.ts                    (formatPrice, etc.)

hooks/
├── useAuth.ts
├── useCart.ts
├── useProducts.ts
└── useOrders.ts
```
