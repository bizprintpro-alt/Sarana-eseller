# 🎯 NEGD SUPERAPP — STRATEGIC AUDIT

> **Senior Product Strategist + Marketplace Architect + Fintech Expert + Startup CTO** үүргээр гүйцэтгэсэн бүрэн стратегийн аудит.
>
> Хариултууд нь шийдвэр гаргах түвшний нарийвчлалтай, executable план юм.

---

# 📌 1. ХАМГИЙН ЗӨВ POSITIONING

## ❌ Бүү байр

| Бүү positioning | Шалтгаан |
|----------------|---------|
| "Монголын Amazon" | Amazon-ийг 10-30 жил хийсэн. Хэрэглэгч итгэхгүй. |
| "Монголын Shopify" | Shopify зөвхөн store builder. Single-side. |
| "Монголын super app" | Олон гэдэг үг — хэрэглэгчид confused |
| "All-in-one marketplace" | Vague. Differentiate болохгүй. |

## ✅ Зөв positioning

> # **"Mongolia's Commerce Operating System"**
> 
> Стандарт хэлбэр: **"Stripe + Shopify + Wolt-ийн Монгол хувилбар — нэг infrastructure"**

### Яагаад "Operating System"?

| Шалтгаан | Тайлбар |
|----------|---------|
| **Тoo-sided OS** | Backend (Stripe-like) + Frontend (consumer apps) |
| **Modular** | Bizprint.mn, eSeller.mn, ирээдүйн төсөл бүгд тэжээгдэнэ |
| **Local-first** | DAN, eBarimt, QPay native — outsider copy хийхэд хэцүү |
| **Composable** | Хэрэглэгчид өөрсдөө app болгож авч хэрэглэх боломж |

### 3 түвшинт positioning

```
┌──────────────────────────────────────────┐
│ Layer 3: CONSUMER APPS                   │  ← Худалдан авагч хардаг
│  - eseller.mn (marketplace)              │
│  - bizprint.mn (B2B)                     │
│  - eseller-mobile (4 role app)           │
├──────────────────────────────────────────┤
│ Layer 2: BUSINESS APIs                   │  ← Дэлгүүр, агент, fintech ашигладаг
│  - Negd Pay (settlement, escrow, payout) │
│  - Negd Catalog (multi-vertical product) │
│  - Negd Logistics (driver, tracking)     │
│  - Negd Identity (DAN, KYC)              │
├──────────────────────────────────────────┤
│ Layer 1: PLATFORM CORE                   │  ← Бид зөвхөн хардаг
│  - Auth/RBAC, Billing, Audit, Webhooks   │
└──────────────────────────────────────────┘
```

### Pitch шиг 1 өгүүлбэр

> **"Монголд бизнес эрхлэх дэд бүтэц. Худалдаа эрхлэх, төлбөр авах, бараа хүргэх, ажилтан удирдах — бүгд нэг API. Apple Store-оос Малчны айлд хүртэл."**

---

# 🎯 2. MVP-Д ЗААВАЛ ОРОХ FEATURE

## A) MVP-ийн Цөм (Core 7)

| # | Feature | Шалтгаан |
|---|---------|---------|
| 1 | **DAN OAuth + Phone OTP нэвтрэлт** | Монгол хэрэглэгч ID-аар итгэдэг. Email-аар биш. |
| 2 | **QPay интеграц + state machine** | Бусад payment 80% дамжина. Заавал |
| 3 | **eBarimt автомат** | Хууль ёсоор шаардлагатай. Дутвал хаагдана. |
| 4 | **Order lifecycle + Escrow (HOLD → RELEASE)** | Хэрэглэгчийн итгэл бий болгоно |
| 5 | **Wallet → Bank payout (1 банк хангалттай — Khan)** | Seller-д мөнгө гарах ёстой |
| 6 | **1 vertical-ийг л launch (бараа)** | Focus. Дараа scale хийнэ |
| 7 | **Buyer + Store + Driver хэрэгтэй (3 роль)** | Минимум viable network |

## B) Дэмжих нэн чухал (Supporting 5)

| # | Feature | Шалтгаан |
|---|---------|---------|
| 8 | **Admin dashboard (basic)** | Маргаан, refund шийдэх ёстой |
| 9 | **Push notification** | Engagement-ийн 70% энд |
| 10 | **Order tracking (basic)** | Buyer trust |
| 11 | **Refund flow** | Заавал. Refund байхгүй платформ үхдэг |
| 12 | **Customer support чат (хүн биш бэ AI)** | Эхэн үед хямралтай асуудалд хариу |

## C) MVP-ийн success metric

| Метрик | Зорилт (3 сарт) |
|--------|------------------|
| GMV (нийт борлуулалт) | 100M₮+ |
| Active buyers | 1,000 |
| Active stores | 50 |
| Active drivers | 20 |
| QPay success rate | 95%+ |
| Refund rate | <5% |
| Average order value | 50,000-100,000₮ |
| Customer satisfaction | 4.0/5+ |

---

# ❌ 3. ОДОО ОРУУЛАХГҮЙ БАЙХ FEATURE

## ⛔ Trash Zone (Хэзээ ч битгий хий)

| Feature | Яагаад болохгүй |
|---------|----------------|
| **MLM / Network commission (3 түвшний sponsor)** | Хууль эрсдэл (pyramid scheme), банк татгалзана, brand сүйрнэ |
| **Crypto / Token** | Регулятор тодорхойгүй, fraud target |
| **AI generative content шууд хэрэглэгчид** | Hallucination-аас buyer хохирно |

## ⏸️ Park Zone (Дараа нэмэх)

| Feature | Яагаад одоо болохгүй | Хэзээ нэмэх |
|---------|----------------------|-------------|
| **9 vertical нэг дор** | Cognitive overload + DB complexity | 1-р vertical PMF болсны дараа |
| **AI tools (logo, poster, description)** | Distraction. Core flow хийгээгүй | Q3 |
| **White-label enterprise** | Sales cycle урт. Fenger биш | 12 сарын дараа |
| **Custom domain** | Operational complexity | Stage 2 |
| **Live commerce** | Tech complex, audience хүн алга | Stage 2 |
| **BNPL** | Regulator + bank deal хэрэгтэй | Stage 3 |
| **Group buy** | Marketing-driven, premature | Stage 2 |
| **Affiliate / Influencer** | Buyer base жижиг — ашиггүй | 5K active buyer-аас дээш |
| **Banner advertising marketplace** | Ad inventory үүсэх ёстой | 50K MAU дээш |
| **Multi-store enterprise** | Single-store ажиллаагүй байж дэлгэрүүлэх нь утгагүй | 6 сарын дараа |
| **Гадаад зах зээл** | Local PMF л байхгүй | 18 сарын дараа |

## 🟡 Soft-Launch Zone (Beta-д хэрэгтэй ч public-д хүчтэй биш)

| Feature | Тайлбар |
|---------|---------|
| Wishlist | Дотроо ажиллана. Marketing-д бүү хэлэх |
| Loyalty points | Cap-тай эхлэх. Inflation хор болно |
| Reviews | Гэхдээ moderation хатуу |
| Chat | Зөвхөн buyer↔seller. Open chat болохгүй |

---

# 🏗️ 4. MULTI-ROLE ARCHITECTURE

## A) Гол зарчим: **One User, Multiple Roles**

### ❌ Бүү хий
```typescript
// Buyer, Store, Driver гэсэн тус тусдаа table
class Buyer { ... }
class Seller { ... }
class Driver { ... }
```

### ✅ Зөв загвар
```typescript
// One canonical User + composable Profile entities
class User {
  id: string
  phone: string  // primary identifier
  email?: string
  danId?: string  // DAN OAuth ID
  status: 'active' | 'suspended' | 'banned'
  
  roles: Role[]  // ['BUYER', 'STORE_OWNER', 'DRIVER']
  
  buyerProfile?: BuyerProfile      // 1-1 nullable
  storeProfile?: StoreProfile      // 1-1 nullable
  driverProfile?: DriverProfile    // 1-1 nullable
  affiliateProfile?: AffiliateProfile
  herderProfile?: HerderProfile
}
```

### Role нэмэх flow

```
Buyer signup → BUYER role only
   ↓
Wants to sell → /become-seller
   ↓
Onboarding (KYC: DAN, address, license)
   ↓
StoreProfile created + STORE_OWNER role added
   ↓
Now has 2 roles. Can switch context in UI.
```

## B) RBAC (Role-Based Access Control)

### Permission matrix

```typescript
const PERMISSIONS = {
  BUYER:    ['order.create', 'product.view', 'cart.manage'],
  STORE_OWNER: ['product.manage', 'order.fulfill', 'wallet.payout', 'staff.invite'],
  DRIVER:   ['delivery.accept', 'delivery.complete', 'earnings.view'],
  AFFILIATE:['link.create', 'commission.view'],
  HERDER:   ['listing.manage', 'order.fulfill'],
  ADMIN:    ['*'],
}
```

### API guard pattern

```typescript
// All endpoints declare required permissions
@Permissions(['order.create'])
@Route('POST /orders')
async createOrder(...) { ... }
```

## C) Context switcher (UI)

Mobile-д header дээр role switcher:
```
[ 🛒 Buyer ▼ ]   ← tap to switch
  - 🛒 Buyer
  - 🏪 Store
  - 🚚 Driver
```

Switch хийсэн үед:
- Tab navigation re-render
- Default home өөрчлөгдөнө
- API response filter (зөвхөн тухайн role-ийн data)

## D) Sub-роль (Staff)

```typescript
class StaffMember {
  storeId: string
  userId: string
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAREHOUSE'
  permissions: string[]
}
```

Дэлгүүрд олон ажилтан байх боломжтой. POS-д зөвхөн CASHIER нэвтрэх боломж г.м.

---

# 🗄️ 5. MULTI-VERTICAL DATABASE MODEL

## A) Дилемма

| Approach | Давуу | Сул |
|----------|-------|-----|
| **A) Vertical бүрт тусдаа table** (Property, Vehicle, Service...) | Type-safe, fast queries | Code duplication, цаг зарцуулна |
| **B) Single Product table + JSON metadata** | DRY, fast iteration | Type unsafe, query slow |
| **C) Polymorphic — Product + ProductVariant per vertical** | Best of both | Complex |

## B) Recommended: **Approach C (Polymorphic + Discriminator)**

```typescript
// Common base
class Listing {
  id: string
  type: ListingType  // 'product' | 'property' | 'vehicle' | 'service' | 'livestock'
  title: string
  description: string
  price: number
  currency: 'MNT'
  ownerId: string  // User
  storeId?: string
  status: 'draft' | 'active' | 'sold' | 'expired'
  
  // Common
  images: string[]
  location: { province, district, lat, lng }
  createdAt: Date
  
  // Polymorphic detail (1-1)
  product?: ProductDetail
  property?: PropertyDetail
  vehicle?: VehicleDetail
  service?: ServiceDetail
  livestock?: LivestockDetail
}

class ProductDetail {
  listingId: string  // FK
  sku: string
  stock: number
  variants: Variant[]  // size/color
  brand?: string
  warranty?: string
}

class PropertyDetail {
  listingId: string
  area: number  // sq meters
  rooms: number
  floor: number
  totalFloors: number
  buildYear: number
  amenities: string[]
}

class VehicleDetail {
  listingId: string
  make: string
  model: string
  year: number
  mileage: number
  fuel: 'gas' | 'diesel' | 'electric' | 'hybrid'
  transmission: 'auto' | 'manual'
}

class ServiceDetail {
  listingId: string
  duration: number  // minutes
  category: string
  bookable: boolean
}

class LivestockDetail {
  listingId: string
  animalType: 'cattle' | 'sheep' | 'goat' | 'horse' | 'camel'
  age: number
  weight: number
  vetCertUrl: string  // required by law
}
```

### Search & filter
- Common: `WHERE type='product' AND price BETWEEN ...`
- Specific: `JOIN ProductDetail ON ... WHERE stock > 0`

### Ad-hoc data: Use JSON column
```typescript
class Listing {
  ...
  customAttributes?: Json  // for unforeseen vertical-specific fields
}
```

## C) Order model (vertical-agnostic)

```typescript
class Order {
  id: string
  buyerId: string
  items: OrderItem[]
  
  // Items can be from ANY vertical
  // Each item references the listing
}

class OrderItem {
  listingId: string
  listingSnapshot: Json  // freeze state at order time
  quantity: number
  price: number
  
  // Vertical-specific behavior
  fulfillmentType: 'delivery' | 'pickup' | 'booking' | 'instant_download'
}
```

---

# 💰 6. COMMISSION, AFFILIATE, FEE BUDOLT

## A) Single Source of Truth — Layered Fee Calculation

```typescript
function calculateFees(order: Order): FeeBreakdown {
  const subtotal = sum(order.items.price * quantity)
  
  // Layer 1: Tax (if enabled)
  const vat = systemSettings.vatEnabled
    ? subtotal * 0.10 / 1.10  // VAT included in price
    : 0
  
  // Layer 2: Platform fee (plan-based)
  const plan = order.store.subscription.plan
  const platformRate = PLAN_FEES[plan]  // 0.05 / 0.04 / 0.03 / 0.02
  const platformFee = (subtotal - vat) * platformRate
  
  // Layer 3: Affiliate fee (if applicable)
  const affiliateRate = order.affiliate
    ? order.affiliate.commissionRate  // e.g., 10%
    : 0
  const affiliateFee = (subtotal - vat) * affiliateRate / 100
  
  // Layer 4: Influencer bonus (top of affiliate)
  const influencerBonus = order.affiliate?.tier === 'INFLUENCER' ? 0.05 : 0
  const bonusFee = (subtotal - vat) * influencerBonus
  
  // Layer 5: Delivery fee (paid by buyer separately)
  const deliveryFee = order.delivery?.fee || 0
  const driverShare = deliveryFee * 0.85  // 15% platform cut on delivery
  
  // Net to seller
  const sellerAmount = subtotal - vat - platformFee - affiliateFee - bonusFee
  
  return {
    subtotal,
    vat,
    platformFee,
    affiliateFee,
    bonusFee,
    deliveryFee,
    driverShare,
    sellerAmount,
    
    // Reconciliation total
    totalCharged: subtotal + deliveryFee,
    totalToSeller: sellerAmount,
    totalToAffiliate: affiliateFee + bonusFee,
    totalToDriver: driverShare,
    totalToPlatform: platformFee + (deliveryFee - driverShare) + vat
  }
}
```

## B) Settlement timeline

```
Day 0: Order placed + paid
       └─ Platform: HOLDS all funds (escrow)
       └─ State: order.status = PAID, escrow.status = HOLDING

Day 0-7: Delivery
       └─ Driver receives delivery fee on COMPLETION (not order completion)

Day 7 OR Buyer confirms: Release
       └─ Seller wallet credited (sellerAmount)
       └─ Affiliate wallet credited (if applicable)
       └─ Platform retains its cut

Day 7+ withdrawal: Bank transfer (within 24 hours)
```

## C) Fee transparency rules

| Хэн | Юу хардаг |
|-----|-----------|
| Buyer | "Total: 100,000₮ + Хүргэлт 5,000₮" (тэгд биш) |
| Seller | Order detail дотор: subtotal, fees, net amount |
| Affiliate | Each commission record visible |
| Driver | Fee per delivery visible |
| Admin | Full breakdown |

## D) Тохируулга override (admin)

Тодорхой дэлгүүрийн commission өөрчлөх:
```typescript
class CommissionOverride {
  storeId: string
  rate: number  // overrides plan default
  reason: string
  startsAt: Date
  endsAt?: Date
  approvedBy: string  // admin userId
}
```

Бүх change AdminLog-д хадгалагдана.

---

# 💳 7. QPAY/EBARIMT/WALLET/REFUND/SETTLEMENT FLOW

## A) Payment State Machine

```
┌─────────┐   create    ┌─────────┐   QPay paid  ┌──────────┐
│ ORDER   │────────────▶│ INVOICE │──────────────▶│  PAID   │
│ DRAFT   │             │ PENDING │               │ ESCROW   │
└─────────┘             └─────────┘               └──────────┘
                              │                         │
                              │ timeout 30 min          │ delivered + buyer confirm
                              ▼                         ▼
                        ┌──────────┐             ┌──────────┐
                        │ EXPIRED  │             │ RELEASED │
                        └──────────┘             └──────────┘
                              │                         │
                              │                         │ refund requested
                              ▼                         ▼
                        ┌──────────┐             ┌──────────┐
                        │ CANCELLED│             │ REFUNDING│
                        └──────────┘             └──────────┘
                                                       │
                                                       ▼
                                                 ┌──────────┐
                                                 │ REFUNDED │
                                                 └──────────┘
```

## B) QPay integration

### Request flow
```
1. POST /api/checkout/create-invoice
   ├── Validate cart, calc total
   ├── Create Order (status=DRAFT)
   ├── Call QPay v2 API: createInvoice
   │   └── Response: { invoiceId, qrImage }
   ├── Save Invoice record (status=PENDING)
   └── Return { invoiceId, qrImage } to client

2. User scans QR + pays in bank app

3. QPay webhook → POST /api/webhooks/qpay
   ├── Validate signature
   ├── Idempotency check (use invoiceId)
   ├── Mark Invoice as PAID
   ├── Trigger Order state transition: DRAFT → PAID
   ├── Create EscrowTransaction (HOLDING)
   └── Send notifications

4. (Polling fallback) Client polls /payment/check
   └── Returns current Invoice status
```

### Critical: Idempotency

```typescript
// Webhook handler
async function handleQPayWebhook(payload) {
  return await db.transaction(async (tx) => {
    const existing = await tx.invoice.findUnique({
      where: { qpayInvoiceId: payload.object_id }
    })
    
    if (existing.status === 'PAID') {
      return { ok: true, idempotent: true }  // already processed
    }
    
    // Verify with QPay (защита от поддельных webhooks)
    const verified = await qpay.checkInvoice(payload.object_id)
    if (verified.payment_status !== 'PAID') {
      throw new Error('Payment not actually confirmed')
    }
    
    // Atomically update
    await tx.invoice.update({ ... })
    await tx.order.update({ ... })
    await tx.escrowTransaction.create({ ... })
    
    return { ok: true }
  })
}
```

## C) eBarimt integration

```
Order PAID → Trigger eBarimt request
   ├── POST to nbe.gov.mn API
   ├── Receive lottery code
   ├── Save TaxReceipt record
   └── Send to buyer (email/in-app)
```

### Edge cases
- Buyer DAN registered (regNumber detected) → use as `customerNo`
- Buyer no DAN → use phone as identifier
- VAT-registered seller → 10% VAT shown
- Non-VAT → no VAT line

## D) Wallet & Payout

### Wallet credit triggers
1. Order escrow released → credit seller wallet
2. Refund issued → credit buyer wallet (or original payment method)
3. Affiliate commission earned → credit affiliate
4. Driver delivery completed → credit driver
5. Manual admin adjustment

### Payout rules
- Minimum withdrawal: 10,000₮
- Frequency: instant (24h SLA)
- Bank: Khan/Golomt/TDB/Хас
- KYC: DAN verified required for >100k₮ withdrawal
- Fee: 1,000₮ per payout (covers bank transfer cost)

### Payout flow
```
1. Seller clicks "Withdraw" in wallet
2. Validates: KYC done? Bank acc set? Min amount?
3. Create PayoutRequest (status=PENDING)
4. Background job processes payout:
   ├── Call bank API or queue manual review
   ├── On success: PayoutRequest=COMPLETED, debit wallet
   └── On fail: PayoutRequest=FAILED, refund wallet
```

## E) Refund flow

### Buyer-initiated refund
```
1. Buyer opens order → "Request refund"
2. Choose reason + photo proof
3. Refund (status=PENDING)
4. Notify seller
5. Seller responds: ACCEPT / DISPUTE
   - ACCEPT → process refund
   - DISPUTE → admin queue
6. Refund processed:
   ├── If escrow not released → cancel escrow → refund payment method
   ├── If escrow released → debit seller wallet → refund buyer
   └── Update Order status to REFUNDED
```

### Refund pathways
- **Same payment method** (QPay): Refund to original card/bank
- **Wallet credit**: Faster but less preferred by buyer
- **Bank transfer**: Manual fallback

## F) Settlement Reconciliation (Daily)

Cron job runs daily at 02:00:
1. Compare wallet balances vs ledger
2. Compare bank statements vs payouts
3. Flag discrepancies → admin queue
4. Generate daily settlement report

---

# 🚶 8. USER JOURNEY (5 РОЛЬ)

## A) BUYER Journey

```
1. AWARENESS
   └── Facebook ad → eseller.mn
   
2. INSTALL / SIGNUP
   └── Download app → "Худалдан авагч" сонгох
   └── Phone OTP (3 sec)
   └── (Optional) DAN connect for faster checkout
   
3. EXPLORE
   └── Home: see banners, categories, live, trending
   └── Search "гутал"
   └── Filter by price/brand/district
   
4. EVALUATE
   └── Open product detail
   └── Read reviews
   └── Compare similar products
   └── Add to wishlist OR cart
   
5. PURCHASE
   └── Cart → Checkout
   └── Choose delivery address (saved or new)
   └── Choose payment: QPay / SocialPay / Wallet / BNPL
   └── Confirm
   
6. WAIT
   └── Real-time order tracking
   └── Push: "Захиалга бэлдэгдэж байна"
   └── Push: "Жолооч ирлээ"
   
7. RECEIVE
   └── Driver hands over
   └── In-app: "Хүлээн авлаа" button
   └── Auto-trigger escrow release
   
8. POST-PURCHASE
   └── Push: "Үнэлгээ өгнө үү"
   └── Earn loyalty points
   └── Get re-engagement push next week
```

### Critical UX moments
- Sign-up: <30 sec
- Search → product page: <2 sec
- Cart → checkout: <3 taps
- Payment: <60 sec end-to-end

## B) STORE OWNER Journey

```
1. DISCOVERY
   └── See ad: "Үнэгүй POS + Storefront"
   
2. SIGNUP
   └── Phone OTP → Choose "Дэлгүүр эзэн"
   └── Basic info: name, district, phone
   └── Skip DAN for now (can verify later)
   
3. ONBOARDING (5-10 min)
   └── Step 1: Shop name + slug
   └── Step 2: Category (food / fashion / electronics)
   └── Step 3: Add first 3 products (or import CSV)
   └── Step 4: Set up payment (link bank acc)
   └── Step 5: Verify DAN (for tax compliance)
   
4. FIRST SALE
   └── Share storefront link to social media
   └── Get first order
   └── Push: "🎉 Захиалга ирлээ!"
   └── Pack + assign driver (or self-deliver)
   
5. RECURRING USE
   └── Daily: check orders, restock
   └── Weekly: review analytics
   └── Monthly: receive payout, plan upgrade
   
6. SCALE
   └── Add staff (cashier, manager)
   └── Set up POS
   └── Run promotions
   └── Upgrade to Standard plan
```

### Critical UX moments
- Onboarding completion rate >80%
- First product upload <2 min
- First sale within 7 days
- Payout within 24 hours of request

## C) DRIVER Journey

```
1. DISCOVERY
   └── Telegram group: "Доллоор орлого"
   
2. SIGNUP
   └── Phone OTP → "Жолооч"
   └── Driver license number
   └── Vehicle: motorbike / car / van
   └── Submit license photo
   
3. VERIFICATION
   └── Admin reviews (manual MVP)
   └── Approval push within 24h
   
4. FIRST DELIVERY
   └── Open app → "Available orders" tab
   └── See list with location + payout
   └── Tap "Accept"
   └── Get pickup directions
   └── Pickup → "On the way"
   └── Deliver → photo proof + signature
   └── Earnings credited instantly to wallet
   
5. RECURRING
   └── Set "Online" status
   └── Auto-receive offers in area
   └── End of day: see earnings summary
   
6. PAYOUT
   └── Daily auto-payout to bank (or weekly)
```

### Critical UX moments
- Verification <24h
- Available orders refresh <5 sec
- Accept → directions <2 sec
- Earnings visible real-time

## D) AFFILIATE Journey

```
1. DISCOVERY
   └── See "Зар тарааж комисс ол" banner
   
2. SIGNUP
   └── Phone OTP → "Борлуулагч"
   └── Auto-create SellerProfile (10% commission)
   
3. SETUP
   └── Connect Facebook/Instagram (for sharing)
   └── Browse catalog → save favorites
   
4. SHARE
   └── Tap product → "Generate link"
   └── Copy link → share to social
   └── Custom UTM track conversion
   
5. EARN
   └── Friend buys via link
   └── Push: "Шинэ комисс олж авлаа: 5,000₮"
   └── Wallet auto-credit on order release
   
6. SCALE
   └── Apply to Influencer tier
   └── Get +5% bonus rate
   └── Marketing materials (banners, captions)
   
7. WITHDRAW
   └── Cumulative commissions → withdraw weekly
```

## E) HERDER Journey

```
1. DISCOVERY
   └── Coordinator visits аймаг → demo
   
2. SIGNUP (assisted by coordinator)
   └── Phone + DAN
   └── Fill: малын төрөл, тоо, GPS
   └── Upload vet certificate
   
3. APPROVAL
   └── Coordinator review
   └── Approval within 48h
   
4. LISTING
   └── Coordinator helps create first listings
   └── Photos + price + delivery options
   
5. FIRST ORDER
   └── Buyer in city orders
   └── Push notification (or coordinator calls)
   └── Pack + ship via аймгийн агент
   
6. EARNINGS
   └── Direct to bank
   └── See earnings dashboard
```

---

# 🚀 9. МОНГОЛЫН ЗАХ ЗЭЭЛД ЭХЛЭХ VERTICAL

## A) Үнэлгээний матрик (5 vertical-ийг дүгнэв)

| Vertical | Зах зээлийн хэмжээ | Өрсөлдөөн | Энтри хүндрэл | PMF магадлал | **Score** |
|----------|---------------------|----------|---------------|--------------|-----------|
| **General products** | 9/10 | 9/10 (хэт олон) | 4/10 | 4/10 | **5/10** |
| **Малчны** | 6/10 | 1/10 (өрсөлдөгчгүй) | 5/10 | 7/10 | **8/10** ✅ |
| **POS for jijig дэлгүүр** | 8/10 | 3/10 | 6/10 | 8/10 | **9/10** ✅✅ |
| **Услуги (booking)** | 5/10 | 5/10 | 5/10 | 6/10 | **6/10** |
| **Үл хөдлөх** | 7/10 | 8/10 (Unegui) | 7/10 | 4/10 | **5/10** |

## B) **ЗӨВЛӨЛ: POS-аар эхлэ**

### Яагаад POS?

| Шалтгаан | Тайлбар |
|----------|---------|
| **Зах зээл бэлэн** | 50K+ жижиг дэлгүүр (DataPos $200/сар-аар "хор болсон") |
| **Pain point хүчтэй** | Cash track хийж чадахгүй, eBarimt нь үрэгдэх |
| **Free-аар онцлох боломж** | DataPos charge хийдэг — бид free-аар win |
| **Lock-in** | POS суулгасны дараа дэлгүүр гарахгүй |
| **Marketplace upsell** | POS хэрэглэгчид рүү marketplace selling санал болгох |
| **Network effect** | Дэлгүүр → buyer → driver chain эхэлнэ |

### Strategy: **"POS-aar trojan horse"**

```
Phase 1 (Months 1-3): POS launch
  └─ 100 store onboard
  └─ Free POS + eBarimt + payment QR
  └─ Win trust

Phase 2 (Months 3-6): Marketplace activation
  └─ "Дэлгүүрээ онлайн зар"
  └─ POS дэлгүүрүүдийн product catalog → онлайн storefront
  └─ Buyer-уудыг draw хийх

Phase 3 (Months 6-12): Add verticals
  └─ Үйлчилгээ booking (chefs, mechanics)
  └─ Малчны (pilot 1 аймаг)
```

## C) Backup option: **Малчны-аар эхлэх**

Хэрэв POS too crowded гэж сэтгэвэл — Малчны:
- Өрсөлдөгчгүй
- Government-друг (incentive get)
- Brand differentiation
- Гэхдээ market хэмжээ жижиг

---

# ⚠️ 10. 30 ЭРСДЭЛ + ШИЙДЭЛ

## A) Regulatory & Legal (5)

| # | Эрсдэл | Шийдэл |
|---|--------|--------|
| 1 | **eBarimt-гүй ажиллавал тагнуулд хаагдана** | Day 1-аас integration. Cron-аар daily reconcile. |
| 2 | **Payment licensing шаардагдана (БНбанк)** | Юридик зөвлөгөө + Initial QPay/банкны 3rd-party гэрээ |
| 3 | **Хувийн мэдээлэл хууль (Persons Data Law)** | Privacy policy, DPA template, data retention policy |
| 4 | **Refund/dispute зохицуулалт (Consumer Protection)** | Clear refund policy + dispute SLA <7 days |
| 5 | **AML/KYC шаардлага (томруу transaction)** | DAN verify + transaction monitoring rules |

## B) Technical & Operational (10)

| # | Эрсдэл | Шийдэл |
|---|--------|--------|
| 6 | **QPay downtime → revenue зогсох** | SocialPay backup integration + pending state UI |
| 7 | **Database scale issue (MongoDB)** | Index strategy + read replica + connection pool |
| 8 | **Mobile crash → user churn** | Sentry + crashlytics + auto OTA hotfix |
| 9 | **API DDoS / abuse** | Cloudflare WAF + rate limiting per IP |
| 10 | **Webhook lost → escrow stuck** | Idempotent + retry queue + dead letter |
| 11 | **Idempotency мисс → double charge** | Mandatory idempotency keys on all financial ops |
| 12 | **Race condition (inventory oversell)** | Pessimistic locking on stock decrement |
| 13 | **Email/SMS bounce → notification fail** | Multi-channel (push primary, email fallback) |
| 14 | **Cloudinary cost explode** | Image optimization + size limits |
| 15 | **Vercel/Render bills inflate** | Cost monitoring + alerts at $500/$1000 thresholds |

## C) Business & Market (10)

| # | Эрсдэл | Шийдэл |
|---|--------|--------|
| 16 | **Cold start: дэлгүүр алга → buyer дургүй** | Concierge onboard top 50 stores manually |
| 17 | **Cold start: driver алга → delivery slow** | Subsidize drivers first 3 months |
| 18 | **Refund fraud (ar.чи buyer scam)** | Phone verification + DAN required for refund >50k |
| 19 | **Fake reviews** | Verified-buyer-only reviews + AI moderation |
| 20 | **Account farming (нэг хүн олон акк)** | Phone uniqueness + DAN dedupe |
| 21 | **Competitor copies (Unegui лог)** | Network effect moat (driver+seller liquidity) |
| 22 | **Customer support burnout** | AI bot for tier 1, human for escalation |
| 23 | **Cash flow: payout > revenue (early stage)** | Maintain 90-day runway + clear unit economics |
| 24 | **Founder burnout** | Cofounder split + VA hire + boundaries |
| 25 | **Wrong vertical pick → 6 month wasted** | Monthly KPI review + quick pivot decision |

## D) Trust & Brand (5)

| # | Эрсдэл | Шийдэл |
|---|--------|--------|
| 26 | **Анхны том scam case → media attention** | Pre-prepared crisis playbook + escrow strict |
| 27 | **Driver assault на buyer (or vice versa)** | Insurance partner + photo verification + driver background check |
| 28 | **Bug due to DB migration → orders lost** | Backup before every migration + rollback rehearsal |
| 29 | **Brand confusion (Bizprint vs eseller vs Negd)** | Clear brand architecture + naming convention |
| 30 | **App Store rejection (privacy/scam concern)** | Submit early + clear data flow doc + reviewer note |

---

# 🥊 11. ӨРСӨЛДӨГЧДИЙН ХАРЬЦУУЛАЛТ

## A) Detailed comparison table

| Феатур | **Negd Superapp** | Unegui | Shopy.mn | Wolt | TalkTalk | TaoBao+ | Facebook |
|--------|-------------------|--------|----------|------|----------|---------|----------|
| **Зорилго** | Multi-role OS | Зар самбар | Marketplace | Food delivery | Marketplace | Дамжин үйлчилгээ | Group commerce |
| **Buyer базе** | 0 (start) | 1M+ | 200K | 300K | 100K | N/A | 2M users |
| **Seller base** | 0 (start) | 50K | 5K | 1K (restaurants) | 2K | N/A | 100K+ groups |
| **Take rate** | 2-5% (plan) | 0% (зар listing fee) | 5-10% | 30% | 5-10% | 10-30% (forwarder) | 0% |
| **Payment** | QPay native | None | QPay | QPay | QPay | Manual transfer | Manual |
| **eBarimt** | ✅ Auto | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **DAN** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Escrow** | ✅ | ❌ | ❌ | ✅ | Partial | ❌ | ❌ |
| **Multi-vertical** | ✅ 9 verticals | ✅ Зар бүгд | ❌ Бараа only | ❌ Food only | Partial | ❌ Бараа | ✅ (chaotic) |
| **Live commerce** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (FB Live) |
| **POS terminal** | ✅ Free | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Driver network** | ✅ Built-in | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **B2B/Enterprise** | ✅ Roadmap | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Brand strength** | 0 | 9/10 | 5/10 | 8/10 | 4/10 | 7/10 | 10/10 |
| **Tech quality** | 9/10 (modern) | 5/10 (old) | 6/10 | 9/10 | 5/10 | N/A | N/A |
| **UX** | 8/10 | 4/10 | 5/10 | 9/10 | 4/10 | 3/10 | 6/10 |
| **Trust score** | 0 (new) | 7/10 | 6/10 | 9/10 | 4/10 | 5/10 | 5/10 |

## B) Гол positioning differentiator

| Бид | Тэд |
|-----|-----|
| **Multi-role OS** (бүх role нэгтгэсэн) | Single-role tool |
| **Multi-vertical native** | Vertical-locked |
| **Free POS (хувь биш subscription)** | Дотор хийдэггүй |
| **Live + Social commerce** | Static listing |
| **Settlement-grade payment** | Wire transfer / no escrow |
| **Local-first (DAN, eBarimt)** | Generic |

## C) Replication risk analysis

| Өрсөлдөгч | Биднийг хуулах магадлал | Хариу |
|-----------|--------------------------|-------|
| **Unegui** | Бага (legacy code) | Speed |
| **Shopy** | Дунд (active dev) | Better tech + brand |
| **Wolt** | Бага (food focus) | Adjacent only |
| **Facebook** | Маш бага (no local product team) | Niche advantage |
| **Шинэ startup** | Өндөр | First-mover network effect |

---

# 📅 12. 12-САРЫН ROADMAP

## Q1 (Сар 1-3): MVP + POS Launch

### Сар 1: Foundation
- [ ] Architecture finalize (multi-role, multi-vertical model)
- [ ] DB schema + migrations
- [ ] Auth: phone OTP + DAN OAuth
- [ ] QPay integration + webhook
- [ ] eBarimt integration
- [ ] Order state machine
- [ ] Wallet basics

### Сар 2: Core flows
- [ ] Mobile app: Buyer + Store + Driver tabs
- [ ] POS terminal (mobile, landscape)
- [ ] Inventory management
- [ ] Cart + checkout
- [ ] Driver assignment basic
- [ ] Push notifications

### Сар 3: POS Beta launch
- [ ] **Concierge onboard 50 stores**
- [ ] Free POS distribute
- [ ] Daily standup with stores
- [ ] Bug fixes + quick iteration
- [ ] **Target: 1,000 POS transactions**

## Q2 (Сар 4-6): Marketplace activation

### Сар 4: Storefront
- [ ] Public storefront for each shop (`/[slug]`)
- [ ] SEO optimized
- [ ] Customer chat
- [ ] Reviews + ratings
- [ ] Wishlist

### Сар 5: Buyer growth
- [ ] Marketing campaign (FB + Telegram)
- [ ] Referral system (basic)
- [ ] Loyalty points
- [ ] **Target: 1,000 active buyers**

### Сар 6: Driver scale
- [ ] Driver onboarding flow
- [ ] Real-time tracking
- [ ] **Target: 50 active drivers, 10k orders/month**

## Q3 (Сар 7-9): Vertical expansion

### Сар 7: Малчны булан launch
- [ ] Pilot 1 аймаг (Орхон choose)
- [ ] Coordinator role + tools
- [ ] Province-based delivery
- [ ] **Target: 100 herder shops**

### Сар 8: Service booking
- [ ] Booking system
- [ ] Calendar integration
- [ ] Service categories (chefs, mechanics, beauty)
- [ ] **Target: 50 service providers**

### Сар 9: Affiliate program
- [ ] Affiliate dashboard
- [ ] Link tracking
- [ ] Influencer tier
- [ ] **Target: 100 active affiliates, 500 sharing/day**

## Q4 (Сар 10-12): Scale + monetization

### Сар 10: Revenue diversification
- [ ] Standard/Ultimate/Pro plans launch
- [ ] Banner advertising
- [ ] Featured listings
- [ ] **Target: 10% paid plan adoption**

### Сар 11: Enterprise features
- [ ] Multi-store
- [ ] Staff management
- [ ] Custom domain
- [ ] **Target: 5 enterprise clients**

### Сар 12: AI + advanced
- [ ] AI product description
- [ ] Smart pricing suggestions
- [ ] Fraud detection
- [ ] **Target: GMV 1B₮/month**

## KPI tracker

| Quarter | Stores | Buyers | Drivers | GMV | Revenue |
|---------|--------|--------|---------|-----|---------|
| Q1 | 50 | 100 (POS) | 0 | 50M₮ | 2.5M₮ |
| Q2 | 200 | 1,000 | 50 | 200M₮ | 10M₮ |
| Q3 | 500 | 5,000 | 100 | 500M₮ | 25M₮ |
| Q4 | 1,000 | 20,000 | 200 | 1B₮ | 50M₮ |

---

# 💼 13. INVESTOR PITCH NARRATIVE

## A) The Hook (10 sec)

> **"Mongolia has 50,000 small shops. None have proper POS. None can sell online. None can offer delivery. We're building the operating system that fixes all three — for free."**

## B) The Problem (30 sec)

- 50K жижиг дэлгүүр Монголд
- 80% нь cash-only, eBarimt манж байнга
- 70% нь онлайн зарж чадахгүй (technical capacity)
- Хүргэлт хийх driver сүлжээ алга
- Existing tools (DataPos $200/мес) — affordability биш
- Result: Эдгээр дэлгүүр нар Unegui-д зар тавихаас өөр сонголтгүй, $0 trail

## C) The Solution (1 min)

```
Negd = Free POS + Online storefront + Delivery network + Payment + Tax = ALL IN ONE
                                                                            ↑
                                                                 Subscribe-to-upgrade model
```

| Layer | What | Pricing |
|-------|------|---------|
| **Core (Free)** | POS, eBarimt, basic storefront | 5% commission |
| **Standard** | + Marketing tools, custom domain | 4% commission |
| **Pro** | + AI tools, multi-store, API | 3% commission |
| **Enterprise** | + White-label, dedicated support | 2% commission |

## D) Market Size (TAM/SAM/SOM)

| Layer | Definition | Size |
|-------|-----------|------|
| **TAM** | Mongolia commerce GDP | ~$8B/year |
| **SAM** | SMB commerce (formal + informal) | ~$2B/year |
| **SOM (3yr)** | Realistic capture | ~$50M (2.5%) |

## E) Business Model

```
1. Transaction fees:  2-5% per order
2. Subscriptions:     50K-500K₮/month per shop
3. Banner ads:        10K-100K₮/day
4. Featured listings: 5K-20K₮/day
5. Driver delivery cut: 15% of delivery fee
6. Enterprise:        Custom contracts
```

**Unit economics (per active shop):**
- Avg monthly GMV: 2M₮
- Take rate: 4%
- ARR: 96K₮/year
- Acquisition cost: 50K₮ (concierge onboard)
- LTV/CAC: 1.9x in year 1, 5x at 3 years

## F) Traction (project)

- Q1: 50 POS stores, 50M₮ GMV
- Q2: 200 stores, 200M₮ GMV
- Q4 target: 1,000 stores, 1B₮ GMV/month

## G) Team

- Founder: [Your background]
- Tech: Built on modern stack (Next.js, React Native, MongoDB)
- Codebase: 300+ APIs, 95+ mobile screens, production-ready

## H) Competitive moat

```
1. Network effects (sellers + buyers + drivers compounding)
2. Switching cost (POS lock-in once integrated)
3. Local-native (DAN, eBarimt, QPay — global players won't bother)
4. Multi-vertical (single platform vs fragmented competition)
```

## I) Funding ask

| Raise | Use of funds | Milestone |
|-------|-------------|-----------|
| **Seed: $500K** | Team (3 eng + 1 ops), 12-month runway, marketing | 1,000 active stores, 20K buyers |
| **Series A: $3M** (12-18 mo) | Geographic expansion (УБ → other cities), additional verticals | 10K stores, 200K buyers |

## J) Vision

> **"In 5 years, Negd is the default commerce infrastructure of Mongolia. Every shop, every buyer, every driver runs on us. We expand to Central Asia (Kazakhstan, Kyrgyzstan) as the local-first commerce OS."**

---

# 💀 14. БҮТЭЛГҮЙТЛИЙН 10 ШАЛТГААН + СЭРГИЙЛЭХ АРГА

| # | Шалтгаан | Магадлал | Сэргийлэх арга |
|---|----------|---------|----------------|
| 1 | **Хэт олон feature, focus алдах** | 70% | MVP-д 7 feature л байна. Roadmap зөв follow хийх. Quarterly review. |
| 2 | **Buyer cold start (өрөлдөгчгүй start)** | 60% | POS-аар store side нь бий болоод л дуусна. Buyer 6 сар хүртэл хүлээ. |
| 3 | **Driver сүлжээ бүрдэхгүй** | 50% | Initial 6 months: subsidize drivers (guarantee minimum $20/day). After: organic growth. |
| 4 | **Founder burnout** | 60% | Co-founder заавал. VA hire цаг боловсрол. 2-р оноос — investor money-аар team. |
| 5 | **Cash flow гүйж дуусах** | 50% | Maintain 6-month runway. Track burn weekly. Fundraise at 9-month mark. |
| 6 | **Technical debt → iteration speed slow** | 40% | Code review process. Refactor sprints quarterly. Tests for critical paths only. |
| 7 | **Regulatory shutdown (payment license)** | 30% | Initial: use QPay's existing license. Year 2: apply own license. |
| 8 | **Fraud / settlement losses** | 40% | Day 1: idempotency, escrow, fraud rules. Reserve 5% of GMV for losses. |
| 9 | **Big competitor copies (Unegui rebuild)** | 30% | Move fast. Network effects. Local relationships (banks, drivers). |
| 10 | **Wrong vertical pick / no PMF** | 50% | Monthly KPI review. Pivot decision triggers (e.g., <10% MoM growth for 3 months). |

## Cumulative survival rate

```
Год 1: 50% survive
Год 2: 30%
Год 3: 15%
```

→ Realistic outcome: 1 in 5 chance of $10M+ exit in 5 years. Plan accordingly.

---

# 🛠️ 15. ENGINEERING IMPLEMENTATION PLAN

## A) Architecture зарчим

### **Modular Monolith** (microservices битгий хий early stage)

```
┌────────────────────────────────────────────┐
│ Negd Backend (Single deployment)           │
├────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌──────────┐    │
│  │ Auth    │ │ Catalog │ │ Order    │    │
│  └─────────┘ └─────────┘ └──────────┘    │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐    │
│  │ Payment │ │ Wallet  │ │ Driver   │    │
│  └─────────┘ └─────────┘ └──────────┘    │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐    │
│  │ Notify  │ │ Admin   │ │ Webhook  │    │
│  └─────────┘ └─────────┘ └──────────┘    │
└────────────────────────────────────────────┘
            ↓               ↓
       ┌──────────┐   ┌──────────┐
       │ Postgres │   │  Redis   │
       └──────────┘   └──────────┘
```

> Microservice бол 100K+ users-аас дээш л шилжинэ. Эхэлж monolith-аар.

## B) Tech stack (final)

| Layer | Choice | Шалтгаан |
|-------|--------|---------|
| **Backend framework** | Next.js 15 (App Router) | Already built. SSR + API routes. |
| **Database** | PostgreSQL (move from MongoDB) | Transactional integrity, JOIN, financial-grade |
| **ORM** | Prisma | Type-safe, migrations |
| **Cache** | Redis | Sessions, rate limit, queues |
| **Background jobs** | BullMQ (Redis-based) | Reliable + retry |
| **File storage** | Cloudinary | Image optimization built-in |
| **Mobile** | React Native + Expo | Cross-platform, OTA updates |
| **Web admin** | Next.js (separate app) | Faster iteration |
| **Auth** | JWT + httpOnly cookie | Mobile + web |
| **Monitoring** | Sentry + Better Uptime | Error + uptime |
| **Analytics** | PostHog (self-host?) | Product analytics |
| **Email** | Resend | Transactional |
| **SMS** | Mobicom direct API | OTP |
| **Push** | Expo Push (mobile), OneSignal (web) | Multi-channel |
| **CDN** | Vercel Edge | Built-in |

## C) Database design (top 20 tables)

```
USERS
- users (id, phone, email, danId, status)
- user_roles (userId, role)  -- Many-to-many

PROFILES (Polymorphic)
- buyer_profiles
- store_profiles  
- driver_profiles
- affiliate_profiles
- herder_profiles

CATALOG
- listings (id, type, title, price, ownerId)
- product_details (listingId, sku, stock, ...)
- property_details (listingId, area, rooms, ...)
- vehicle_details (listingId, make, model, ...)
- service_details (listingId, duration, ...)
- livestock_details (listingId, animalType, ...)
- categories (id, name, parentId, type)
- listing_categories (listingId, categoryId)

ORDERS
- orders (id, buyerId, status, total, createdAt)
- order_items (orderId, listingId, qty, price, snapshot)
- order_events (orderId, status, actor, timestamp)
- escrow_transactions (orderId, status, amount)

PAYMENTS
- invoices (id, orderId, qpayInvoiceId, status, amount)
- payments (id, invoiceId, method, status, paidAt)
- refunds (id, orderId, reason, status, amount)

WALLETS & PAYOUTS
- wallets (userId, balance, holdAmount)
- wallet_transactions (walletId, type, amount, refType, refId)
- payout_requests (id, userId, amount, status, bankAcc)

COMMISSIONS
- commission_records (orderId, type, recipient, amount, status)
- commission_overrides (storeId, rate, reason, adminId)

DELIVERY
- delivery_assignments (orderId, driverId, status)
- delivery_tracking (deliveryId, lat, lng, timestamp)

ADMIN
- admin_logs (action, before, after, adminId)
- system_settings (key, value)
```

## D) API design

### REST namespace structure

```
/api/v1/
  /auth/*           # Login, register, OTP
  /users/me         # Self
  /users/:id/profile/:type  # Polymorphic profile
  
  /listings         # Multi-vertical listings
  /listings/:id
  /listings/search
  
  /orders
  /orders/:id
  /orders/:id/cancel
  /orders/:id/refund
  
  /checkout
  /checkout/invoice
  /checkout/check/:invoiceId
  
  /wallet
  /wallet/transactions
  /wallet/payout
  
  /delivery/available  # Driver
  /delivery/:id/accept
  /delivery/:id/complete
  
  /admin/*          # Admin only
  /webhooks/qpay    # Public, signed
  /webhooks/ebarimt
```

### GraphQL? **NO** for MVP

REST simpler, fewer moving parts. Add GraphQL only if mobile/web needs advanced.

## E) Modules to build (in order)

```
Sprint 1 (2 weeks): Foundation
  ✅ Auth + DAN OAuth
  ✅ User + Profile system
  ✅ RBAC permissions

Sprint 2 (2 weeks): Catalog + Cart
  ✅ Listing CRUD
  ✅ Search (basic Postgres FTS)
  ✅ Cart (Redis-based)

Sprint 3 (2 weeks): Payment + Order
  ✅ Order create
  ✅ QPay integration
  ✅ Webhook handler (idempotent)
  ✅ Escrow state machine

Sprint 4 (2 weeks): Wallet + Payout
  ✅ Wallet ledger
  ✅ Wallet transactions
  ✅ Payout request → bank API

Sprint 5 (2 weeks): Delivery
  ✅ Driver assignment
  ✅ Real-time tracking
  ✅ Earnings calc

Sprint 6 (2 weeks): POS + eBarimt
  ✅ POS UI (mobile landscape)
  ✅ POS order create
  ✅ eBarimt API integration

Sprint 7 (2 weeks): Admin
  ✅ Admin dashboard
  ✅ User/order management
  ✅ Refund processing
  ✅ Audit logs

Sprint 8 (2 weeks): Polish + Beta launch
  ✅ Bug fixes
  ✅ Performance
  ✅ Onboarding 50 stores
```

**Total: 16 weeks (4 months) to beta launch.**

## F) Mobile app modules

```
1. Onboarding (4 screens)
   - Welcome, Role select, Phone OTP, Profile setup

2. Tabs (per role)
   - Buyer: Home, Search, Action, Orders, Profile
   - Store: Dashboard, Products, Orders, POS, Profile
   - Driver: Available, Active, Earnings, Profile

3. Standalone screens
   - Cart, Checkout, Product detail, Order detail
   - Chat (within order context)
   - Settings, Wallet, Loyalty

4. POS module (Store role only, landscape)
   - Search products, Add to cart, Checkout, Receipt

5. Driver module
   - GPS map, Order accept, Navigation, Photo proof
```

## G) Web modules

```
1. Public site (eseller.mn)
   - Home, Listings, Stores, Storefront-by-slug
   - Login/register

2. Buyer dashboard
   - Orders, Addresses, Wishlist

3. Store dashboard
   - Products, Orders, Analytics, Settings, Wallet

4. Affiliate dashboard (later)
   - Links, Earnings, Campaigns

5. Admin (separate app)
   - User management, Order management, Refund queue
   - Analytics, Logs
```

## H) Testing strategy

| Type | Coverage | Tools |
|------|----------|-------|
| Unit (functions) | 60% | Vitest |
| Integration (API) | 80% on critical paths | Supertest |
| E2E (user flows) | Top 5 flows only | Playwright |
| Manual QA | Each release | Test team |

**Critical paths to test:**
1. Buyer signup → buy → receive
2. Store create product → receive order → fulfill
3. Driver accept → deliver
4. Refund flow
5. Payout flow

## I) DevOps / Deployment

```
GitHub → Vercel (auto-deploy on main push)
Render → Backend API (alternative)
MongoDB Atlas → Production database
Cloudinary → Image storage
```

### Environments
- **Production**: eseller.mn
- **Staging**: staging.eseller.mn
- **Preview**: PR-based Vercel previews

### Monitoring
- Sentry: Errors
- Better Uptime: Uptime + status page
- PostHog: Product analytics
- Render dashboard: Backend health

---

# 🎯 ЭЦСИЙН ДҮГНЭЛТ

## Top 5 strategic moves (хийх ёстой ажил)

| # | Action | Хугацаа |
|---|--------|---------|
| 1 | **Brand consolidate** — Negd Superapp хийх, Bizprint/eseller-г dissolve хийх ч шахмал хадгалах | 1 сар |
| 2 | **POS-аар vertical эхлүүлэх** — 50 store concierge onboard | 3 сар |
| 3 | **MongoDB → Postgres migration** — Financial-grade транзакц | 2 сар |
| 4 | **Co-founder + 2 engineer hire** | 1 сар |
| 5 | **Seed fundraise $500K** — 12-month runway | 6 сар |

## Top 3 эрсдэл (хамгийн тэмцэх ёстой)

1. **Focus loss** — too many features
2. **Cold start** — buyer/seller liquidity
3. **Founder burnout** — solo undertaking

## 1 өгүүлбэрээр

> **Negd Superapp нь Монголын commerce infrastructure layer болж, Bizprint, eSeller зэрэг brand-ууд consumer-facing app болон үйлчлэх unique opportunity. Гол challenge нь focus, execution, capital. Энэ 3-ийг шийдвэл 5 жилд $50M+ exit хийх real chance.**

---

*Strategic Audit completed: 2026-04-27*
*By: Senior Product Strategist + Marketplace Architect + Fintech Expert + Startup CTO*
*For: Negd Superapp founder*
