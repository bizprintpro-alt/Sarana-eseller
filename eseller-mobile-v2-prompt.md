# ESELLER.MN MOBILE APP — САЙЖРУУЛАЛТЫН CLAUDE CODE PROMPT
### v2.0 | Zary.mn benchmark + Хэтэвч/Оноо систем | 2026.04.12

---

## КОНТЕКСТ

Одоо байгаа unified app: `apps/mobile-customer/` — 47 файл, 0 TS error.
Энэ prompt нь **шинэ функц нэмэх** зориулалттай — дахин бичихгүй.

```
Нэмэх зүйлс:
  1. Хэтэвч + Оноо систем (бүрэн)
  2. Хэрэглэгчийн аккаунт (нарийн)
  3. Zary.mn-аас авсан сайжруулалт
  4. Owner role screens
  5. Feed/Зарын булан
```

---

## БЛОК 1 — ХЭТЭВЧ + ОНОО СИСТЕМ

### 1.1 Prisma Schema нэмэх

```prisma
model Wallet {
  id           String       @id @default(cuid())
  userId       String       @unique
  user         User         @relation(fields: [userId], references: [id])
  balance      Float        @default(0)
  points       Int          @default(0)
  totalPoints  Int          @default(0)
  tier         Tier         @default(BRONZE)
  updatedAt    DateTime     @updatedAt
  transactions WalletTx[]
  pointEvents  PointEvent[]
}

model WalletTx {
  id        String   @id @default(cuid())
  walletId  String
  wallet    Wallet   @relation(fields: [walletId], references: [id])
  type      TxType
  amount    Float
  note      String?
  orderId   String?
  createdAt DateTime @default(now())
}

model PointEvent {
  id        String      @id @default(cuid())
  walletId  String
  wallet    Wallet      @relation(fields: [walletId], references: [id])
  action    PointAction
  points    Int
  expiresAt DateTime
  isUsed    Boolean     @default(false)
  refId     String?
  createdAt DateTime    @default(now())
}

enum Tier {
  BRONZE SILVER GOLD PLATINUM DIAMOND
}

enum TxType {
  DEPOSIT WITHDRAW ORDER_PAY POINTS_CONVERT REFUND GIFT ESCROW_HOLD ESCROW_RELEASE
}

enum PointAction {
  ORDER REVIEW REFERRAL REGISTER PROFILE_COMPLETE
  DAILY_LOGIN BIRTHDAY GOLD_SUBSCRIBE FLASH_SALE
  SHOP_OPEN PRODUCT_FIRST AFFILIATE_SALE
}
```

```bash
npx prisma migrate dev --name "add_wallet_points_system"
npx prisma generate
```

### 1.2 Оноо тооцоолох логик

```typescript
// lib/points.ts

export const TIER_THRESHOLDS = {
  BRONZE:   0,
  SILVER:   5_000,
  GOLD:     20_000,
  PLATINUM: 50_000,
  DIAMOND:  100_000,
} as const

export const POINT_RATES: Record<string, number> = {
  BRONZE:   0.10,   // Захиалгын 10%
  SILVER:   0.12,   // 12%
  GOLD:     0.15,   // 15%
  PLATINUM: 0.18,   // 18%
  DIAMOND:  0.20,   // 20%
}

export const POINT_ACTIONS: Record<string, number> = {
  REGISTER:         200,
  PROFILE_COMPLETE: 300,
  DAILY_LOGIN:      10,
  REVIEW:           50,
  REFERRAL:         500,
  BIRTHDAY:         1_000,
  GOLD_SUBSCRIBE:   500,
  FLASH_SALE:       50,
  SHOP_OPEN:        1_000,
  PRODUCT_FIRST:    300,
}

export function getTier(totalPoints: number): Tier {
  if (totalPoints >= TIER_THRESHOLDS.DIAMOND)  return 'DIAMOND'
  if (totalPoints >= TIER_THRESHOLDS.PLATINUM) return 'PLATINUM'
  if (totalPoints >= TIER_THRESHOLDS.GOLD)     return 'GOLD'
  if (totalPoints >= TIER_THRESHOLDS.SILVER)   return 'SILVER'
  return 'BRONZE'
}

export function calcOrderPoints(
  amount: number,
  tier: Tier,
  isGoldMember: boolean
): number {
  const rate = POINT_RATES[tier]
  const base = Math.floor(amount * rate / 100)
  return isGoldMember ? base * 2 : base
}

// Оноо хэтэвчид хөрвүүлэх: 100 оноо = 100₮
export function pointsToMoney(points: number): number {
  return points  // 1:1 харьцаа
}

// Захиалгад оноо ашиглах хязгаар: захиалгын 30%
export function maxPointsForOrder(orderAmount: number): number {
  return Math.floor(orderAmount * 0.30)
}
```

### 1.3 Оноо олох service

```typescript
// lib/points-service.ts
import { prisma } from './prisma'
import { calcOrderPoints, getTier, POINT_ACTIONS, pointsToMoney } from './points'

export async function earnPoints(
  userId: string,
  action: PointAction,
  opts?: { refId?: string; orderAmount?: number; isGoldMember?: boolean }
): Promise<{ pointsEarned: number; newTier: Tier; tierChanged: boolean }> {
  const wallet = await prisma.wallet.findUnique({ where: { userId } })
  if (!wallet) throw new Error('Wallet олдсонгүй')

  let pts = POINT_ACTIONS[action] ?? 0

  // Захиалгын оноо тусдаа тооцно
  if (action === 'ORDER' && opts?.orderAmount) {
    pts = calcOrderPoints(opts.orderAmount, wallet.tier, opts.isGoldMember ?? false)
  }

  if (pts <= 0) return { pointsEarned: 0, newTier: wallet.tier, tierChanged: false }

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const oldTier = wallet.tier
  const newTotalPoints = wallet.totalPoints + pts
  const newTier = getTier(newTotalPoints)

  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId },
      data: {
        points:      { increment: pts },
        totalPoints: { increment: pts },
        tier:        newTier,
      },
    }),
    prisma.pointEvent.create({
      data: {
        walletId:  wallet.id,
        action,
        points:    pts,
        expiresAt,
        refId:     opts?.refId,
      },
    }),
  ])

  return { pointsEarned: pts, newTier, tierChanged: newTier !== oldTier }
}

export async function convertPointsToMoney(
  userId: string,
  points: number
): Promise<void> {
  const wallet = await prisma.wallet.findUnique({ where: { userId } })
  if (!wallet) throw new Error('Wallet олдсонгүй')
  if (wallet.points < points) throw new Error('Оноо хүрэлцэхгүй байна')

  const money = pointsToMoney(points)

  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId },
      data: {
        points:  { decrement: points },
        balance: { increment: money },
      },
    }),
    prisma.walletTx.create({
      data: {
        walletId: wallet.id,
        type:     'POINTS_CONVERT',
        amount:   money,
        note:     `${points} оноо → ${money}₮`,
      },
    }),
  ])
}
```

### 1.4 API endpoints

```typescript
// app/api/wallet/route.ts — GET хэтэвч мэдээлэл
export async function GET(req: Request) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 })

  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
    include: {
      transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      pointEvents:  { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })

  if (!wallet) {
    // Анх удаа → хэтэвч автомат үүсгэнэ
    const newWallet = await prisma.wallet.create({ data: { userId: user.id } })
    return NextResponse.json({ wallet: newWallet, transactions: [], pointEvents: [] })
  }

  const { TIER_THRESHOLDS } = await import('@/lib/points')
  const tierValues = Object.values(TIER_THRESHOLDS) as number[]
  const tierKeys   = Object.keys(TIER_THRESHOLDS)
  const idx        = tierKeys.indexOf(wallet.tier)
  const nextThresh = tierValues[idx + 1] ?? wallet.totalPoints
  const progress   = idx < tierValues.length - 1
    ? Math.round((wallet.totalPoints - tierValues[idx]) / (nextThresh - tierValues[idx]) * 100)
    : 100

  return NextResponse.json({
    wallet,
    progress,
    nextTier:      tierKeys[idx + 1] ?? null,
    pointsToNext:  Math.max(0, nextThresh - wallet.totalPoints),
    transactions:  wallet.transactions,
    pointEvents:   wallet.pointEvents,
  })
}
```

```typescript
// app/api/wallet/deposit/route.ts — POST цэнэглэх
export async function POST(req: Request) {
  const user = await getCurrentUser(req)
  const { method, amount } = await req.json()

  // method: 'qpay' | 'socialpay' | 'bank'
  if (method === 'qpay') {
    const invoice = await QPayAPI.createInvoice({
      amount,
      description: 'eSeller хэтэвч цэнэглэх',
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/wallet/deposit/callback`,
    })
    return NextResponse.json({ invoiceId: invoice.id, qrImage: invoice.qrImage })
  }
  // ... SocialPay, bank шилжүүлэг
}
```

```typescript
// app/api/wallet/convert-points/route.ts — POST оноо хөрвүүлэх
export async function POST(req: Request) {
  const user = await getCurrentUser(req)
  const { points } = await req.json()

  if (points < 100)
    return NextResponse.json({ error: 'Хамгийн багадаа 100 оноо хөрвүүлнэ' }, { status: 400 })

  await convertPointsToMoney(user.id, points)
  return NextResponse.json({ success: true, money: points })
}
```

```typescript
// app/api/wallet/gift-points/route.ts — POST найздаа бэлэглэх
export async function POST(req: Request) {
  const user = await getCurrentUser(req)
  const { toUserId, points } = await req.json()

  if (points < 200)
    return NextResponse.json({ error: 'Хамгийн багадаа 200 оноо бэлэглэнэ' }, { status: 400 })

  const sender   = await prisma.wallet.findUnique({ where: { userId: user.id } })
  const receiver = await prisma.wallet.findUnique({ where: { userId: toUserId } })

  if (!sender || sender.points < points)
    return NextResponse.json({ error: 'Оноо хүрэлцэхгүй' }, { status: 400 })

  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId: user.id },
      data: { points: { decrement: points } },
    }),
    prisma.wallet.update({
      where: { userId: toUserId },
      data: { points: { increment: points } },
    }),
  ])

  return NextResponse.json({ success: true })
}
```

### 1.5 Mobile screens

```typescript
// app/(customer)/wallet.tsx — Хэтэвч дэлгэц

'use client'
import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { WalletAPI } from '@/lib/api'

const TIER_META = {
  BRONZE:   { icon: '🥉', color: '#CD7F32', label: 'Bronze'   },
  SILVER:   { icon: '🥈', color: '#607D8B', label: 'Silver'   },
  GOLD:     { icon: '🥇', color: '#C0953C', label: 'Gold'     },
  PLATINUM: { icon: '💎', color: '#7F77DD', label: 'Platinum' },
  DIAMOND:  { icon: '👑', color: '#0F6E56', label: 'Diamond'  },
}

export default function WalletScreen() {
  const [wallet, setWallet]   = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<'txns' | 'points'>('txns')

  useEffect(() => {
    WalletAPI.get().then(setWallet).finally(() => setLoading(false))
  }, [])

  if (loading) return <WalletSkeleton />

  const tier = TIER_META[wallet.wallet.tier as keyof typeof TIER_META]

  async function handleConvert() {
    Alert.prompt('Оноо хөрвүүлэх', '100 оноо = 100₮', async (input) => {
      const pts = parseInt(input)
      if (isNaN(pts) || pts < 100) return Alert.alert('100-аас дээш оноо оруулна уу')
      await WalletAPI.convertPoints(pts)
      const updated = await WalletAPI.get()
      setWallet(updated)
    })
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      {/* Хэтэвчийн карт */}
      <View style={{ backgroundColor: '#1B3A5C', margin: 12, borderRadius: 16, padding: 16 }}>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Нийт үлдэгдэл</Text>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '600', marginTop: 4 }}>
          {wallet.wallet.balance.toLocaleString()}₮
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {['Цэнэглэх', 'Гаргах', 'Шилжүүлэх'].map(label => (
            <TouchableOpacity key={label}
              style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
                       borderRadius: 8, padding: 8, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 11 }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Оноо карт */}
      <View style={{ backgroundColor: '#fff', margin: 12, marginTop: 0,
                     borderRadius: 12, padding: 14, borderWidth: 0.5,
                     borderColor: '#e5e5e5' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between',
                       alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 20 }}>{tier.icon}</Text>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '500' }}>
                {wallet.wallet.points.toLocaleString()} оноо
              </Text>
              <Text style={{ fontSize: 10, color: '#888' }}>{tier.label} түвшин</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleConvert}
            style={{ backgroundColor: '#EAF3DE', borderRadius: 99,
                     paddingHorizontal: 12, paddingVertical: 5 }}>
            <Text style={{ fontSize: 10, color: '#27500A', fontWeight: '500' }}>
              Мөнгө болгох
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={{ height: 5, backgroundColor: '#F0F0F0', borderRadius: 3 }}>
          <View style={{ width: `${wallet.progress}%`, height: '100%',
                         backgroundColor: tier.color, borderRadius: 3 }} />
        </View>
        {wallet.nextTier && (
          <Text style={{ fontSize: 9, color: '#aaa', marginTop: 4 }}>
            {wallet.nextTier} хүрэхэд {wallet.pointsToNext.toLocaleString()} оноо дутуу
          </Text>
        )}
      </View>

      {/* Tab switcher */}
      <View style={{ flexDirection: 'row', margin: 12, marginTop: 0,
                     backgroundColor: '#F0F0F0', borderRadius: 8, padding: 3 }}>
        {(['txns', 'points'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={{
            flex: 1, paddingVertical: 7, borderRadius: 6, alignItems: 'center',
            backgroundColor: tab === t ? '#fff' : 'transparent',
          }}>
            <Text style={{ fontSize: 11, fontWeight: tab === t ? '500' : '400',
                           color: tab === t ? '#1B3A5C' : '#888' }}>
              {t === 'txns' ? 'Гүйлгээний түүх' : 'Оноо түүх'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Жагсаалт */}
      <View style={{ paddingHorizontal: 12, paddingBottom: 20 }}>
        {tab === 'txns'
          ? wallet.transactions.map((tx: any) => (
              <TxItem key={tx.id} tx={tx} />
            ))
          : wallet.pointEvents.map((pe: any) => (
              <PointItem key={pe.id} event={pe} />
            ))
        }
      </View>
    </ScrollView>
  )
}
```

```typescript
// app/(customer)/tier-details.tsx — Tier дэлгэрэнгүй + давуу тал
// Tier бүрийн давуу тал, progress, дараагийн tier-д хэрхэн хүрэх
```

```typescript
// lib/api.ts-д WalletAPI нэмэх:
export const WalletAPI = {
  get:           () => request('/api/wallet'),
  deposit:       (data: { method: string; amount: number }) =>
                   request('/api/wallet/deposit', { method: 'POST', body: data }),
  withdraw:      (data: { bankName: string; accountNo: string; amount: number }) =>
                   request('/api/wallet/withdraw', { method: 'POST', body: data }),
  convertPoints: (points: number) =>
                   request('/api/wallet/convert-points', { method: 'POST', body: { points } }),
  giftPoints:    (toUserId: string, points: number) =>
                   request('/api/wallet/gift-points', { method: 'POST', body: { toUserId, points } }),
  transactions:  (params?: { type?: string; page?: number }) =>
                   request('/api/wallet/transactions', { params }),
}
```

---

## БЛОК 2 — ХЭРЭГЛЭГЧИЙН АККАУНТ

### 2.1 Профайл дэлгэц

```typescript
// app/(customer)/profile.tsx — БҮРЭН дахин бич

export default function ProfileScreen() {
  // Нэвтрээгүй бол → Login/Register CTA харуулна
  // Нэвтэрсэн бол → бүрэн профайл

  return дараах бүтэцтэй:
    1. Profile header (зураг, нэр, утас, tier badge, 3 stat)
    2. Урамшааллын оноо progress bar
    3. Menu sections (доор нарийвчилна)
}
```

**Профайлын menu бүтэц:**

```typescript
const PROFILE_MENU = [
  {
    section: 'Захиалга & Худалдан авалт',
    items: [
      { icon: '📦', title: 'Миний захиалга', sub: 'Бүх захиалга харах', route: '/(customer)/orders', badge: pendingCount },
      { icon: '❤️', title: 'Хадгалсан бараа', sub: 'Wish list', route: '/(customer)/wishlist' },
      { icon: '🔄', title: 'Буцаалт & Маргаан', sub: '48 цагт буцаах эрхтэй', route: '/(customer)/returns' },
      { icon: '📍', title: 'Хүргэлтийн хаяг', sub: 'Хадгалсан хаягууд', route: '/(customer)/addresses' },
    ],
  },
  {
    section: 'Хэтэвч & Урамшуулал',
    items: [
      { icon: '💰', title: 'eSeller хэтэвч', sub: balance + '₮', route: '/(customer)/wallet', highlight: true },
      { icon: '⭐', title: 'Gold гишүүнчлэл', sub: daysLeft + ' өдөр үлдлээ', route: '/(buyer)/gold-membership', badge: 'Gold' },
      { icon: '🎁', title: 'Купон & Промо код', sub: 'Идэвхтэй купон: ' + couponCount, route: '/(customer)/coupons', badgeNew: couponCount > 0 },
      { icon: '🏆', title: 'Урамшааллын оноо', sub: points + ' оноо', route: '/(customer)/tier-details' },
    ],
  },
  {
    section: 'Бизнес функц',
    items: [
      { icon: '🏪', title: 'Дэлгүүр нээх', sub: 'Эхний 3 сар 0% комисс', route: '/(owner)/register-shop', badgeNew: true },
      { icon: '🔗', title: 'Борлуулагч болох', sub: '10-20% комисс', route: '/(seller)/' },
      { icon: '🚚', title: 'Жолооч болох', sub: 'Орлого олох боломж', route: '/(driver)/' },
    ],
  },
  {
    section: 'Тохиргоо',
    items: [
      { icon: '👤', title: 'Профайл засах', sub: 'Нэр, зураг, утас', route: '/(customer)/edit-profile' },
      { icon: '🔔', title: 'Мэдэгдэл тохиргоо', sub: 'Push, Email', route: '/(customer)/notification-settings' },
      { icon: '🔒', title: 'Нууцлал & Аюулгүй байдал', sub: 'Биометр, нууц үг', route: '/(customer)/security' },
      { icon: '❓', title: 'Тусламж & Холбоо барих', sub: 'FAQ, чат дэмжлэг', route: '/(customer)/help' },
      { icon: '🚪', title: 'Гарах', danger: true, onPress: handleLogout },
    ],
  },
]
```

### 2.2 Шинэ screens

```
app/(customer)/
  wallet.tsx           ← ✅ Дээр бүрэн хийсэн
  tier-details.tsx     ← Tier давуу тал, progress, next tier
  wishlist.tsx         ← Хадгалсан бараа + remove + cart нэмэх
  addresses.tsx        ← Хаяг жагсаалт CRUD
  coupons.tsx          ← Купон жагсаалт + код оруулах
  returns.tsx          ← Буцаалтын хүсэлт + статус
  edit-profile.tsx     ← Нэр, зураг (expo-image-picker), утас
  notification-settings.tsx ← Push toggle бүр тусдаа
  security.tsx         ← Биометр toggle, нууц үг солих
  help.tsx             ← FAQ accordion + чат дэмжлэг
```

**app/(customer)/notification-settings.tsx:**
```typescript
const NOTIF_SETTINGS = [
  { key: 'order_status',    label: 'Захиалгын статус',       sub: 'Хүргэлт, баталгаажуулалт' },
  { key: 'delivery_update', label: 'Хүргэлтийн шинэчлэл',   sub: 'Жолооч авлаа, хүрнэ гэх мэт' },
  { key: 'flash_sale',      label: 'Flash sale мэдэгдэл',    sub: 'Эхлэхээс 1 цагийн өмнө' },
  { key: 'points_earned',   label: 'Оноо олсон',             sub: 'Оноо нэмэгдэх бүрт' },
  { key: 'tier_change',     label: 'Түвшин ахих',            sub: 'Bronze → Silver гэх мэт' },
  { key: 'gold_expiry',     label: 'Gold дуусах сануулга',   sub: '7 хоног, 3 хоногт' },
  { key: 'new_chat',        label: 'Шинэ мессеж',            sub: 'Борлуулагчаас мессеж ирэхэд' },
  { key: 'promo_coupon',    label: 'Промо & Купон',          sub: 'Тусгай санал, хөнгөлөлт' },
  { key: 'seller_new_order',label: 'Шинэ захиалга (Seller)', sub: 'Дэлгүүр эзэнд' },
]
// AsyncStorage-д хадгалах + POST /api/users/notification-prefs
```

---

## БЛОК 3 — ZARY.MN САЙЖРУУЛАЛТ

### 3.1 Хайлтын дэлгэц сайжруулах

```typescript
// app/(tabs)/search.tsx — дахин сайжруулах

Нэмэх зүйлс (Zary-д байдаг):
① Хугацаатай хямдрал фильтер (Flash sale бараа тусдаа)
② Байршлаар шүүх — Дүүрэг сонгох bottom sheet
③ Хүргэлтийн төлвөөр шүүх:
   "Өнөөдөр хүргэнэ" / "2-4 цагт" / "Маргааш"
④ Үнийн range slider (0 — 10,000,000₮)
⑤ Үнэлгээгээр шүүх (4★+, 4.5★+, 5★)
⑥ Онцлох бараа toggle (featured/promoted)
⑦ Хайлтын түүх (AsyncStorage, 10 хайлт)
⑧ Popular tags: iPhone, Nike, Samsung, Хувцас...

// Хайлтын URL params:
// /search?q=iphone&category=electronics&minPrice=0&maxPrice=2000000
//         &district=khan-uul&delivery=today&rating=4&featured=true
```

### 3.2 Бараа карт сайжруулах

```typescript
// components/ProductCard.tsx — дахин бич

interface ProductCardProps {
  product: Product
  layout: 'grid' | 'list'  // ← Zary-д list view байдаг
}

// Grid card (одоо байгаатай ижил + дараах нэмэлтүүд):
// ① Flash sale countdown timer (хэрэв flash sale бараа бол)
// ② "Өнөөдөр хүргэнэ" badge (хүргэлт боломжтой бол)
// ③ Stock тоо ("5 үлдлээ" → улаан warning)
// ④ Борлуулагч share товч (Share & Earn)
// ⑤ Бараа харьцуулах checkbox (max 3 бараа)

// List card (Zary-д байдаг — шинэ):
// Зүүн: зураг 80x80
// Баруун: нэр + үнэ + дэлгүүр + rating + товчнууд
```

### 3.3 Flash Sale систем

```typescript
// app/(customer)/flash-sale.tsx — ШИНЭ

Агуулга:
① Countdown timer (их тод, анимацтай)
② Flash sale бараа grid (хямдрал % том харагдана)
③ Gold гишүүнд: 1 цагийн өмнө нэвтрэх эрх

// Push notification:
// Flash sale эхлэхээс 2 цаг, 1 цаг, 15 минутын өмнө
// Gold → 2 цагийн өмнө, Silver → 1 цаг, Bronze → 30 мин

// API:
// GET /api/flash-sales/active    → идэвхтэй flash sale
// GET /api/flash-sales/upcoming  → удахгүй болох
```

### 3.4 24/7 AI чат дэмжлэг

```typescript
// app/chat/ai-support.tsx — ШИНЭ (Zary-д байдаг)

Антропик Claude API ашиглан:
① Хэрэглэгч асуулт тавина
② Claude-д системийн контекст өгнө:
   "Та eSeller.mn платформын дэмжлэгийн ажилтан.
    Монгол хэлээр хариулна. Захиалга, хүргэлт, 
    буцаалт, хэтэвч, оноо системийн талаар тусална."
③ Хэрэглэгч холбоо барих хүсвэл → Human agent руу шилжих

// Endpoint: POST /api/chat/ai
// Body: { message: string, history: ChatMessage[] }
// System prompt: eseller.mn-ийн бүрэн мэдлэгтэй assistant
```

### 3.5 Бараа онцлох (VIP/Featured)

```typescript
// Zary-д "Онцлох бараа" feature бий
// eSeller-д нэмэх:

// Seller/Owner нэмэлт төлбөр төлж барааг онцолно
// Home screen-д "Онцлох" хэсэгт гарна
// Feed-д "VIP зар" хэлбэрээр харагдана
// Оноогоор онцлох: 1,000 оноо = 7 хоногийн featured

// POST /api/products/{id}/feature
// { method: 'points' | 'payment', duration: 7 | 14 | 30 }
```

---

## БЛОК 4 — OWNER ROLE SCREENS

```
app/(owner)/
  _layout.tsx             ← 5 tab layout
  dashboard.tsx           ← Stats + revenue + шинэ захиалга
  products/
    index.tsx             ← Бараа жагсаалт (хайлт, stock filter)
    add.tsx               ← Бараа нэмэх (camera, variants, оноо тохиргоо)
    [id].tsx              ← Бараа засах + устгах
  orders/
    index.tsx             ← Status filter tabs
    [id].tsx              ← Дэлгэрэнгүй + timeline + чат
  analytics.tsx           ← Revenue chart + top products + export
  shop-settings.tsx       ← Дэлгүүр мэдээлэл + банк + цаг
  register-shop.tsx       ← 4 алхамт wizard
```

**Owner dashboard:**
```typescript
// app/(owner)/dashboard.tsx
// SellerAPI.stats() → { todayOrders, todayRevenue, totalProducts,
//                       pendingOrders, walletBalance, tier }
// Charts: victory-native line chart (сарын орлого)
// Quick actions: + Бараа нэмэх | Захиалга харах | Орлого гаргах
// Low stock warning: stock < 5 бараа байвал улаан алдаа
```

**Бараа нэмэх:**
```typescript
// app/(owner)/products/add.tsx
// expo-image-picker → max 8 зураг
// expo-camera → barcode scan → auto нэр/үнэ
// Variant builder: өнгө + хэмжээ matrix
// Оноо тохиргоо: тэрхүү бараа авахад хэдэн % оноо олох
// POST /api/owner/products
```

---

## БЛОК 5 — FEED/ЗАР СИСТЕМИЙН ШИНЭЧЛЭЛ

```typescript
// app/(tabs)/feed.tsx — дахин сайжруулах
// app/feed/[id].tsx  ← 404 засах (одоо байхгүй!)

// Feed types:
type FeedListing = {
  id: string
  title: string
  price: number
  category: FeedCategory
  location: { district: string; subdistrict: string }
  images: string[]
  isVip: boolean        // VIP зар — дэлгэцийн дээд хэсэгт
  isFeatured: boolean   // Онцлох
  condition: 'new' | 'like_new' | 'used' | 'for_parts'
  postedAt: Date
  expiresAt: Date       // 30 хоног идэвхтэй
  seller: { name: string; rating: number; phone: string; verified: boolean }
  viewCount: number
  savedCount: number
}

// Feed категори (12):
// Үл хөдлөх / Авто / Электроник / Хувцас / Гэр ахуй /
// Ажлын байр / Амьтан / Барилга / Дижитал / Тавилга / Спорт / Бусад

// app/feed/[id].tsx — ЗААВАЛ үүсгэх (404 байна!):
export default async function FeedDetailPage({ params }) {
  const listing = await FeedAPI.get(params.id)
  if (!listing) notFound()
  // Зураг gallery, үнэ, байршил, холбоо барих, хадгалах
}
```

---

## БЛОК 6 — ОНОО ОЛОХ TRIGGER-УУД

```typescript
// Энэ файлуудад earnPoints() дуудах:

// 1. Анхны бүртгэл:
// app/api/auth/register/route.ts → earnPoints(userId, 'REGISTER')

// 2. Профайл бүрэн:
// app/api/users/profile/route.ts → бүгд бөглөгдсөн бол earnPoints(userId, 'PROFILE_COMPLETE')

// 3. Захиалга баталгаажсан:
// app/api/orders/[id]/confirm/route.ts → earnPoints(userId, 'ORDER', { orderAmount, refId: orderId })

// 4. Бараа үнэлсэн:
// app/api/reviews/route.ts → earnPoints(userId, 'REVIEW', { refId: productId })

// 5. Өдөр бүр нэвтрэх:
// app/api/auth/login/route.ts → сүүлийн login өдрийг шалгааад
//   хэрэв өнөөдөр анх ороход → earnPoints(userId, 'DAILY_LOGIN')

// 6. Найз урих:
// app/api/auth/register/route.ts → referralCode байвал
//   referrer-д earnPoints(referrerId, 'REFERRAL', { refId: newUserId })

// 7. Gold авах:
// app/api/gold/subscribe/route.ts → earnPoints(userId, 'GOLD_SUBSCRIBE')

// 8. Төрсөн өдөр (cron job):
// scripts/birthday-cron.ts → өдөр бүр шалгаж, төрсөн өдөртэй хэрэглэгчдэд оноо
```

---

## MIGRATION & BUILD

```bash
# 1. Schema migrate
npx prisma migrate dev --name "wallet_points_flash_sale_feed"
npx prisma generate

# 2. Dependencies
npm install victory-native @shopify/react-native-skia
npm install @react-native-async-storage/async-storage
npm install expo-haptics

# 3. TypeScript шалгалт
npx tsc --noEmit 2>&1 | grep -v node_modules

# 4. Smoke test
npm run test:api
```

---

## АМЖИЛТЫН ШАЛГУУР

```
Файлын тоо: 47 → 75+

Шинэ screens:
  ✅ app/(customer)/wallet.tsx
  ✅ app/(customer)/tier-details.tsx
  ✅ app/(customer)/wishlist.tsx
  ✅ app/(customer)/addresses.tsx
  ✅ app/(customer)/coupons.tsx
  ✅ app/(customer)/returns.tsx
  ✅ app/(customer)/edit-profile.tsx
  ✅ app/(customer)/notification-settings.tsx
  ✅ app/(customer)/security.tsx
  ✅ app/(customer)/flash-sale.tsx
  ✅ app/(customer)/help.tsx
  ✅ app/(owner)/_layout.tsx + 7 screen
  ✅ app/feed/[id].tsx  ← 404 засах
  ✅ app/chat/ai-support.tsx

Шинэ API:
  ✅ GET/POST /api/wallet
  ✅ POST /api/wallet/deposit
  ✅ POST /api/wallet/withdraw
  ✅ POST /api/wallet/convert-points
  ✅ POST /api/wallet/gift-points
  ✅ POST /api/points/earn (internal)
  ✅ GET /api/flash-sales/active
  ✅ POST /api/products/{id}/feature

Flow тест:
  ✅ Захиалга → оноо нэмэгдэнэ → tier ахих
  ✅ Оноо → хэтэвчид хөрвүүлэх → захиалгад ашиглах
  ✅ Flash sale → countdown → Gold эрт нэвтрэх
  ✅ Feed зар → дэлгэрэнгүй хуудас (404 байхгүй)
  ✅ AI чат → асуулт → хариулт → human escalation
```

---

*eseller.mn mobile v2 prompt | Zary benchmark + Wallet/Points | 2026.04.12*
