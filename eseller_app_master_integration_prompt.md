# ESELLER.MN — БҮРЭН НЭГДСЭН СИСТЕМ
## Master Integration Prompt — Claude Code

---

## СИСТЕМИЙН БҮТЭЦ — 5 ОРОЛЦОГЧ

```
BUYER          → Бараа/зар харж, захиалга хийнэ
SELLER         → Affiliate борлуулагч — link share → commission
LISTING OWNER  → Зарын эзэн — үл хөдлөх, авто, бичил зар
PARTNER        → Гэрээт компани + агентууд
STORE OWNER    → Дэлгүүрийн эзэн — бараа, storefront
ADMIN          → Бүх хяналт, дүрэм, маргаан
ESELLER.MN     → Платформ — 2% fee + subscription + ads
```

---

## 1. PRISMA SCHEMA — НЭМЭХ ЗҮЙЛС

```prisma
// ─────────────────────────────────────
// ГЭРЭЭТ БАЙГУУЛЛАГА
// ─────────────────────────────────────

model PartnerCompany {
  id              String      @id @default(cuid())
  name            String
  type            PartnerType
  registrationNo  String?
  logo            String?
  coverImage      String?

  // Гэрээ
  contractStart   DateTime
  contractEnd     DateTime?
  contractFile    String?     // Cloudinary PDF
  isActive        Boolean     @default(true)
  isVerified      Boolean     @default(false)

  // Commission хуваарилалт
  platformFee     Float       @default(2)   // Eseller %
  agentFee        Float       @default(3)   // Агент %
  companyFee      Float       @default(95)  // Компани %

  // Холбоо барих
  contactName     String?
  contactPhone    String?
  contactEmail    String?
  website         String?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  agents          PartnerAgent[]
  listings        FeedPost[]
  commissions     PartnerCommission[]
  invoices        PartnerInvoice[]
}

enum PartnerType {
  REAL_ESTATE   // Үл хөдлөх
  AUTO          // Авто
  SERVICE       // Үйлчилгээ
  CONSTRUCTION  // Барилга
  GENERAL       // Ерөнхий
}

model PartnerAgent {
  id            String      @id @default(cuid())
  partnerId     String
  userId        String      @unique
  agentCode     String      @unique  // ESL-AGT-XXXX
  displayName   String
  licenseNo     String?
  isVerified    Boolean     @default(false)
  isActive      Boolean     @default(true)
  tier          AgentTier   @default(JUNIOR)

  totalListings Int         @default(0)
  totalSales    Int         @default(0)
  totalEarned   Float       @default(0)

  joinedAt      DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  partner       PartnerCompany   @relation(fields:[partnerId], references:[id])
  user          User             @relation(fields:[userId], references:[id])
  listings      FeedPost[]
  commissions   PartnerCommission[]
}

enum AgentTier { JUNIOR SENIOR EXPERT MASTER }

model PartnerCommission {
  id              String   @id @default(cuid())
  feedPostId      String
  agentId         String?
  partnerId       String
  buyerId         String?

  saleAmount      Float
  platformFee     Float
  agentFee        Float
  companyFee      Float
  vatAmount       Float    @default(0)
  incomeTax       Float    @default(0)

  status          CommissionStatus @default(PENDING)
  verificationCode String?
  paidAt          DateTime?
  createdAt       DateTime @default(now())

  agent           PartnerAgent?   @relation(fields:[agentId], references:[id])
  partner         PartnerCompany  @relation(fields:[partnerId], references:[id])
}

model PartnerInvoice {
  id            String        @id @default(cuid())
  partnerId     String
  period        String        // "2026-04"
  totalAmount   Float
  platformFee   Float
  agentFees     Float
  status        InvoiceStatus @default(PENDING)
  paidAt        DateTime?
  invoiceFile   String?
  createdAt     DateTime      @default(now())

  partner       PartnerCompany @relation(fields:[partnerId], references:[id])
}

enum InvoiceStatus { PENDING PAID OVERDUE CANCELLED }

// ─────────────────────────────────────
// FEEDPOST-Д НЭМЭХ ТАЛБАРУУД
// ─────────────────────────────────────

// FeedPost model-д нэмэх:
// allowAffiliate      Boolean  @default(false)
// affiliateCommission Float    @default(0)
// partnerId           String?
// agentId             String?
// isPartnerListing    Boolean  @default(false)
// vatIncluded         Boolean  @default(false)

// ─────────────────────────────────────
// ENTITY-Д НЭМЭХ ТАЛБАРУУД
// ─────────────────────────────────────

// Entity model-д нэмэх:
// vatStatus         String  @default("not_required")
// vatNumber         String?
// annualSalesCached Float   @default(0)

// ─────────────────────────────────────
// СИСТЕМ ТОХИРГОО
// ─────────────────────────────────────

model SystemSettings {
  id                    String  @id @default("main")
  // Commission
  platformFee           Float   @default(2)
  storeMinCommission    Float   @default(5)
  storeMaxCommission    Float   @default(30)
  listingMinCommission  Float   @default(0)
  listingMaxCommission  Float   @default(15)
  partnerPlatformFee    Float   @default(2)
  partnerAgentMin       Float   @default(1)
  partnerAgentMax       Float   @default(5)
  // VAT
  vatThreshold          Float   @default(50000000)
  vatWarningThreshold   Float   @default(40000000)
  vatRate               Float   @default(10)
  cityTaxRate           Float   @default(2)
  incomeTaxRate         Float   @default(10)
  updatedAt             DateTime @updatedAt
}
```

---

## 2. COMMISSION ENGINE

```typescript
// lib/commission/calculateAll.ts

export interface CommissionResult {
  saleAmount:      number
  vatAmount:       number
  cityTax:         number
  netAmount:       number
  platformFee:     number
  sellerGross?:    number
  agentGross?:     number
  companyAmount?:  number
  incomeTax:       number
  netSeller?:      number
  netAgent?:       number
  ownerAmount:     number
}

export function calculateCommission(params: {
  saleAmount:     number
  type:           'STORE' | 'LISTING' | 'PARTNER'
  sellerRate?:    number
  agentRate?:     number
  companyRate?:   number
  vatRegistered?: boolean
  platformRate?:  number
}): CommissionResult {
  const {
    saleAmount,
    type,
    sellerRate    = 0,
    agentRate     = 0,
    companyRate   = 95,
    vatRegistered = false,
    platformRate  = 2,
  } = params

  // НӨАТ тооцоо
  const vatAmount  = vatRegistered ? Math.round(saleAmount * 10 / 110) : 0
  const cityTax    = vatRegistered ? Math.round(saleAmount * 2  / 110) : 0
  const netAmount  = saleAmount - vatAmount - cityTax
  const platformFee = Math.round(netAmount * platformRate / 100)

  if (type === 'STORE' || type === 'LISTING') {
    const sellerGross = Math.round(netAmount * sellerRate / 100)
    const incomeTax   = Math.round(sellerGross * 0.10)
    const netSeller   = sellerGross - incomeTax
    const ownerAmount = netAmount - platformFee - sellerGross
    return {
      saleAmount, vatAmount, cityTax, netAmount,
      platformFee, sellerGross, incomeTax, netSeller, ownerAmount
    }
  }

  if (type === 'PARTNER') {
    const agentGross    = Math.round(netAmount * agentRate / 100)
    const incomeTax     = Math.round(agentGross * 0.10)
    const netAgent      = agentGross - incomeTax
    const companyAmount = Math.round(netAmount * companyRate / 100)
    const ownerAmount   = netAmount - platformFee - agentGross
    return {
      saleAmount, vatAmount, cityTax, netAmount,
      platformFee, agentGross, companyAmount,
      incomeTax, netAgent, ownerAmount
    }
  }

  return {
    saleAmount, vatAmount, cityTax, netAmount,
    platformFee, incomeTax: 0,
    ownerAmount: netAmount - platformFee
  }
}
```

---

## 3. СИСТЕМИЙН ДҮРЭМ

```typescript
// lib/rules/systemRules.ts

export const SYSTEM_RULES = {
  COMMISSION: {
    PLATFORM_FEE:         2,
    STORE_MIN:            5,
    STORE_MAX:            30,
    LISTING_MIN:          0,
    LISTING_MAX:          15,
    PARTNER_PLATFORM_FEE: 2,
    PARTNER_AGENT_MIN:    1,
    PARTNER_AGENT_MAX:    5,
  },
  VAT: {
    RATE:                  10,
    CITY_TAX_RATE:         2,
    REGISTRATION_THRESHOLD: 50_000_000,
    WARNING_THRESHOLD:     40_000_000,
    INCOME_TAX_RATE:       10,
  },
  VERIFICATION: {
    CODE_EXPIRY_HOURS: 48,
    MAX_RETRY:         3,
  },
  TIER: {
    SELLER: [
      { name: 'Шинэ',       min: 0,   max: 5,   bonus: 0 },
      { name: 'Идэвхтэй',   min: 6,   max: 20,  bonus: 1 },
      { name: 'Гүйцэтгэгч', min: 21,  max: 50,  bonus: 2 },
      { name: 'Элит',       min: 51,  max: 100, bonus: 3 },
      { name: 'Легенд',     min: 101, max: Infinity, bonus: 5 },
    ],
    AGENT: [
      { name: 'Junior', min: 0,  max: 5,   bonus: 0 },
      { name: 'Senior', min: 6,  max: 20,  bonus: 1 },
      { name: 'Expert', min: 21, max: 50,  bonus: 2 },
      { name: 'Master', min: 51, max: Infinity, bonus: 3 },
    ],
  },
  STORE: {
    FREE_PRODUCTS:     20,
    PRO_PRICE_MONTHLY: 29_900,
    MAX_SELLERS_FREE:  3,
  },
  LISTING: {
    FREE_PER_MONTH:    5,
    MAX_IMAGES:        20,
    MAX_VIDEO_SEC:     120,
  },
  DISPUTE: {
    RESPONSE_HOURS:  48,
    AUTO_RESOLVE_DAYS: 7,
  },
}
```

---

## 4. ADMIN ХУУДСУУД

```
Нэмэх хуудсууд:

/admin/partners                ← Гэрээт компани CRUD
/admin/partners/new            ← Шинэ компани бүртгэх
/admin/partners/[id]           ← Компанийн дэлгэрэнгүй + агентууд
/admin/partners/[id]/invoices  ← Нэхэмжлэлүүд

/admin/commission-rules        ← Commission % тохиргоо
/admin/vat-monitor             ← НӨАТ босго хяналт
/admin/disputes                ← Маргааны шийдвэрлэлт
/admin/system-rules            ← Системийн дүрэм

Sidebar-д нэмэх бүлэг — "ГЭРЭЭТ БАЙГУУЛЛАГА":
  "🤝 Компаниуд"     → /admin/partners
  "👔 Агентууд"      → /admin/partners/agents
  "📄 Нэхэмжлэл"    → /admin/partners/invoices

Sidebar-д нэмэх бүлэг — "УДИРДЛАГА":
  "⚖️ Commission дүрэм" → /admin/commission-rules
  "🧾 НӨАТ хяналт"      → /admin/vat-monitor
  "⚠️ Маргаан"          → /admin/disputes
  "📋 Системийн дүрэм"  → /admin/system-rules
```

### admin/partners/page.tsx

```tsx
// Гэрээт компанийн жагсаалт + CRUD
// StatCard 4ш: Нийт / Идэвхтэй / Нийт агент / Энэ сарын орлого
// DataTable: нэр, төрөл, агент тоо, зар тоо, commission, статус, үйлдэл
// "Шинэ компани" товч → modal (нэр, төрөл, гэрээний огноо, commission %)
// Verify/Suspend товч
```

### admin/commission-rules/page.tsx

```tsx
// Commission % slider бүгд
// Platform fee: 1-5%
// Store affiliate: min/max %
// Listing affiliate: min/max %
// Partner platform fee: 1-5%
// Partner agent: min/max %
// VAT threshold: number input
// PUT /api/admin/system-settings хадгалах
```

### admin/vat-monitor/page.tsx

```tsx
// НӨАТ босго хяналт
// Table: дэлгүүр нэр, жилийн борлуулалт, НӨАТ статус, progress bar
// Шар: 40сая+ (сануулга)
// Улаан: 50сая+ (заавал бүртгэл)
// "Мэдэгдэл илгээх" товч → seller-д email/SMS
```

---

## 5. НӨАТ ХЯНАЛТ

```typescript
// lib/tax/vatMonitor.ts

export async function checkVatThreshold(entityId: string) {
  const entity = await db.entity.findUnique({
    where: { id: entityId },
    select: { vatStatus: true }
  })
  if (entity?.vatStatus === 'registered') return

  const yearStart = new Date(new Date().getFullYear(), 0, 1)
  const result = await db.order.aggregate({
    where: { entityId, status: 'CONFIRMED', createdAt: { gte: yearStart } },
    _sum: { totalAmount: true }
  })

  const annual = result._sum.totalAmount || 0
  await db.entity.update({ where: { id: entityId },
    data: { annualSalesCached: annual } })

  if (annual >= 50_000_000) {
    await sendVatAlert(entityId, 'red', annual)
    await notifyAdmin('VAT_EXCEEDED', entityId)
  } else if (annual >= 40_000_000) {
    await sendVatAlert(entityId, 'yellow', annual)
  }
}

// Cron: сар бүр 1-нд
// app/api/cron/vat-check/route.ts
// vercel.json: { "path": "/api/cron/vat-check", "schedule": "0 9 1 * *" }
```

---

## 6. ЗАР ОРУУЛАХ ФОРМ — AFFILIATE TOGGLE

```tsx
// components/shared/AffiliateSettings.tsx
// Бараа/зар форм БҮРТ нэмэх

// Toggle: "Борлуулагч/агентаар зарлуулах"
// Slider: Commission % (0-15% зарын эзэнд, 5-30% дэлгүүрт)
// Info: "Борлуулагч: X% · Платформ: 2% · Та авах: Y%"
// Method: код / утас / QR

// DB хадгалах:
// FeedPost: allowAffiliate=true, affiliateCommission=%
// Product:  allowAffiliate=true, affiliateCommission=%
```

---

## 7. API ROUTES — НЭМЭХ

```
// Гэрээт байгууллага
GET    /api/admin/partners
POST   /api/admin/partners
GET    /api/admin/partners/[id]
PUT    /api/admin/partners/[id]
POST   /api/admin/partners/[id]/verify
POST   /api/admin/partners/[id]/suspend
POST   /api/admin/partners/[id]/agents

// Commission дүрэм
GET    /api/admin/system-settings
PUT    /api/admin/system-settings

// НӨАТ
GET    /api/admin/vat-monitor
POST   /api/admin/vat-notify/[entityId]

// Маргаан
GET    /api/admin/disputes
POST   /api/admin/disputes/[id]/resolve

// Public
GET    /api/public/stats
// { stores, listings, users, totalVolume, partners }
```

---

## 8. ЗАХ ЗЭЭЛД ТАНИЛЦУУЛАХ

```tsx
// app/about/page.tsx + Landing page

// Статистик (API-аас авна):
// 500+ бүртгэлтэй дэлгүүр
// 20+ гэрээт байгууллага
// 2,000+ идэвхтэй борлуулагч
// ₮5B+ нийт гүйлгээний дүн

// Онцлог хэсгүүд:
// 1. "7 төрлийн бизнест тохирсон"
// 2. "Монголын анхны affiliate network"
// 3. "QPay + еБаримт native"
// 4. "Гэрээт байгууллагуудтай хамтын ажиллагаа"
// 5. "21 аймаг, 9 дүүрэг — Монгол даяар"
// 6. "Claude AI — платформ өөрөө сайжирдаг"

// Terms of Service шинэчлэл:
// "7. ТАТВАРЫН ҮҮРЭГ
//  Дэлгүүрийн эзэн татварын хуулиа өөрөө хариуцна.
//  Eseller.mn борлуулагчийн ХХОАТ-ийг суутган төлнө.
//  Жилийн борлуулалт 50сая₮ давбал МТА-д бүртгүүлнэ.
//
// 8. COMMISSION
//  Платформ fee: 2%
//  Дэлгүүрийн affiliate: дэлгүүр тохируулна (5-30%)
//  Зарын зуучлал: зарын эзэн тохируулна (0-15%)
//  Гэрээт компани: гэрээгээр тогтоосон %"
```

---

## 9. НЭГДМЭЛ ХАРИЛЦААНЫ ЗУРАГЛАЛ

```
Buyer → Борлуулагчийн линк → Захиалга → QPay →
        еБаримт → ESL-XXXXXX код → Commission (ХХОАТ суутгасан)

Зарын эзэн → allowAffiliate=true → Commission % →
              Борлуулагч share → Зарагдана → Commission → Код баталгаажуулна

Гэрээт компани ↔ Eseller гэрээ → Агент → Зар →
                  2%+агент%+компани% → Сар бүр нэхэмжлэл

Дэлгүүрийн эзэн → Storefront → Борлуулагч approve →
                   QPay → Commission → НӨАТ хяналт автомат

Admin → Бүх хяналт → Commission дүрэм → НӨАТ monitor →
         Маргаан → Claude AI дүгнэлт
```

---

## 10. ХЭРЭГЖИЛТИЙН ДАРААЛАЛ

```
АЛХАМ 1 — Migration (30 мин):
npx prisma migrate dev --name add_partner_vat_rules

АЛХАМ 2 — lib/ файлууд (1 цаг):
lib/commission/calculateAll.ts
lib/rules/systemRules.ts
lib/tax/vatMonitor.ts

АЛХАМ 3 — Admin хуудсууд (3-4 цаг):
/admin/partners
/admin/commission-rules
/admin/vat-monitor
/admin/disputes

АЛХАМ 4 — Зарын форм (1 цаг):
AffiliateSettings component
FeedPost/Product форм-д нэмэх

АЛХАМ 5 — API routes (1-2 цаг):
/api/admin/partners/*
/api/admin/system-settings
/api/public/stats

АЛХАМ 6 — Cron + Terms (1 цаг):
VAT cron sар бүр
Terms of Service шинэчлэл
About хуудас

АЛХАМ 7 — Build + Test:
npm run build
Бүх flow туршиж үзэх
Push to master
```
