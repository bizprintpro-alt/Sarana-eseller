# 💰 ESELLER.MN — КОМИССНЫ СИСТЕМ

> Хэн хэнтэй хэрхэн орлого хуваалцдагийг бүрэн харуулсан тайлан.

---

## 🎯 НЭГ ЗАХИАЛГЫН ЖИШЭЭ — 100,000₮

### A) Энгийн дэлгүүр (Affiliate байхгүй)

```
Захиалгын дүн:               100,000₮

  Платформын комисс (5%):       -5,000₮  ← eseller.mn
  ─────────────────────────────────────
  Дэлгүүрийн эзэнд (95%):      +95,000₮
```

### B) Affiliate борлуулагчтай захиалга

```
Захиалгын дүн:               100,000₮

  Платформын комисс (2.5%):     -2,500₮  ← eseller.mn
  Борлуулагч комисс (10%):     -10,000₮  ← Affiliate (борлуулагч)
  ─────────────────────────────────────
  Дэлгүүрийн эзэнд (87.5%):    +87,500₮
```

### C) Гэрээт байгууллага (Үл хөдлөх — 1,000,000₮)

```
Худалдааны дүн:           1,000,000₮

  Платформ (2%):              -20,000₮
  Агент (3%):                 -30,000₮
  ─────────────────────────────────────
  Компани (95%):             +950,000₮
```

### D) MLM Network (Сүлжээний бизнес)

```
Захиалгын дүн:                100,000₮

  Шууд худалдсан хүн (20%):    20,000₮
  1-р түвшин sponsor (5%):      5,000₮
  2-р түвшин sponsor (3%):      3,000₮
  3-р түвшин sponsor (2%):      2,000₮
  ─────────────────────────────────────
  Дэлгүүр эзэнд:               70,000₮
```

---

## 📊 ПЛАТФОРМЫН КОМИССНЫ ХҮРЭЭ

### Subscription plan-аар

| Plan | Сарын төлбөр | Платформ комисс | Үлдэгдэл дэлгүүрт |
|------|--------------|------------------|--------------------|
| **FREE** | 0₮ | **5%** | 95% |
| **STANDARD** | (тооцоолж байгаа) | **4%** | 96% |
| **ULTIMATE** | (тооцоолж байгаа) | **3%** | 97% |
| **AI_PRO** | (тооцоолж байгаа) | **2%** | 98% |

> **Шалтгаан:** Premium plan авсан дэлгүүр илүү бага комисс төлдөг — тогтмол сарын орлоготой болсон тул.

### Default config (PlatformConfig)

| Key | Утга | Тайлбар |
|-----|------|---------|
| `commission_rate` | 5% | Default платформын комисс |
| `affiliate_rate` | 15% | Default affiliate комисс |
| `seller_free_commission` | 5% | Free plan |
| `seller_standard_commission` | 4% | Standard plan |
| `seller_ultimate_commission` | 3% | Ultimate plan |
| `seller_ai_pro_commission` | 2% | AI Pro plan |

---

## 🎯 ХУВЬ ХЭЛБЭЛЭХ ЖАГСААЛТ

| Хэн авдаг | Хүрээ | Default | Тайлбар |
|-----------|-------|---------|---------|
| **Платформ (eseller.mn)** | 1-5% | 2.5-5% | Plan-аар хамаарна |
| **Дэлгүүрийн эзэн** | 70-98% | 87.5-95% | Үлдэгдэл бүгд авна |
| **Affiliate (борлуулагч)** | 5-30% | 10% | Дэлгүүр эзэн тохируулна |
| **Influencer Affiliate** | + 5% bonus | — | INFLUENCER tier |
| **Партнёр компани** | 90-98% | 95% | Гэрээтэй хамтран ажиллах |
| **Партнёр агент** | 1-5% | 3% | Үл хөдлөх хөрөнгийн агент |
| **MLM шууд** | — | 20% | Шууд худалдсан хүн |
| **MLM Level 1** | — | 5% | Sponsor (1 түвшин дээш) |
| **MLM Level 2** | — | 3% | Sponsor (2 түвшин дээш) |
| **MLM Level 3** | — | 2% | Sponsor (3 түвшин дээш) |

---

## 💼 GEREE-T БАЙГУУЛЛАГА (PARTNER COMPANY)

Үл хөдлөх хөрөнгийн агентлаг, тогтвортой түнш компаниудтай гэрээтэй ажиллах:

### Бүтэц
```
PartnerCompany (компани)
  ├── platformFee:  2%   (eseller.mn авна)
  ├── agentFee:     3%   (Агентад ноогддог)
  └── companyFee:   95%  (Компанид үлдэнэ)
```

### Агентын tier
| Tier | Тайлбар |
|------|---------|
| **JUNIOR** | Шинэ агент |
| **SENIOR** | Туршлагатай |
| **EXPERT** | Шилдэг гүйцэтгэгч |
| **MASTER** | Мастер агент |

### Татвар (хэрэв vatRegistered=true)
- НӨАТ: 10% (хэрэв `vatEnabled`)
- ХХОАТ: 10% (хэрэв `incomeTaxEnabled`)
- Хотын татвар: 2% (хэрэв `cityTaxEnabled`)

---

## 👥 AFFILIATE СИСТЕМ (БОРЛУУЛАГЧ)

### Affiliate-ийн tier
```
SellerProfile.sellerType:
  REGULAR    → 10% (default)
  ACTIVE     → ?
  MICRO      → Micro influencer
  INFLUENCER → +5% bonus
  MEGA       → Top tier
```

### Бүртгүүлэх
- `/api/auth/register` дээр `role='affiliate'` сонгох
- SellerProfile автоматаар үүснэ (commission 10%, status active)
- Дэлгүүрийн `allowSellers=true` бөгөөд affiliate-уудыг хүлээн авна

### Influencer Application
- `/dashboard/affiliate/influencer-apply`
- targetTier: MICRO | INFLUENCER | MEGA
- Followers тоо verify хийнэ
- Approved болсны дараа commission rate нэмэгдэнэ

---

## 💎 SUBSCRIPTION & PLAN ОРЛОГО

### Live Streaming Plans

| Plan | Сарын үнэ | Live limit | Scope |
|------|-----------|-----------|-------|
| **BASIC** | Үнэгүй | 1/сар | PUBLIC |
| **STANDARD** | 50,000₮ | 10/сар | PUBLIC + SHOP |
| **PRO** | 150,000₮ | Unlimited | + PRODUCT |
| **ENTERPRISE** | 500,000₮ | All + branded | All |

### Шууд орлого:
- Gold membership (Buyer)
- Live plan (Seller)
- Banner advertising
- Featured listing
- Promotion boost (per-day)
- Domain registration markup
- Theme marketplace
- Enterprise white-label

---

## 🔄 ESCROW & ТӨЛБӨР БҮТЭЦ

### Захиалгын lifecycle
```
1. Захиалга үүсэх:        pending
2. Төлбөр төлөгдөх:       confirmed + ESCROW HOLDING
3. Хүргэлт хийх:          delivering
4. Хүргэгдэх:             delivered
5. Худалдан авагч баталгаажуулах:
   ├── confirmedByBuyer = true
   ├── escrowStatus = RELEASED
   └── Wallet.balance += amount × 0.98 (2% platform fee)
6. Маргаантай:           DISPUTED
```

### Settlement timing
| Үе | Action |
|----|--------|
| Төлбөр орох | EscrowTransaction → HOLDING |
| Buyer confirm | RELEASED + Wallet credit |
| Auto-release | 7 хоногийн дараа (cron) |
| Payout | 24 цагийн дотор bank acc-руу |

---

## 🧾 ТАТВАРЫН ТООЦОО (Бүрэн жишээ — 1,000,000₮)

```
Худалдааны дүн:                  1,000,000₮

ТАТВАР (хэрэв enabled):
  НӨАТ (10%):                       -83,333₮
  Хотын татвар (2%):                  -1,639₮
  ─────────────────────────────────────────
  Цэвэр дүн:                       915,028₮

КОМИСС:
  Платформ (2%):                    -18,300₮
  Борлуулагч (10% + 5% bonus):     -100,653₮
  
ХХОАТ (борлуулагчийн орлогоос 10%):
  Татвар:                           -10,065₮
  Цэвэр борлуулагчид:                90,588₮

ДЭЛГҮҮР ЭЗЭНД:
  Үлдэгдэл:                        +796,075₮
```

**Settings (`SystemSettings`):**
- `vatEnabled: false` (default off)
- `incomeTaxEnabled: false`
- `cityTaxEnabled: false`

> Татвар асаалтай үед автоматаар тооцоо орох.

---

## 📈 ПЛАТФОРМЫН ОРЛОГЫН ТААМАГНАЛ

### 1000 захиалга/сар (50,000₮ avg, FREE plan)

```
1 захиалгын платформ комисс: 5,000₮
1000 захиалга/сар:           5,000,000₮

Өдөрт:    166,667₮
Сарын:    5,000,000₮
Жилийн:   60,000,000₮
```

### Benchmark (бусад платформтай харьцуулах)
| Платформ | Комисс |
|----------|--------|
| **Shopify** | 0.5-2% |
| **eseller.mn (Free)** | **5%** |
| **Amazon** | 8-15% |
| **Gumroad** | 10% |
| **Wolt** | ~30% |

> eseller.mn бусдаас илүү шударга үнэтэй. Premium plan авсан дэлгүүр 2% л төлнө.

---

## 🛠 АДМИН ТОХИРГОО

### Commission Rules (`/dashboard/admin/commission-rules`)

```
ПЛАТФОРМ:
  platformFee: 2% [min 1%, max 5%]

ДЭЛГҮҮРИЙН АФФИЛИЕЙТ:
  storeMinCommission: 5%
  storeMaxCommission: 30%

ЗАРЫН АФФИЛИЕЙТ (Үл хөдлөх):
  listingMinCommission: 0%
  listingMaxCommission: 15%

ГЭРЭЭТ БАЙГУУЛЛАГА:
  partnerPlatformFee: 2%
  partnerAgentMin: 1%
  partnerAgentMax: 5%
```

### Commission Calculator (`/dashboard/admin/commission`)

Real-time preview ашиглан:
- Plan тус бүрийн ялгаа
- Affiliate байгаа эсэхийг шалгах
- Татвар тооцох

### Override (per-shop)

Админ тодорхой дэлгүүрт өөр rate тогтоох боломжтой:
- `/admin/shops/[shopId]/commission` POST endpoint
- AdminLog-д тэмдэглэгдэнэ
- `Shop.subscription.commissionRate` field-д хадгалагдана

---

## 📁 ФАЙЛУУДЫН БАЙРШИЛ

### Schema
- `prisma/schema.prisma` — бүх commission models

### Calculation logic
- `src/lib/commission/calculateCommission.ts` — энгийн тооцоо
- `src/lib/commission/calculateAll.ts` — татвартай бүрэн тооцоо
- `src/lib/ebarimt.ts` — eBarimt татварын баримт
- `src/lib/live-plans.ts` — Live plan үнэ

### API routes
- `/api/admin/commission` — config удирдах
- `/api/admin/commission/calculate` — preview
- `/api/admin/shops/[shopId]/commission` — override
- `/api/checkout/check-payment/[invoiceId]` — захиалга баталгаажих үед commission record үүсгэх
- `/api/orders/[id]/confirm` — escrow release
- `/api/affiliate/commissions` — affiliate-ийн комисс түүх
- `/api/affiliate/earnings` — earnings summary

### Admin pages
- `/dashboard/admin/commission` — overview + plan compare
- `/dashboard/admin/commission-rules` — rules CRUD
- `/dashboard/admin/revenue` — revenue tracking
- `/dashboard/admin/vat-monitor` — VAT threshold

---

## ✅ ОНЦГОЙ ҮЙЛЧИЛГЭЭ

### 1. Affiliate бус энгийн дэлгүүр
- 100k захиалга → 5k платформ → 95k дэлгүүрт

### 2. Affiliate-тай дэлгүүр
- Affiliate komiss 10% (default)
- Дэлгүүр өөрөө rate тохируулна (5-30% хооронд)

### 3. Үл хөдлөх (Real estate)
- Platform 2% + Agent 3% + Company 95%
- Тогтмол гэрээтэй

### 4. MLM/Network
- Шууд 20% + 3 түвшний sponsor commission
- Rank-аар үржих (BRONZE → DIAMOND)

### 5. Live commerce
- Live plan-аас комисс хамаарахгүй
- Plan дотор багтсан live тооноос хамаарна

---

## 🎯 АНХААРАХ:

1. **Settlement** = Escrow release (buyer confirm)
2. **Payout** = Bank-руу татах (24 цагт)
3. **Татвар** = setting-аар toggle хийнэ (default off)
4. **Override** = per-shop rate бүртгэгддэг + AdminLog-д
5. **Influencer** = +5% bonus, MEGA tier хамгийн өндөр

---

*Last updated: 2026-04-27*
*eseller.mn — Sarana commerce platform*
