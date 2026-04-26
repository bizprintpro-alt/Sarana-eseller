# ESELLER.MN — SYSTEM AUDIT (2026-04-21)

> Бүрэн ecosystem-ийн жагсаалт. ChatGPT-д танилцуулах зорилгоор бэлтгэгдсэн.

---

## 🌐 АРХИТЕКТУР

```
Mobile App (React Native + Expo)
   ↓
eseller.mn (Next.js 15 — Vercel)
   ↓ Prisma
MongoDB Atlas + sarana-backend (Express, Render — QPay callback)
```

---

## 📄 1. WEB PAGES (eseller.mn)

### Public хуудсууд (12)
| Path | Зорилго |
|------|---------|
| `/` | Нүүр хуудас (slider, banners, бараанууд) |
| `/about` | Бидний тухай |
| `/help` | Тусламж/FAQ |
| `/contact` | Холбоо барих |
| `/privacy` | Нууцлалын бодлого |
| `/terms` | Үйлчилгээний нөхцөл |
| `/shops` | Дэлгүүрүүдийн жагсаалт |
| `/search` | Глобал хайлт |
| `/store` | Marketplace |
| `/compare` | Бараа харьцуулах |
| `/tenders` | Засгийн газрын тендер |
| `/[slug]` | Generic slug handler |

### Auth (4)
- `/login`, `/register`, `/forgot-password`, `/reset-password/[token]`

### Customer (15)
- `/cart`, `/checkout`, `/orders`, `/orders/[id]`, `/review/[orderId]`, `/receipt/[id]`
- `/product/[id]` — бараа дэлгэрэнгүй
- `/chat/[shopSlug]` — чат
- `/s/[shopSlug]` — дэлгүүрийн storefront
- `/shop/[id]` — дэлгүүрийн profile
- `/seller/[username]` — affiliate profile
- `/u/[username]` — хэрэглэгчийн profile
- `/entity/[entityType]/[slug]` — multi-entity
- `/feed`, `/feed/[id]`, `/feed/post`
- `/social`, `/live`, `/live/[id]`

### Loyalty & Membership (3)
- `/gold`, `/bank-loyalty`, `/achievements`

### Multi-vertical (3)
- `/herder`, `/herder/[province]`
- `/bnpl`, `/become-driver`, `/become-seller`, `/corporate-order`, `/open-shop`

### Dashboard — Buyer (7)
- `/dashboard`, `/dashboard/settings`, `/dashboard/addresses`
- `/dashboard/orders`, `/dashboard/wishlist`, `/dashboard/chat`

### Dashboard — Store Owner (60+)
**Гол:** `/dashboard/store`, `/products`, `/orders`, `/customers`, `/analytics`, `/reviews`, `/settings`, `/wallet`, `/revenue`, `/commissions`

**AI:** `/ai-analytics`, `/ai-description`, `/ai-logo`, `/ai-poster`

**Marketing:** `/campaigns`, `/promotions`, `/promo-codes`, `/promote`

**Operations:** `/inventory`, `/branches`, `/working-hours`, `/locations`, `/staff`, `/team`

**Storefront:** `/storefront-config`, `/storefront-editor`, `/themes`, `/gallery`, `/blog`

**Vertical-тусгай:** `/services`, `/bookings`, `/appointments`, `/vehicles` (auto), `/test-drives`, `/projects` (construction), `/batches` (pre-order), `/dropship`

**Бусад:** `/queue`, `/calendar`, `/giftcards`, `/inquiries`, `/waitlist`, `/licenses`, `/documents`, `/integrations`

### Dashboard — Affiliate/Seller (10)
- `/dashboard/seller`, `/products`, `/earnings`, `/commissions`
- `/dashboard/affiliate`, `/marketing`, `/wallet`, `/verify`, `/influencer-apply`
- `/dashboard/seller/live`, `/live/create`, `/enterprise`, `/team`

### Dashboard — Driver (4)
- `/dashboard/delivery`, `/active`, `/history`, `/earnings`

### Dashboard — Admin (40+)
**Хяналт:** `/admin/users`, `/shops`, `/sellers`, `/entities`, `/products`, `/orders`, `/categories`

**Санхүү:** `/revenue`, `/commission`, `/commission-rules`, `/disputes`, `/returns`

**Контент:** `/banners`, `/announcements`, `/homepage`, `/influencers`, `/partners`, `/enterprise`, `/tenders`

**Бизнес:** `/analytics-dashboard`, `/kpi`, `/stats`, `/vat-monitor`, `/locations`, `/live-plans`

**Систем:** `/config`, `/site-settings`, `/system-settings`, `/system-rules`, `/maintenance`, `/logs`, `/ai`

---

## 🔌 2. API ENDPOINTS (300+)

### Authentication
- `/auth/login`, `/register`, `/logout`, `/otp/send`, `/otp/verify`, `/forgot-password`, `/reset-password`
- `/auth/google`, `/dan` (Mongol DAN ID), callback

### Products & Search
- `/products` (GET/POST), `/products/[id]` (full CRUD)
- `/products/[id]/reviews`, `/related`, `/wholesale`, `/addons`, `/modifiers`
- `/products/bulk-upload`
- `/search`, `/search/suggest`, `/categories/tree`, `/categories/request`

### Orders & Checkout
- `/checkout/create-invoice`, `/apply-coupon`, `/check-payment/[invoiceId]`
- `/orders/[id]/status`, `/confirm`, `/return`, `/assign-driver`, `/receipt`
- `/orders/pos`, `/pos/history`, `/pos/refund`, `/pos/void`
- `/buyer/orders`, `/buyer/orders/[id]`

### Payment
- `/payment/qpay/create`, `/check`, `/callback`
- `/payment/socialpay`, `/callback`

### Wallet & Loyalty
- `/wallet`, `/wallet/topup`, `/payout`, `/transactions`
- `/loyalty/[userId]`, `/earn`, `/redeem`, `/redeem-cash`
- `/achievements`, `/streak`, `/seed`
- `/gold/plans`, `/subscribe`, `/trial`, `/status`, `/cancel`
- `/bank/loyalty/balance`, `/convert`

### Live Commerce
- `/live` (GET/POST), `/live/[id]`, `/messages`, `/products`, `/purchase`, `/end`
- `/live/subscribe`

### Social & Feed
- `/social/posts/[id]/like`, `/comment`, `/social/feed`, `/trending`
- `/feed`, `/feed/nearby`
- `/stories`, `/stories/[id]/view`

### Chat
- `/chat/conversations`, `/[id]`, `/messages`
- `/chat/message`, `/unread`, `/bot`, `/widget/[entityId]`

### Seller Tools
- `/seller/my-stores`, `/products`, `/orders`, `/locations`, `/conversations`
- `/seller/verify`, `/analytics`, `/storefront`, `/subscription`, `/staff`, `/campaigns`
- `/seller/influencer-apply`, `/request-product`

### Affiliate
- `/affiliate/start`, `/links`, `/track`, `/earnings`, `/commissions`

### Store Management
- `/store/check-slug`, `/settings`, `/storefront`, `/categories`, `/sellers`
- `/store/products/boost`, `/domain/verify`, `/commissions`
- `/shop/[shopId]/domain`, `/type`, `/working-hours`
- `/stores`, `/stores/nearby`, `/shop-domain-lookup`

### Driver
- `/driver/orders`, `/[id]/accept`, `/deliver`, `/driver/revenue`

### Special Programs
- `/dropship/search`, `/import`, `/sync`, `/fulfill`
- `/pre-order`, `/order`, `/batch`
- `/group-buy`, `/[id]/join`
- `/bnpl/apply`, `/[id]/approve`, `/payments`
- `/quick-order`, `/callback`
- `/referral/generate`, `/apply`
- `/herder/register`, `/products`

### Misc
- `/coupons/validate`, `/promotions`
- `/reviews` (GET/POST), `/[id]/reply`
- `/wishlist`, `/wishlist/[productId]`
- `/banners/[slot]`, `/banners/[id]/click`
- `/tracking/[code]`, `/[code]/location`
- `/digital/upload`, `/[productId]/download`
- `/bookings`, `/[id]/status`
- `/services` (CRUD)
- `/provinces`, `/[code]/agent`
- `/upload`, `/share`, `/unsubscribe`, `/push/register`
- `/maintenance-status`, `/homepage/config`, `/marketplace`
- `/escrow/confirm`, `/webhooks/qpay`, `/resend`

### Admin (50+)
- User/shop/category management, commission rules, AI insights
- Banner/announcement/homepage CMS
- Analytics, KPI, VAT monitor
- Disputes, returns, campaigns, influencers, partners, enterprise

### AI & Automation
- `/ai/product-description`, `/shop`, `/generate-storefront`, `/storefront-suggest`, `/suggest-category`
- `/automations`, `/[id]`, `/[id]/toggle`

### Cron Jobs
- `/cron/live-start`, `/escrow-release`, `/loyalty`, `/vat-check`, `/banners`
- `/cron/check-locations`, `/inventory-check`, `/points-birthday`, `/ai-analysis`

### Maps
- `/maps/geocode`, `/reverse`, `/places`, `/place-details`

---

## 📱 3. MOBILE SCREENS (eseller-mobile)

### Auth — `(auth)`
- `login`, `register`, `otp`, `forgot-password`

### Tabs — `(tabs)` (role-аар динамик)
- `index`, `search`, `feed`, `social`, `chat`, `store`, `gold`
- `notifications`, `orders`, `profile`, `action`

### Customer — `(customer)` (35+)
- `about`, `achievements`, `addresses`, `ai-shopper`
- `become-driver`, `become-herder`, `become-seller`, `bnpl`
- `compare`, `contact`, `corporate-order`, `coupons`, `create-post`
- `dropship`, `edit-profile`, `flash-sale`, `help`
- `herder`, `herder-product/[id]`, `herder-profile/[id]`, `herder-review/[orderId]`
- `live`, `live/[id]`
- `legal/privacy`, `legal/terms`
- `notification-settings`, `register-herder`, `register-shop`
- `returns`, `security`, `shops`, `tenders`, `tier-details`
- `wallet`, `wishlist`

### Owner — `(owner)`
- `dashboard`, `analytics`, `orders`, `products`, `pos`, `pos-history`
- `create-coupon`, `profile`, `settings`

### Affiliate — `(seller)`
- `dashboard`, `catalog`, `products`, `earnings`, `commissions`
- `influencer`, `leaderboard`, `profile`, `referral`

### Driver — `(driver)`
- `deliveries`, `delivery-detail`, `earnings`, `profile`

### Herder — `(herder)`
- `dashboard`, `listings`, `listing-form`, `orders`, `order/[id]`, `earnings`

### Coordinator — `(coordinator)`
- `dashboard`, `applications`, `application/[id]`, `herders`

### Standalone
- `cart`, `checkout`, `chat/[id]`, `chat/ai-support`
- `entity/[type]`, `product/index`, `order/index`, `review/index`, `receipt/[id]`
- `seller/index`, `storefront/index`, `track/[code]`, `u/[username]`

---

## 🎯 4. KEY FEATURES BY DOMAIN

### E-Commerce Core
- Product catalog (search, filter, category), Cart, Checkout
- Order lifecycle (place → confirm → ship → deliver → review)
- Inventory/stock, reviews, wishlist
- Bulk upload (CSV/Excel)

### Social Commerce
- Feed (text/image), Like/comment/share, Following
- Stories (24h), Trending, Quick Order, Group Buy
- Product tagging in social posts

### Live Commerce
- Live streaming (shop/seller/product scope)
- Multi-platform (YouTube, Facebook, Mux)
- Live chat, flash pricing, viewer count
- Plan-gated (BASIC/STANDARD/PRO/ENTERPRISE)

### Logistics & Delivery
- Real-time order tracking + driver coordinates
- Driver assignment, multi-carrier
- Province delivery fees, same-day/express
- POS for in-store, driver earnings/payout

### Payment & Wallet
- QPay, SocialPay, Card, Cash on Delivery
- Wallet/prepaid, Bank payout
- Escrow (buyer confirms before release)
- eBarimt tax receipt

### Loyalty & Gamification
- Points per purchase/review/referral
- Tiers (Bronze/Silver/Gold/Platinum)
- Daily streak, 20+ achievement badges
- Birthday bonus, Bank points conversion (Khan/Golomt/TDB)

### Multi-Vertical
1. **Product Marketplace** — general
2. **Real Estate** — sqm, rooms, floors
3. **Auto Dealer** — mileage, fuel, transmission
4. **Service Provider** — bookings, appointments
5. **Construction** — projects, unit pricing
6. **Pre-Order** — international/batch
7. **Digital Products** — downloads with license
8. **Herder** (Малчны булан) — direct M2C
9. **Tender** (B2G) — government procurement

### Special Programs
- **Dropshipping** — AliExpress/CJ/1688
- **BNPL** — 3/6/12 month plans (bank partners)
- **Affiliate** — 10-30% commission
- **Influencer Tiers** — Micro/Influencer/Mega
- **Enterprise** — multi-user, white-label, custom domain

### Enterprise Features
- Multi-user team (Owner/Manager/Warehouse/Accountant)
- Custom domain + subdomain (`*.eseller.mn`)
- Advanced analytics, custom commissions
- VAT compliance, eBarimt
- API integrations (CSV/XML/JSON)
- AI-powered storefront builder
- Staff PIN/POS

---

## 💰 5. REVENUE STREAMS (12)

1. Commission fees (2-30%)
2. Subscription plans (Free/Standard/Ultimate/AI Pro)
3. Banner advertising
4. Live streaming plans (4 tier)
5. Featured listings (VIP)
6. Promotion/boost (per-day)
7. API/Feed integration fees
8. White-label enterprise
9. Affiliate commission splits
10. Wallet top-up fees
11. Partner company fees (real estate)
12. Domain registration markup

---

## 🗄️ 6. DATABASE MODELS (150+)

### User & Auth
`User`, `PasswordResetToken`, `SellerProfile`, `Staff`

### Products
`Product`, `Category`, `CategoryRequest`, `ModifierGroup`, `ModifierOption`, `AddOn`
`Review`, `WholesalePrice`, `WishlistItem`, `DigitalProduct`, `DigitalDownload`

### Orders & Money
`Order`, `OrderEvent`, `OrderAnalytics`, `SellerCommission`, `PaymentTransaction`
`TaxReceipt`, `Wallet`, `EscrowTransaction`, `ReturnRequest`, `Coupon`, `CouponUsage`, `Promotion`

### Shopping
`BNPLApplication`, `BNPLPayment`, `PreOrderProduct`, `PreOrderItem`, `PreOrderBatch`, `QuickOrder`

### Store
`Shop`, `ShopType`, `ShopDomain`, `ShopSubscription`, `StoreIntegration`, `StoreLocation`, `ImportedUrl`

### Services
`Service`, `Booking`, `WorkingHours`

### Live
`LiveStream`, `LiveProduct`, `LiveMessage`

### Social
`SocialPost`, `SocialPostProduct`, `SocialLike`, `SocialComment`, `Story`
`GroupBuy`, `GroupBuyMember`, `Referral`

### Messaging
`Conversation`, `Message`, `FeedbackTicket`

### Loyalty
`LoyaltyAccount`, `LoyaltyTransaction`, `LoyaltyRedemption`
`GoldMembership`, `MembershipPayment`, `BankLoyaltyTransaction`
`DailyStreak`, `Achievement`, `UserAchievement`

### Marketing
`Campaign`, `CampaignSend`, `CampaignEvent`
`AutomationFlow`, `AutoStep`, `AutoRun`
`Segment`, `SegmentMember`, `MarketingOptOut`
`ScheduledNotification`, `PushSubscription`

### Content
`Banner`, `BannerSlot`, `BannerBooking`, `BannerPlan`, `BannerAnalytic`
`Announcement`, `EntityMedia`, `HeroBanner`, `FeaturedProduct`, `FeaturedShop`
`HomepageSection`, `HomepageConfig`, `EmailTemplate`, `ThemeTemplate`, `SellerStorefront`

### Multi-Entity
`Agent` (real estate), `Company`, `AutoDealer`, `ServiceProvider`
`FeedItem`, `ProvinceAgent`, `Province`

### Advanced
`Dispute`, `Dropship`, `DropshipOrder`
`GovernmentTender`, `TenderBid`, `HerderShop`
`Warehouse`, `InventoryItem`, `StockMovement`

### Partner & Affiliate
`PartnerCompany`, `PartnerAgent`, `PartnerCommission`, `PartnerInvoice`
`InfluencerApplication`, `AffiliateLink`, `AffiliateConversion`

### Network (MLM)
`NetworkBusiness`, `NetworkMember`, `NetworkCommission`

### Enterprise & Admin
`EnterpriseShop`, `EnterpriseUser`, `EnterpriseInvite`
`AdminLog`, `SystemSettings`, `PlatformConfig`, `PlatformRevenue`
`Commission`, `MarketingCampaign`, `AffiliateClick`

### AI & Analytics
`AiInsight`, `AiTask`, `AiActivityLog`, `UserBehaviorPattern`, `NpsSurvey`

---

## 🔌 7. INTEGRATIONS

| Категори | Үйлчилгээ |
|----------|-----------|
| **Payment** | QPay, SocialPay, Bank cards, Cash on delivery |
| **Banking** | Khan Bank, Golomt, TDB, HAS, ARIG (BNPL + loyalty) |
| **Maps** | Google Maps (geocode, places) |
| **Email** | Resend |
| **Push** | OneSignal (web), Expo (mobile) |
| **Dropship** | AliExpress, CJ Dropshipping, 1688 |
| **Live** | YouTube, Facebook, Mux |
| **AI** | OpenAI/Claude (description, insights) |
| **OAuth** | Google, DAN (Монгол ID) |
| **CDN** | Cloudinary |
| **Monitoring** | Sentry |

---

## 📊 8. SCALE INDICATORS

- 65+ database collections
- 300+ API endpoints
- 40+ mobile screens
- 80+ dashboard pages
- 9 vertical business models
- 12 revenue streams
- 4 user roles + sub-roles (cashier, manager, etc)
- Multi-language (Mongolian + English)
- VAT/tax compliance + eBarimt
- Enterprise-grade (team, white-label, API)

---

## 🎯 ОДОО (2026-04-21)

### ✅ Бэлэн
- 100+ API endpoint ажиллаж байна
- 4 ролийн бүртгэл (auto-profile тус бүрд)
- POS terminal full flow
- Live commerce + chat
- QPay integration
- Privacy/Terms (mn)
- Sentry (Vercel + Mobile)
- SEO (sitemap, robots, metadata, verification env)

### 🚀 Beta launch
- **Хугацаа:** 2026-04-21 → 2026-05-05
- **APK:** `eaf83e9e-baef-42fe-a3a7-5b4802269bd5`
- **Document:** `BETA_INVITE.md`

### 📅 Дараа
- Public launch — Q3 2026
- Play Store production track
- iOS launch — Q4 2026
- B2B procurement portal — 2027

---

## 🔗 Resources

- **Web:** https://eseller.mn
- **Backend repo:** github.com/bizprintpro-alt/Sarana-eseller
- **Mobile repo:** github.com/bizprintpro-alt/eseller-mobile
- **Vercel:** vercel.com/biz6/sarana-eseller
- **Render:** render.com → sarana-backend
- **EAS:** expo.dev/accounts/eseller.mn/projects/eseller-mn

---

*Last updated: 2026-04-21*
