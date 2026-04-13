# eseller.mn — БҮРЭН ШИНЭЧЛЭЛИЙН МАСТЕР ПРОМПТ
### Claude Code-д зориулсан | 2026.04.12

---

## КОНТЕКСТ

Та eseller.mn гэсэн Монголын multi-sided marketplace платформыг бүтээж байна.
Платформ **Next.js** (App Router) + **PostgreSQL** + **Prisma ORM** + **S3/R2** + **QPay** ашиглана.

Одоогийн байдал: End-to-end flow **бүхэлдээ эвдэрсэн**.
- 18 алдаатай / 404 хуудас
- Product data layer эвдэрсэн (seed/hardcoded data)
- Onboarding routes (дэлгүүр нээх, борлуулагч, жолооч) бүгд 404
- /admin/revenue runtime error
- Мобайл апп, чат, tracking байхгүй

**Таны ажил:** Доорх 5 эрэмбийн шинэчлэлийг дарааллаар хийнэ.

---

## ЕРӨНХИЙ ДҮРЭМ

```
- Бүх өөрчлөлт TypeScript-тэй байх
- Prisma schema өөрчлөхөд migration үүсгэх: npx prisma migrate dev
- Шинэ route нэмэхэд app/ directory-д folder + page.tsx үүсгэх
- API route: app/api/*/route.ts загвараар
- Seed/demo data устгахдаа WHERE is_demo=true OR image LIKE '%unsplash%' ашиглах
- Бүх form-д zod validation нэмэх
- Error boundary бүх page-д нэмэх
- Loading skeleton бүх async component-д нэмэх
- Монгол хэлэнд тохирсон UI текст ашиглах
```

---

## 🔴 ЭРЭМБЭ 1 — 11 хуудас 404 + 4 Superadmin алдаа
### Хугацаа: 1–3 өдөр | Яаралтай

### 1.1 Static хуудсуудыг үүсгэх

Доорх бүх хуудсыг `app/` directory-д үүсгэ. Тус бүр монгол хэлтэй, SEO meta tag-тай, responsive байх ёстой.

```
Үүсгэх routes:
/privacy       → app/privacy/page.tsx        (Нууцлалын бодлого)
/terms         → app/terms/page.tsx           (Үйлчилгээний нөхцөл)
/help          → app/help/page.tsx            (Тусламж + FAQ)
/contact       → app/contact/page.tsx         (Холбоо барих + form)
/about         → app/about/page.tsx           (Бидний тухай)
/partner       → app/partner/page.tsx         (Түнш болох)
/cart          → app/cart/page.tsx            (Сагс — full page)
/open-shop     → app/open-shop/page.tsx       (Дэлгүүр нээх wizard)
/become-seller → app/become-seller/page.tsx   (Борлуулагч болох)
/become-driver → app/become-driver/page.tsx   (Жолооч болох)
/register      → app/register/page.tsx        (Бүртгүүлэх — тусдаа route)
```

**Хуудас бүрийн шаардлага:**

```typescript
// app/privacy/page.tsx загвар
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Нууцлалын бодлого | eseller.mn',
  description: 'eseller.mn платформын нууцлалын бодлого',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1>Нууцлалын бодлого</h1>
      {/* Агуулга */}
    </main>
  )
}
```

### 1.2 /admin алдаануудыг засах

```
Засах:
① /admin/revenue   → Runtime Error засах (API endpoint debug + error boundary)
② /admin/config    → 403 Forbidden → RBAC middleware-д superadmin эрх нэмэх
③ /admin/partners/agents   → Route + page үүсгэх
④ /admin/partners/invoices → Route + page үүсгэх
```

**Revenue runtime error засах:**

```typescript
// app/api/admin/revenue/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req)
    
    const [commissions, goldSubs, banners, orders] = await Promise.all([
      prisma.order.aggregate({ _sum: { platformFee: true } }),
      prisma.goldSubscription.aggregate({ _sum: { amount: true } }),
      prisma.banner.aggregate({ _sum: { price: true } }),
      prisma.order.count({ where: { status: 'completed' } }),
    ])
    
    return NextResponse.json({
      totalRevenue: (commissions._sum.platformFee ?? 0) + (goldSubs._sum.amount ?? 0),
      commissionRevenue: commissions._sum.platformFee ?? 0,
      goldRevenue: goldSubs._sum.amount ?? 0,
      bannerRevenue: banners._sum.price ?? 0,
      completedOrders: orders,
    })
  } catch (error) {
    console.error('[Revenue API]', error)
    return NextResponse.json({ error: 'Revenue тооцоолоход алдаа гарлаа' }, { status: 500 })
  }
}
```

**Config 403 засах:**

```typescript
// middleware.ts — RBAC нэмэх
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    
    const user = verifyToken(token.value)
    if (!user || user.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  return NextResponse.next()
}
```

---

## 🔴 ЭРЭМБЭ 2 — Product Data Layer засах
### Хугацаа: 3–5 өдөр | Хамгийн чухал

### 2.1 Prisma Schema шинэчлэх

```prisma
// prisma/schema.prisma — Products model нэмэх/засах

model Product {
  id          String   @id @default(cuid())
  shopId      String
  shop        Shop     @relation(fields: [shopId], references: [id])
  name        String
  description String?
  price       Float
  salePrice   Float?
  images      String[] // R2/S3 URL-ууд
  category    String
  subcategory String?
  stock       Int      @default(0)
  isPublished Boolean  @default(false)
  isDemo      Boolean  @default(false)   // ← ЗААВАЛ НЭМЭХ
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  variants    ProductVariant[]
  orderItems  OrderItem[]
}

model Shop {
  id          String    @id @default(cuid())
  ownerId     String
  owner       User      @relation(fields: [ownerId], references: [id])
  name        String
  slug        String    @unique
  type        ShopType  @default(GENERAL)
  logo        String?
  cover       String?
  about       String?
  phone       String?
  address     String?
  bankAccount String?
  bankName    String?
  status      ShopStatus @default(ACTIVE)  // ← PENDING → ACTIVE (Etsy загвар)
  isDemo      Boolean   @default(false)    // ← ЗААВАЛ НЭМЭХ
  plan        PlanType  @default(FREE)
  createdAt   DateTime  @default(now())
  
  products    Product[]
}

enum ShopType {
  GENERAL PREORDER REAL_ESTATE CONSTRUCTION AUTO SERVICE DIGITAL
}

enum ShopStatus {
  ACTIVE SUSPENDED CLOSED
}

enum PlanType {
  FREE STANDARD ULTIMATE AI_PRO
}
```

### 2.2 Seed/Demo data бүгдийг устгах

```bash
# Migration үүсгэ
npx prisma migrate dev --name "add_is_demo_flag"

# Demo data устгах script
npx ts-node scripts/clean-demo-data.ts
```

```typescript
// scripts/clean-demo-data.ts
import { prisma } from '../lib/prisma'

async function cleanDemoData() {
  console.log('Demo data устгаж байна...')
  
  // Unsplash зурагтай бараанууд устгах
  const demoProducts = await prisma.product.deleteMany({
    where: {
      OR: [
        { isDemo: true },
        { images: { hasSome: ['unsplash.com'] } },
      ]
    }
  })
  
  // Demo дэлгүүрүүд устгах (is_demo эсвэл 0 бодит бараатай демо)
  const demoShops = await prisma.shop.deleteMany({
    where: { isDemo: true }
  })
  
  console.log(`Устгасан: ${demoProducts.count} бараа, ${demoShops.count} дэлгүүр`)
  await prisma.$disconnect()
}

cleanDemoData()
```

### 2.3 Unified Product Pipeline — нэг бараа → бүх газар харагдах

```typescript
// app/api/products/route.ts — POST (Бараа нэмэх)
export async function POST(req: Request) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  
  const shop = await prisma.shop.findFirst({
    where: { ownerId: user.id, status: 'ACTIVE' }
  })
  if (!shop) return NextResponse.json({ error: 'Идэвхтэй дэлгүүр олдсонгүй' }, { status: 404 })
  
  const body = await req.json()
  const validated = productSchema.parse(body) // zod validation
  
  const product = await prisma.product.create({
    data: {
      ...validated,
      shopId: shop.id,
      isPublished: true,   // Etsy загвар — шууд нийтлэгдэнэ
      isDemo: false,
    }
  })
  
  // Cache invalidate: /store, /feed, /u/{slug} бүгдэд шинэ бараа харагдана
  await revalidatePath('/store')
  await revalidatePath('/feed')
  await revalidatePath(`/u/${shop.slug}`)
  
  return NextResponse.json({ product }, { status: 201 })
}
```

```typescript
// lib/product-queries.ts — Single source of truth
export async function getProductCount(shopId: string): Promise<number> {
  return prisma.product.count({
    where: { shopId, isPublished: true, isDemo: false }
  })
}

export async function getStoreProducts(filters?: ProductFilters) {
  return prisma.product.findMany({
    where: {
      isPublished: true,
      isDemo: false,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.minPrice && { price: { gte: filters.minPrice } }),
      ...(filters?.maxPrice && { price: { lte: filters.maxPrice } }),
    },
    include: { shop: { select: { name: true, slug: true, logo: true } } },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit ?? 20,
    skip: filters?.offset ?? 0,
  })
}
```

### 2.4 Stats Bar бодит тоо харуулах

```typescript
// app/api/stats/route.ts
export async function GET() {
  const [productCount, shopCount, userCount] = await Promise.all([
    prisma.product.count({ where: { isPublished: true, isDemo: false } }),
    prisma.shop.count({ where: { status: 'ACTIVE', isDemo: false } }),
    prisma.user.count(),
  ])
  
  return NextResponse.json({ productCount, shopCount, userCount })
}
```

---

## 🔴 ЭРЭМБЭ 3 — Onboarding Flow (Дэлгүүр + Борлуулагч + Жолооч)
### Хугацаа: 5–7 өдөр

### 3.1 Дэлгүүр нээх Wizard — /open-shop

```typescript
// app/open-shop/page.tsx — 4 алхамт wizard

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type WizardStep = 'type' | 'info' | 'profile' | 'bank'

const SHOP_TYPES = [
  { id: 'GENERAL',      label: 'Дэлгүүр',           icon: '🛍️', desc: 'Бараа, бүтээгдэхүүн зарах' },
  { id: 'PREORDER',     label: 'Захиалгын дэлгүүр',  icon: '📋', desc: 'Урьдчилсан захиалга авах' },
  { id: 'REAL_ESTATE',  label: 'Үл хөдлөх',          icon: '🏠', desc: 'Газар, байр, орон сууц' },
  { id: 'CONSTRUCTION', label: 'Барилгын компани',    icon: '🏗️', desc: 'Барилга, засвар үйлчилгээ' },
  { id: 'AUTO',         label: 'Авто худалдаа',       icon: '🚗', desc: 'Машин, тоног төхөөрөмж' },
  { id: 'SERVICE',      label: 'Үйлчилгээ',           icon: '✂️', desc: 'Цаг захиалга, үйлчилгээ' },
  { id: 'DIGITAL',      label: 'Дижитал бараа',       icon: '💾', desc: 'Файл, програм, контент' },
]

export default function OpenShopPage() {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>('type')
  const [data, setData] = useState({
    type: '', name: '', slug: '', phone: '',
    logo: '', cover: '', about: '',
    bankName: '', bankAccount: '',
  })
  
  async function handleSubmit() {
    const res = await fetch('/api/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (res.ok) {
      const { shop } = await res.json()
      router.push(`/seller/dashboard?new=true&shop=${shop.slug}`)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['type', 'info', 'profile', 'bank'].map((s, i) => (
          <div key={s} className={`h-1 flex-1 rounded ${step === s || ['type','info','profile','bank'].indexOf(step) > i ? 'bg-blue-500' : 'bg-gray-200'}`} />
        ))}
      </div>
      
      {step === 'type' && (
        <div>
          <h1 className="text-2xl font-semibold mb-2">Дэлгүүрийн төрөл сонгох</h1>
          <p className="text-gray-500 mb-6">Таны бизнест хамгийн тохирох төрлийг сонгоно уу</p>
          <div className="grid grid-cols-2 gap-3">
            {SHOP_TYPES.map(t => (
              <button key={t.id}
                onClick={() => { setData({...data, type: t.id}); setStep('info') }}
                className="p-4 border rounded-xl text-left hover:border-blue-500 transition-colors"
              >
                <span className="text-2xl">{t.icon}</span>
                <p className="font-medium mt-2">{t.label}</p>
                <p className="text-sm text-gray-500">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {step === 'info' && (
        <div>
          <h1 className="text-2xl font-semibold mb-6">Дэлгүүрийн мэдээлэл</h1>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Дэлгүүрийн нэр *</label>
              <input value={data.name}
                onChange={e => setData({...data, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                className="w-full mt-1 px-3 py-2 border rounded-lg" placeholder="Жишээ: Минийн Дэлгүүр" />
            </div>
            <div>
              <label className="text-sm font-medium">URL (slug)</label>
              <div className="flex items-center mt-1 border rounded-lg overflow-hidden">
                <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm">eseller.mn/u/</span>
                <input value={data.slug} onChange={e => setData({...data, slug: e.target.value})}
                  className="flex-1 px-3 py-2 outline-none" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Утасны дугаар</label>
              <input value={data.phone} onChange={e => setData({...data, phone: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg" placeholder="99xxxxxx" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('type')} className="flex-1 py-2 border rounded-lg">Буцах</button>
              <button onClick={() => setStep('profile')} className="flex-1 py-2 bg-blue-500 text-white rounded-lg">Үргэлжлүүлэх</button>
            </div>
          </div>
        </div>
      )}
      
      {step === 'profile' && (
        <div>
          <h1 className="text-2xl font-semibold mb-6">Профайл тохируулах</h1>
          {/* Logo upload, cover upload, about textarea */}
          <div className="space-y-4">
            <ImageUpload label="Лого (200×200)" onUpload={url => setData({...data, logo: url})} />
            <ImageUpload label="Зурвас зураг (1200×400)" onUpload={url => setData({...data, cover: url})} />
            <div>
              <label className="text-sm font-medium">Дэлгүүрийн тухай</label>
              <textarea value={data.about} onChange={e => setData({...data, about: e.target.value})}
                rows={4} className="w-full mt-1 px-3 py-2 border rounded-lg resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('info')} className="flex-1 py-2 border rounded-lg">Буцах</button>
              <button onClick={() => setStep('bank')} className="flex-1 py-2 bg-blue-500 text-white rounded-lg">Үргэлжлүүлэх</button>
            </div>
          </div>
        </div>
      )}
      
      {step === 'bank' && (
        <div>
          <h1 className="text-2xl font-semibold mb-6">Банкны данс</h1>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Банкны нэр</label>
              <select value={data.bankName} onChange={e => setData({...data, bankName: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="">Банк сонгоно уу</option>
                {['Хаан банк','Голомт банк','ТDB банк','Хас банк','Ариг банк','Капитрон банк'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Дансны дугаар</label>
              <input value={data.bankAccount} onChange={e => setData({...data, bankAccount: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-lg" placeholder="XXXXXXXXXX" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('profile')} className="flex-1 py-2 border rounded-lg">Буцах</button>
              <button onClick={handleSubmit} className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium">
                Дэлгүүр нээх ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

```typescript
// app/api/shops/route.ts — POST
export async function POST(req: Request) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  
  // Нэг хэрэглэгч → нэг дэлгүүр (хязгаар)
  const existing = await prisma.shop.findFirst({ where: { ownerId: user.id } })
  if (existing) return NextResponse.json({ error: 'Та нэгдсэн дэлгүүртэй байна' }, { status: 400 })
  
  const body = await req.json()
  const validated = shopCreateSchema.parse(body)
  
  // Slug давхардал шалгах
  const slugExists = await prisma.shop.findUnique({ where: { slug: validated.slug } })
  if (slugExists) return NextResponse.json({ error: 'Энэ URL аль хэдийн ашиглагдаж байна' }, { status: 400 })
  
  const shop = await prisma.shop.create({
    data: {
      ...validated,
      ownerId: user.id,
      status: 'ACTIVE',     // Etsy загвар — шууд идэвхтэй
      isDemo: false,
    }
  })
  
  // User-ийн role → SELLER болгох
  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'seller' }
  })
  
  await revalidatePath('/shops')
  return NextResponse.json({ shop }, { status: 201 })
}
```

### 3.2 Борлуулагч болох — /become-seller

```typescript
// app/become-seller/page.tsx
export default function BecomeSellerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold mb-4">Борлуулагч болж орлого ол</h1>
        <p className="text-gray-500">Таны referral линкээр хэн нэгэн бараа авахад 10–20% комисс олно</p>
      </div>
      
      {/* Давуу талуудын grid */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        {[
          { icon: '💰', title: '10–20% комисс', desc: 'Борлуулсан барааны үнийн 10–20%' },
          { icon: '🔗', title: 'Хувийн линк', desc: 'Нэг дор олон бараа share хийх' },
          { icon: '📊', title: 'Орлого хяналт', desc: 'Дашбоардаас орлогоо харна' },
        ].map(item => (
          <div key={item.title} className="p-6 border rounded-xl text-center">
            <span className="text-3xl">{item.icon}</span>
            <h3 className="font-medium mt-3">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
      
      {/* Бүртгүүлэх form */}
      <SellerRegistrationForm />
    </div>
  )
}
```

```typescript
// app/api/sellers/register/route.ts
export async function POST(req: Request) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  
  const body = await req.json()
  
  // Referral код үүсгэх
  const referralCode = `REF-${user.id.slice(0, 8).toUpperCase()}`
  
  const seller = await prisma.affiliateSeller.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      referralCode,
      commissionRate: 10,   // default 10%
      bankName: body.bankName,
      bankAccount: body.bankAccount,
      status: 'active',
    },
    update: { status: 'active' }
  })
  
  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'seller' }
  })
  
  return NextResponse.json({ seller, referralCode }, { status: 201 })
}
```

### 3.3 Жолооч болох — /become-driver

```typescript
// app/become-driver/page.tsx
export default function BecomeDriverPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-2">Жолооч болох</h1>
      <p className="text-gray-500 mb-8">eseller.mn хүргэлтийн жолооч болж орлого ол</p>
      
      <DriverRegistrationForm />
    </div>
  )
}
```

```typescript
// app/api/drivers/register/route.ts
export async function POST(req: Request) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })
  
  const body = await req.json()
  const validated = driverSchema.parse(body) // name, phone, vehicle, plateNumber, bankName, bankAccount
  
  const driver = await prisma.driver.create({
    data: {
      ...validated,
      userId: user.id,
      status: 'pending',   // Admin баталгаажуулна
    }
  })
  
  return NextResponse.json({ driver }, { status: 201 })
}
```

---

## 🔴 ЭРЭМБЭ 4 — Escrow + Чат + Хүргэлтийн Tracking
### Хугацаа: 2–4 долоо хоног

### 4.1 Escrow бодит хэрэгжүүлэх

```prisma
// prisma/schema.prisma — Escrow model
model Escrow {
  id          String       @id @default(cuid())
  orderId     String       @unique
  order       Order        @relation(fields: [orderId], references: [id])
  amount      Float
  status      EscrowStatus @default(HOLDING)
  heldAt      DateTime     @default(now())
  releasedAt  DateTime?
  
  @@index([status])
}

enum EscrowStatus {
  HOLDING   // Төлбөр орсон, хүлээж байна
  RELEASED  // Бараа хүргэгдэж, мөнгө дэлгүүрт шилжсэн
  REFUNDED  // Буцаасан
  DISPUTED  // Маргаантай
}
```

```typescript
// lib/escrow.ts
export async function holdPayment(orderId: string, amount: float) {
  return prisma.escrow.create({
    data: { orderId, amount, status: 'HOLDING' }
  })
}

export async function releasePayment(orderId: string) {
  const escrow = await prisma.escrow.findUnique({
    where: { orderId },
    include: { order: { include: { shop: true } } }
  })
  
  if (!escrow || escrow.status !== 'HOLDING') throw new Error('Escrow буруу төлөвт байна')
  
  // Platform комисс тооцоолох
  const shop = escrow.order.shop
  const commissionRate = getPlanCommissionRate(shop.plan) // 5/4/3/2%
  const platformFee = escrow.amount * (commissionRate / 100)
  const sellerAmount = escrow.amount - platformFee
  
  await prisma.$transaction([
    // Escrow released болгох
    prisma.escrow.update({
      where: { orderId },
      data: { status: 'RELEASED', releasedAt: new Date() }
    }),
    // Дэлгүүрийн хэтэвчинд нэмэх
    prisma.wallet.upsert({
      where: { shopId: shop.id },
      create: { shopId: shop.id, balance: sellerAmount },
      update: { balance: { increment: sellerAmount } }
    }),
    // Platform орлого бүртгэх
    prisma.platformRevenue.create({
      data: { orderId, amount: platformFee, type: 'COMMISSION' }
    })
  ])
}

function getPlanCommissionRate(plan: string): number {
  return { FREE: 5, STANDARD: 4, ULTIMATE: 3, AI_PRO: 2 }[plan] ?? 5
}
```

### 4.2 Хүргэлтийн Tracking

```prisma
model DeliveryTracking {
  id        String          @id @default(cuid())
  orderId   String          @unique
  order     Order           @relation(fields: [orderId], references: [id])
  driverId  String?
  driver    Driver?         @relation(fields: [driverId], references: [id])
  status    DeliveryStatus  @default(CONFIRMED)
  lat       Float?
  lng       Float?
  updatedAt DateTime        @updatedAt
  history   DeliveryEvent[]
}

model DeliveryEvent {
  id         String         @id @default(cuid())
  trackingId String
  tracking   DeliveryTracking @relation(fields: [trackingId], references: [id])
  status     DeliveryStatus
  note       String?
  createdAt  DateTime       @default(now())
}

enum DeliveryStatus {
  CONFIRMED    // Захиалга баталгаажлаа
  PREPARING    // Бэлтгэж байна
  PICKED_UP    // Жолооч авлаа
  ON_THE_WAY   // Хүргэлтэнд яваа
  DELIVERED    // Хүргэгдлээ
  FAILED       // Хүргэж чадсангүй
}
```

```typescript
// app/api/orders/[orderId]/tracking/route.ts — SSE real-time
export async function GET(req: Request, { params }: { params: { orderId: string } }) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const tracking = await prisma.deliveryTracking.findUnique({
        where: { orderId: params.orderId },
        include: { history: { orderBy: { createdAt: 'desc' } }, driver: true }
      })
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(tracking)}\n\n`))
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
```

```typescript
// components/DeliveryStatusBar.tsx
const STATUS_STEPS = [
  { status: 'CONFIRMED',  label: 'Баталгаажсан', icon: '✓' },
  { status: 'PREPARING',  label: 'Бэлтгэж байна', icon: '📦' },
  { status: 'PICKED_UP',  label: 'Жолооч авлаа', icon: '🚗' },
  { status: 'ON_THE_WAY', label: 'Хүргэлтэнд', icon: '🛣️' },
  { status: 'DELIVERED',  label: 'Хүргэгдлээ', icon: '🎉' },
]

export function DeliveryStatusBar({ currentStatus }: { currentStatus: string }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.status === currentStatus)
  
  return (
    <div className="flex items-center justify-between py-4">
      {STATUS_STEPS.map((step, i) => (
        <div key={step.status} className="flex flex-col items-center flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
            ${i <= currentIdx ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {step.icon}
          </div>
          <span className="text-xs mt-1 text-center">{step.label}</span>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`absolute h-0.5 w-full ${i < currentIdx ? 'bg-blue-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
```

### 4.3 WebSocket Чат систем

```prisma
model ChatRoom {
  id        String    @id @default(cuid())
  orderId   String?
  buyerId   String
  sellerId  String
  buyer     User      @relation("BuyerChats", fields: [buyerId], references: [id])
  seller    User      @relation("SellerChats", fields: [sellerId], references: [id])
  messages  ChatMessage[]
  createdAt DateTime  @default(now())
  
  @@unique([buyerId, sellerId, orderId])
}

model ChatMessage {
  id         String    @id @default(cuid())
  roomId     String
  room       ChatRoom  @relation(fields: [roomId], references: [id])
  senderId   String
  content    String
  isRead     Boolean   @default(false)
  createdAt  DateTime  @default(now())
}
```

```typescript
// app/api/chat/[roomId]/messages/route.ts
// Pusher эсвэл Ably ашиглан real-time мессеж илгээх
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
})

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  const user = await getCurrentUser(req)
  const { content } = await req.json()
  
  const message = await prisma.chatMessage.create({
    data: { roomId: params.roomId, senderId: user.id, content }
  })
  
  // Real-time broadcast
  await pusher.trigger(`chat-${params.roomId}`, 'new-message', message)
  
  return NextResponse.json({ message }, { status: 201 })
}
```

---

## 🔴 ЭРЭМБЭ 5 — Мобайл (PWA) + /s/ Route засах
### Хугацаа: 1–3 сар

### 5.1 PWA тохируулах

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // existing config
})
```

```json
// public/manifest.json
{
  "name": "eseller.mn",
  "short_name": "eSeller",
  "description": "Монголын онлайн зах зээл",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```typescript
// app/layout.tsx — meta нэмэх
export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'eSeller',
  },
}
```

### 5.2 Үйлчилгээний профайл /s/{slug} засах

```typescript
// app/s/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function ServiceProfilePage({ params }: { params: { slug: string } }) {
  const shop = await prisma.shop.findFirst({
    where: { slug: params.slug, type: 'SERVICE', status: 'ACTIVE' },
    include: {
      products: { where: { isPublished: true, isDemo: false } },
      owner: { select: { name: true } }
    }
  })
  
  if (!shop) notFound()
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Shop header */}
      <div className="flex items-center gap-4 mb-8">
        {shop.logo
          ? <img src={shop.logo} className="w-20 h-20 rounded-full object-cover" alt={shop.name} />
          : <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-600">{shop.name[0]}</div>
        }
        <div>
          <h1 className="text-2xl font-semibold">{shop.name}</h1>
          {shop.about && <p className="text-gray-500 mt-1">{shop.about}</p>}
        </div>
      </div>
      
      {/* Services grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {shop.products.map(service => (
          <ServiceCard key={service.id} service={service} shopSlug={shop.slug} />
        ))}
      </div>
      
      {/* Booking button */}
      <BookingWidget shopId={shop.id} />
    </div>
  )
}

export async function generateStaticParams() {
  const shops = await prisma.shop.findMany({
    where: { type: 'SERVICE', status: 'ACTIVE' },
    select: { slug: true }
  })
  return shops.map(s => ({ slug: s.slug }))
}
```

---

## НЭМЭЛТ — Орлого тооцоо зөв болгох

### Revenue split logic

```typescript
// lib/revenue.ts
interface RevenueBreakdown {
  total: number
  platformFee: number
  affiliateFee: number
  sellerNet: number
  vatAmount: number
  taxAmount: number
}

export function calculateRevenue(
  orderAmount: number,
  plan: PlanType,
  hasAffiliate: boolean,
  affiliateRate: number = 10
): RevenueBreakdown {
  const commissionRate = { FREE: 5, STANDARD: 4, ULTIMATE: 3, AI_PRO: 2 }[plan]
  
  const platformFee  = Math.round(orderAmount * commissionRate / 100)
  const affiliateFee = hasAffiliate ? Math.round(orderAmount * affiliateRate / 100) : 0
  const sellerNet    = orderAmount - platformFee - affiliateFee
  const vatAmount    = Math.round(orderAmount * 0.10)   // НӨАТ 10%
  const taxAmount    = Math.round(affiliateFee * 0.10)  // ХХОАТ 10%
  
  return { total: orderAmount, platformFee, affiliateFee, sellerNet, vatAmount, taxAmount }
}
```

---

## ENVIRONMENT VARIABLES шаардлагатай

```env
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://eseller.mn"

# Storage (R2/S3)
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="eseller-uploads"
R2_PUBLIC_URL="https://cdn.eseller.mn"

# QPay
QPAY_USERNAME="..."
QPAY_PASSWORD="..."
QPAY_INVOICE_CODE="..."
QPAY_BASE_URL="https://merchant.qpay.mn/v2"

# Real-time (чат)
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="ap3"

# Email
RESEND_API_KEY="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## ХЭРЭГЖҮҮЛЭЛТИЙН ДАРААЛАЛ

```bash
# 1. Schema migrate
npx prisma migrate dev --name "full_platform_rebuild"
npx prisma generate

# 2. Demo data цэвэрлэх
npx ts-node scripts/clean-demo-data.ts

# 3. Dependencies нэмэх
npm install pusher pusher-js next-pwa zod @hookform/resolvers

# 4. Build шалгах
npm run build
npm run start

# 5. Бүх route тестлэх
curl https://eseller.mn/open-shop       # 200 OK
curl https://eseller.mn/become-seller   # 200 OK
curl https://eseller.mn/become-driver   # 200 OK
curl https://eseller.mn/privacy         # 200 OK
curl https://eseller.mn/cart            # 200 OK
curl https://eseller.mn/api/admin/revenue # { totalRevenue: ... }
```

---

## АМЖИЛТЫН ШАЛГУУР

| Шалгуур | Зорилт |
|---------|--------|
| 404 хуудас | 11 → 0 |
| Бодит бараа | 0 → ≥1 (end-to-end test) |
| Escrow бодит | UI badge → backend logic |
| Хүргэлтийн статус | Байхгүй → 5 алхамт progress |
| Чат | Байхгүй → WebSocket ажиллах |
| Admin revenue | Runtime error → Ажиллах |
| PWA | Байхгүй → Installable |
| /s/{slug} | 5/5 broken → 5/5 ажиллах |

---

*eseller.mn бүрэн шинэчлэлийн мастер промпт | 2026.04.12*
