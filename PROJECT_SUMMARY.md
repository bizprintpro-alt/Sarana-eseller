# eseller.mn — Project Summary

## Танилцуулга

**eseller.mn** — Монголын нэгдсэн e-commerce + marketplace платформ. Buyer, Seller, Driver, Affiliate гэсэн **4 ролийг нэг апп дотор** нэгтгэсэн.

**Зорилго:** 2026 оны Q2-д бета launch, Q3-д public launch.

---

## Архитектур

```
┌──────────────────────────────────────────┐
│ Mobile App (React Native + Expo Router)  │
│ - 4 role: Buyer / Store / Driver / Seller│
│ - POS terminal (landscape)               │
│ - Live commerce, social feed             │
└────────────┬─────────────────────────────┘
             │ HTTPS
             ▼
┌──────────────────────────────────────────┐
│ eseller.mn (Next.js 15 — Vercel)         │
│ - Web frontend + API routes              │
│ - Server actions, ISR                    │
│ - 100+ API endpoints                     │
└────────────┬─────────────────────────────┘
             │ Prisma
             ▼
┌──────────────────────────────────────────┐
│ MongoDB Atlas (Cluster0)                 │
│ + sarana-backend (Express, Render)       │
│   - QPay callback, legacy endpoints      │
└──────────────────────────────────────────┘
```

---

## Tech Stack

### Mobile (`eseller-mobile`)
- **Framework:** React Native + Expo SDK 53
- **Routing:** Expo Router (file-based)
- **State:** Zustand + TanStack Query
- **Storage:** AsyncStorage + SecureStore
- **Build:** EAS Build
- **Monitoring:** Sentry

### Backend (`Sarana-eseller/nextjs/`)
- **Framework:** Next.js 15 (App Router)
- **Auth:** JWT + bcrypt
- **DB:** Prisma + MongoDB
- **Payment:** QPay, SocialPay
- **CDN:** Cloudinary
- **Hosting:** Vercel (web), Render (Express backup)
- **Monitoring:** Sentry

---

## Гол функцууд

### Buyer
- ✅ Бараа хайх, сагс, checkout
- ✅ QPay/cash төлбөр
- ✅ Live commerce stream дотор худалдан авах
- ✅ Social feed (Instagram-style)
- ✅ Wallet, loyalty points
- ✅ BNPL (Buy Now Pay Later)
- ✅ Wishlist, comparison

### Store / Seller
- ✅ Бараа CRUD, түүх
- ✅ Захиалга management
- ✅ POS terminal (landscape mode, cash/QPay/card)
- ✅ Analytics dashboard
- ✅ Live streaming (commerce)
- ✅ Storefront subdomain (`shop.eseller.mn`)
- ✅ Sentinel (multi-staff support)

### Driver
- ✅ Захиалга accept/deliver
- ✅ Earnings tracker
- ✅ License + vehicle registration

### Affiliate (Борлуулагч)
- ✅ Бараа share хийж комисс авах
- ✅ Leaderboard
- ✅ SellerProfile (auto-created)
- ✅ Commission system (10%+)

### Special verticals
- **Малчны булан** — нийлүүлэгчид шууд хэрэглэгчид рүү
- **Dropship** — AliExpress, CJ Dropshipping import
- **Pre-order** — гадаад захиалга
- **Real estate** — үл хөдлөх агентууд
- **Auto** — машин зар
- **Construction** — барилгын компани

---

## Одоогийн төлөв байдал

### ✅ Бэлэн (Production-ready)
- 7+ entity type registration & profile
- POS terminal full flow
- Live commerce with chat
- QPay integration
- Privacy/Terms (Mongolian)
- Sentry monitoring (Vercel + Mobile)
- SEO (sitemap, robots, metadata)
- Onboarding for 4 roles
- API endpoints — 100+

### ⚠️ Хязгаарлалт
- EAS free tier build лимит (May 1 хүртэл)
- Sentry mobile native module шинэ build хүлээж байна
- Driver profile schema model дутуу (одоохондоо User.role-аар)

### 🚀 Beta launch
- **Хугацаа:** 2026-04-21 → 2026-05-05
- **Beta document:** `BETA_INVITE.md` репо дотор
- **APK:** https://expo.dev/accounts/eseller.mn/projects/eseller-mn/builds/eaf83e9e-baef-42fe-a3a7-5b4802269bd5

---

## Сүүлийн өдрүүдийн засвар (commits)

1. **`45ff616`** — `/api/entities/register` upsert + 6 critical seller bugs
2. **`3f9cabd`** — BETA_INVITE.md
3. **`3f388f3`** — Empty states + CTAs + related products fallback
4. **`585ed4b`** — Navigation + sitemap polish
5. **`c1b0000`** — 5 critical UX fixes (banners, services, login redirect, test shops, image fallback)
6. **`ac7983e`** — Footer logo + Navbar scroll-to-top
7. **`17378c8`** — SEO verification env support

---

## Зах зээлд гарахаас өмнөх ажил

### Долоо хоног 1 (өнөөдөр - 5 хоног)
- [x] Sentry холбох
- [x] Privacy/Terms бэлтгэх
- [ ] **Google Search Console verify + sitemap submit**
- [ ] **Bing Webmaster setup**
- [ ] End-to-end тест (4 role)
- [ ] Beta хэрэглэгчдийг урих (10-20)

### Долоо хоног 2
- [ ] Beta feedback цуглуулах + засах
- [ ] Performance audit
- [ ] Marketing material (Play Store)
- [ ] Press kit

### Долоо хоног 3+
- [ ] Public launch
- [ ] Play Store production track
- [ ] Marketing campaign

---

## Зорилт

**Q2 2026:**
- 1,000+ active buyers
- 100+ verified shops
- 50+ drivers
- 20+ live commerce sessions/week

**Q3 2026:**
- 10,000+ buyers
- 500+ shops
- iOS launch
- Mongolian DAN SSO интеграц

**Q4 2026:**
- B2B procurement portal
- Tender system
- Enterprise tier (50+ stores)

---

## Чухал линкүүд

- **Web:** https://eseller.mn
- **Backend repo:** github.com/bizprintpro-alt/Sarana-eseller
- **Mobile repo:** github.com/bizprintpro-alt/eseller-mobile
- **Vercel:** vercel.com/biz6/sarana-eseller
- **Render:** render.com → sarana-backend
- **EAS:** expo.dev/accounts/eseller.mn/projects/eseller-mn

---

## ChatGPT-д тусламж хүсэх боломжтой сэдвүүд

1. SEO стратеги, keyword research
2. Content marketing planner (blog, landing pages)
3. Email/SMS campaign template
4. Pricing strategy (Gold subscription, ads)
5. Launch PR + media kit
6. Investor pitch deck
7. UX research framework (beta feedback analysis)
8. Translation полиш (English landing page)

---

*Дэлгэрэнгүйг асуухад тус болохдоо баяртай байна.*
