# Eseller.mn — Loyalty Points + Eseller Gold Membership
## Claude Code Prompt — Full Loyalty & Membership System

Stack: Next.js 14 App Router, Prisma, Redis, BullMQ, React Query
Загвар: Amazon Prime + Shopify Points hybrid — Монголын зах зээлд тохируулсан

---

## 1. PRISMA SCHEMA

```prisma
// ─────────────────────────────────────────
// LOYALTY POINTS
// ─────────────────────────────────────────

model LoyaltyAccount {
  id             String   @id @default(cuid())
  userId         String   @unique
  balance        Int      @default(0)   // Одоогийн оноо
  lifetimeEarned Int      @default(0)   // Нийт цуглуулсан оноо (tier тооцоолоход)
  lifetimeSpent  Int      @default(0)   // Нийт зарцуулсан оноо
  tier           LoyaltyTier @default(BRONZE)
  tierUpdatedAt  DateTime @default(now())
  expiresAt      DateTime?              // Оноо дуусах огноо (жил бүр reset)
  lastActivityAt DateTime @default(now())
  createdAt      DateTime @default(now())

  user           User           @relation(fields:[userId], references:[id])
  transactions   LoyaltyTransaction[]
  redemptions    LoyaltyRedemption[]
}

model LoyaltyTransaction {
  id          String              @id @default(cuid())
  accountId   String
  type        LoyaltyTxType
  points      Int                             // + earn, - redeem/expire
  description String
  refType     String?                         // "order" | "review" | "referral" | "bonus"
  refId       String?                         // orderId, reviewId, etc.
  expiresAt   DateTime?                       // Individual point batch expiry
  createdAt   DateTime            @default(now())

  account     LoyaltyAccount @relation(fields:[accountId], references:[id])
}

enum LoyaltyTxType {
  EARN_PURCHASE        // Худалдан авалтаас оноо
  EARN_REVIEW          // Үнэлгээ бичснээс оноо
  EARN_REFERRAL        // Найз урьснаас оноо
  EARN_BIRTHDAY        // Төрсөн өдрийн бонус
  EARN_STREAK          // Дараалсан захиалгын бонус
  EARN_BONUS           // Admin тусгай бонус
  EARN_FIRST_PURCHASE  // Анхны захиалгын бонус
  EARN_PROFILE_COMPLETE// Профайл дүүргэснээс
  REDEEM_DISCOUNT      // Хямдрал болгон зарцуулах
  REDEEM_PRODUCT       // Бараа солих
  REDEEM_SHIPPING      // Хүргэлт үнэгүй болгох
  EXPIRE               // Хугацаа дуусгавар
  ADJUST               // Admin тохируулга
}

enum LoyaltyTier {
  BRONZE   // 0–4,999 lifetime points
  SILVER   // 5,000–19,999
  GOLD     // 20,000–49,999
  PLATINUM // 50,000+
}

model LoyaltyRedemption {
  id          String   @id @default(cuid())
  accountId   String
  userId      String
  type        String   // discount | free_shipping | product
  pointsUsed  Int
  valueAmount Float    // Equivalent ₮ value
  orderId     String?
  couponCode  String?  @unique
  isUsed      Boolean  @default(false)
  usedAt      DateTime?
  expiresAt   DateTime // 30 days after creation
  createdAt   DateTime @default(now())

  account     LoyaltyAccount @relation(fields:[accountId], references:[id])
}

// ─────────────────────────────────────────
// GOLD MEMBERSHIP (Amazon Prime загвар)
// ─────────────────────────────────────────

model GoldMembership {
  id              String           @id @default(cuid())
  userId          String           @unique
  plan            GoldPlan
  status          MembershipStatus @default(ACTIVE)
  startsAt        DateTime         @default(now())
  endsAt          DateTime
  autoRenew       Boolean          @default(true)
  paymentMethodId String?

  // Stats
  ordersThisTerm  Int              @default(0)
  savedAmount     Float            @default(0)  // Total savings from benefits
  freeDeliveries  Int              @default(0)

  // Trial
  isTrial         Boolean          @default(false)
  trialEndsAt     DateTime?

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  payments        MembershipPayment[]
  user            User             @relation(fields:[userId], references:[id])
}

enum GoldPlan {
  MONTHLY    // 19,900₮/сар
  QUARTERLY  // 49,900₮/3 сар
  ANNUAL     // 149,900₮/жил  ← хамгийн ашигтай
}

enum MembershipStatus {
  TRIAL      // Үнэгүй туршилт (30 хоног)
  ACTIVE     // Идэвхтэй
  CANCELLED  // Цуцлагдсан (endsAt хүртэл хэрэглэнэ)
  EXPIRED    // Дууссан
  PAUSED     // Түр зогссон
}

model MembershipPayment {
  id           String    @id @default(cuid())
  membershipId String
  amount       Float
  plan         GoldPlan
  paidAt       DateTime  @default(now())
  method       String    // qpay | card | bank
  refId        String?   // Payment provider ref
  invoiceId    String?
  membership   GoldMembership @relation(fields:[membershipId], references:[id])
}

// ─────────────────────────────────────────
// REFERRAL SYSTEM
// ─────────────────────────────────────────

model Referral {
  id            String   @id @default(cuid())
  referrerId    String                     // Урьсан хэрэглэгч
  referredId    String?                    // Бүртгүүлсэн хэрэглэгч
  code          String   @unique           // Урилгын код (6 тэмдэгт)
  status        String   @default("pending") // pending | completed | rewarded
  referrerPoints Int     @default(0)       // Урьсан хүн авах оноо
  referredPoints Int     @default(0)       // Бүртгүүлсэн хүн авах оноо
  completedAt   DateTime?
  createdAt     DateTime @default(now())

  referrer      User     @relation("Referrer", fields:[referrerId], references:[id])
  referred      User?    @relation("Referred",  fields:[referredId], references:[id])
}
```

---

## 2. LOYALTY CONFIG — Admin-configurable earn/redeem rules

```typescript
// lib/loyalty/config.ts

export const LOYALTY_CONFIG = {

  // ─── Earn rules ───────────────────────────────────────
  earn: {
    purchaseRate:      1,        // 1 оноо per 100₮ spent (= 1%)
    reviewBonus:       100,      // Үнэлгээ бичих бүрт
    firstPurchase:     500,      // Анхны захиалга
    profileComplete:   200,      // Профайл дүүргэх
    birthdayBonus:     1000,     // Төрсөн өдөр
    referralReferrer:  300,      // Найзаа урьснаас
    referralReferred:  200,      // Урилгаар бүртгүүлснээс
    streakBonus: {               // Дараалсан захиалгын бонус
      3:  150,                   // 3 дараалсан захиалга
      7:  500,                   // 7 дараалсан
      30: 2000,                  // 30 дараалсан
    },
    goldMultiplier:    2,        // Gold гишүүд 2x оноо авна
    tierMultipliers: {
      BRONZE:   1.0,
      SILVER:   1.2,             // +20% bonus points
      GOLD:     1.5,             // +50% bonus points
      PLATINUM: 2.0,             // 2x points
    },
  },

  // ─── Redeem rules ─────────────────────────────────────
  redeem: {
    pointValue:          5,      // 1 оноо = 5₮ (100 оноо = 500₮)
    minRedeemPoints:     200,    // Хамгийн бага 200 оноо (= 1,000₮)
    maxRedeemPct:        30,     // Захиалгын 30%-г оноогоор төлж болно
    freeShippingCost:    500,    // Үнэгүй хүргэлт = 500 оноо
  },

  // ─── Tier thresholds (lifetime points) ────────────────
  tiers: {
    BRONZE:   { min: 0,      max: 4999,  label: 'Хүрэл',    color: '#CD7F32' },
    SILVER:   { min: 5000,   max: 19999, label: 'Мөнгө',    color: '#C0C0C0' },
    GOLD:     { min: 20000,  max: 49999, label: 'Алт',       color: '#FFD700' },
    PLATINUM: { min: 50000,  max: null,  label: 'Платинум', color: '#E5E4E2' },
  },

  // ─── Point expiry ──────────────────────────────────────
  expiryMonths: 12,              // Оноо 12 сарын дараа дуусна

  // ─── Gold membership pricing ──────────────────────────
  gold: {
    plans: {
      MONTHLY:   { price: 19900,  duration: 30,  label: '1 сар' },
      QUARTERLY: { price: 49900,  duration: 90,  label: '3 сар' },
      ANNUAL:    { price: 149900, duration: 365, label: '1 жил' },
    },
    trialDays: 30,
    benefits: [
      'Бүх захиалганд үнэгүй хүргэлт',
      'Оноо 2x хурдтай цуглуулах',
      'Хямдрал эртхэн харах (flash sale -2 цаг)',
      'Онцгой Gold хямдрал (%5-10 нэмэлт)',
      'Захиалгын тэргүүн дараалал',
      'Чатын тэргүүн хариу',
      'Сар бүр 500 бонус оноо',
      'Эхний 3 буцаалт үнэгүй',
    ],
  },
}
```

---

## 3. LOYALTY SERVICE

```typescript
// lib/loyalty/LoyaltyService.ts

class LoyaltyService {

  // ─── Оноо нэмэх ────────────────────────────────────────
  async earn(
    userId:      string,
    type:        LoyaltyTxType,
    points:      number,
    description: string,
    refType?:    string,
    refId?:      string
  ): Promise<LoyaltyTransaction> {

    // Apply tier + gold multiplier
    const account = await this.getOrCreate(userId)
    const hasGold = await this.hasActiveGold(userId)
    const tierMult = LOYALTY_CONFIG.earn.tierMultipliers[account.tier]
    const goldMult = hasGold ? LOYALTY_CONFIG.earn.goldMultiplier : 1
    const finalPoints = Math.round(points * tierMult * (hasGold ? goldMult / tierMult : 1))

    const expiresAt = addMonths(new Date(), LOYALTY_CONFIG.expiryMonths)

    const tx = await db.$transaction([
      db.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type, points: finalPoints, description,
          refType, refId, expiresAt,
        }
      }),
      db.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          balance:        { increment: finalPoints },
          lifetimeEarned: { increment: finalPoints },
          lastActivityAt: new Date(),
        }
      }),
    ])

    // Check tier upgrade
    await this.checkAndUpdateTier(userId)

    // Notify if milestone reached
    await this.checkMilestones(userId, account.lifetimeEarned + finalPoints)

    return tx[0]
  }

  // ─── Захиалгаас оноо тооцоолох ─────────────────────────
  async earnFromOrder(userId: string, orderId: string, amount: number): Promise<void> {
    const hasGold = await this.hasActiveGold(userId)
    const basePoints = Math.floor(amount / 100) * LOYALTY_CONFIG.earn.purchaseRate
    const account = await this.getOrCreate(userId)
    const tierMult = LOYALTY_CONFIG.earn.tierMultipliers[account.tier]
    const goldMult = hasGold ? LOYALTY_CONFIG.earn.goldMultiplier : 1
    const finalPoints = Math.round(basePoints * tierMult * goldMult)

    await this.earn(
      userId, 'EARN_PURCHASE',
      finalPoints,
      `Захиалга #${orderId} — ${amount.toLocaleString()}₮ худалдан авалт`,
      'order', orderId
    )

    // Check streak bonus
    await this.checkStreakBonus(userId)
  }

  // ─── Оноо зарцуулах ────────────────────────────────────
  async redeem(
    userId:    string,
    points:    number,
    type:      'discount' | 'free_shipping' | 'product',
    orderId?:  string
  ): Promise<LoyaltyRedemption> {
    const account = await this.getOrCreate(userId)

    if (account.balance < points) {
      throw new InsufficientPointsError(`Оноо хүрэлцэхгүй байна. Байгаа оноо: ${account.balance}`)
    }

    if (points < LOYALTY_CONFIG.redeem.minRedeemPoints) {
      throw new ValidationError(`Хамгийн бага ${LOYALTY_CONFIG.redeem.minRedeemPoints} оноо зарцуулна`)
    }

    const valueAmount = points * LOYALTY_CONFIG.redeem.pointValue
    const couponCode  = `PTS${nanoid(6).toUpperCase()}`
    const expiresAt   = addDays(new Date(), 30)

    const [redemption] = await db.$transaction([
      db.loyaltyRedemption.create({
        data: {
          accountId: account.id,
          userId, type, pointsUsed: points,
          valueAmount, couponCode, expiresAt,
          orderId,
        }
      }),
      db.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type:        'REDEEM_DISCOUNT',
          points:      -points,
          description: `${points} оноо зарцуулав (${valueAmount.toLocaleString()}₮)`,
          refType:     'redemption',
        }
      }),
      db.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          balance:      { increment: -points },
          lifetimeSpent: { increment: points },
        }
      }),
    ])

    return redemption
  }

  // ─── Tier шинэчлэх ─────────────────────────────────────
  async checkAndUpdateTier(userId: string): Promise<void> {
    const account = await db.loyaltyAccount.findUnique({ where: { userId } })
    if (!account) return

    const newTier = this.calculateTier(account.lifetimeEarned)
    if (newTier !== account.tier) {
      await db.loyaltyAccount.update({
        where: { userId },
        data: { tier: newTier, tierUpdatedAt: new Date() }
      })
      await notifyUser(userId, 'LOYALTY_TIER_UPGRADE', {
        oldTier: account.tier,
        newTier,
        tierLabel: LOYALTY_CONFIG.tiers[newTier].label,
      })
    }
  }

  calculateTier(lifetimePoints: number): LoyaltyTier {
    if (lifetimePoints >= 50000) return 'PLATINUM'
    if (lifetimePoints >= 20000) return 'GOLD'
    if (lifetimePoints >= 5000)  return 'SILVER'
    return 'BRONZE'
  }

  // ─── Дараалсан захиалгын бонус ─────────────────────────
  async checkStreakBonus(userId: string): Promise<void> {
    const recentOrders = await db.order.count({
      where: {
        buyerId:       userId,
        paymentStatus: 'PAID',
        createdAt:     { gte: subDays(new Date(), 30) },
      }
    })

    const bonusMap = LOYALTY_CONFIG.earn.streakBonus
    const bonus = bonusMap[recentOrders as keyof typeof bonusMap]
    if (bonus) {
      await this.earn(userId, 'EARN_STREAK', bonus, `${recentOrders} дараалсан захиалгын бонус`)
    }
  }

  // ─── Оноо дуусах дат шалгах (cron) ────────────────────
  async expireOldPoints(): Promise<void> {
    const now = new Date()
    const expiring = await db.loyaltyTransaction.findMany({
      where: {
        type:       { in: ['EARN_PURCHASE', 'EARN_REVIEW', 'EARN_REFERRAL', 'EARN_BONUS'] },
        expiresAt:  { lte: now },
        points:     { gt: 0 },
        // Not yet expired (check via matching expire tx)
      }
    })

    for (const tx of expiring) {
      const account = await db.loyaltyAccount.findUnique({ where: { id: tx.accountId } })
      if (!account || account.balance <= 0) continue

      const expiringPoints = Math.min(tx.points, account.balance)
      if (expiringPoints <= 0) continue

      await db.$transaction([
        db.loyaltyTransaction.create({
          data: {
            accountId:   tx.accountId,
            type:        'EXPIRE',
            points:      -expiringPoints,
            description: 'Оноо хугацаа дуусав',
            refId:       tx.id,
          }
        }),
        db.loyaltyAccount.update({
          where: { id: tx.accountId },
          data: { balance: { increment: -expiringPoints } }
        }),
      ])

      await notifyUser(account.userId, 'POINTS_EXPIRING', { points: expiringPoints })
    }
  }

  // ─── Helpers ───────────────────────────────────────────
  async getOrCreate(userId: string): Promise<LoyaltyAccount> {
    return db.loyaltyAccount.upsert({
      where:  { userId },
      create: { userId },
      update: {},
    })
  }

  async hasActiveGold(userId: string): Promise<boolean> {
    const membership = await db.goldMembership.findUnique({ where: { userId } })
    return !!membership && membership.status === 'ACTIVE' && membership.endsAt > new Date()
  }
}

export const loyaltyService = new LoyaltyService()
```

---

## 4. GOLD MEMBERSHIP SERVICE

```typescript
// lib/loyalty/GoldMembershipService.ts

class GoldMembershipService {

  // ─── Гишүүнчлэл үүсгэх (туршилт) ──────────────────────
  async startTrial(userId: string): Promise<GoldMembership> {
    const existing = await db.goldMembership.findUnique({ where: { userId } })
    if (existing) throw new ConflictError('Та өмнө нь Gold гишүүнчлэлтэй байсан')

    const trialEndsAt = addDays(new Date(), LOYALTY_CONFIG.gold.trialDays)

    const membership = await db.goldMembership.create({
      data: {
        userId, plan: 'MONTHLY', status: 'TRIAL',
        startsAt:   new Date(),
        endsAt:     trialEndsAt,
        trialEndsAt,
        isTrial:    true,
        autoRenew:  true,
      }
    })

    // Give trial welcome bonus
    await loyaltyService.earn(userId, 'EARN_BONUS', 500, 'Gold туршилт эхэллээ 🎉')

    await notifyUser(userId, 'GOLD_TRIAL_STARTED', {
      endsAt: trialEndsAt,
      benefits: LOYALTY_CONFIG.gold.benefits,
    })

    return membership
  }

  // ─── Гишүүнчлэл идэвхжүүлэх (төлбөр дараа) ───────────
  async activate(userId: string, plan: GoldPlan, paymentId: string): Promise<GoldMembership> {
    const planConfig = LOYALTY_CONFIG.gold.plans[plan]
    const now        = new Date()

    const existing = await db.goldMembership.findUnique({ where: { userId } })

    if (existing && ['ACTIVE', 'CANCELLED'].includes(existing.status)) {
      // Extend existing membership
      const newEndsAt = existing.status === 'ACTIVE'
        ? addDays(existing.endsAt, planConfig.duration)
        : addDays(now,             planConfig.duration)

      return db.goldMembership.update({
        where: { userId },
        data: {
          plan, status: 'ACTIVE',
          endsAt:   newEndsAt,
          isTrial:  false,
          payments: {
            create: {
              amount: planConfig.price,
              plan,
              paidAt: now,
              method: 'qpay',
              refId:  paymentId,
            }
          }
        }
      })
    }

    const membership = await db.goldMembership.upsert({
      where:  { userId },
      create: {
        userId, plan, status: 'ACTIVE',
        startsAt:  now,
        endsAt:    addDays(now, planConfig.duration),
        isTrial:   false,
        autoRenew: true,
        payments: {
          create: {
            amount: planConfig.price,
            plan,
            paidAt: now,
            method: 'qpay',
            refId:  paymentId,
          }
        }
      },
      update: {
        plan, status: 'ACTIVE',
        endsAt:   addDays(now, planConfig.duration),
        isTrial:  false,
        payments: {
          create: {
            amount: planConfig.price, plan,
            paidAt: now, method: 'qpay', refId: paymentId,
          }
        }
      }
    })

    // Activation bonus: 500 points
    await loyaltyService.earn(userId, 'EARN_BONUS', 500, 'Gold гишүүнчлэл идэвхжлэа 🥇')

    await notifyUser(userId, 'GOLD_ACTIVATED', { plan: planConfig.label, endsAt: membership.endsAt })

    return membership
  }

  // ─── Цуцлах ────────────────────────────────────────────
  async cancel(userId: string, reason?: string): Promise<void> {
    const membership = await db.goldMembership.findUnique({ where: { userId } })
    if (!membership || membership.status !== 'ACTIVE') {
      throw new NotFoundError('Идэвхтэй гишүүнчлэл олдсонгүй')
    }

    await db.goldMembership.update({
      where: { userId },
      data:  { status: 'CANCELLED', autoRenew: false }
    })

    // Access continues until endsAt — don't cut immediately
    await notifyUser(userId, 'GOLD_CANCELLED', {
      accessUntil: membership.endsAt,
      reason,
    })
  }

  // ─── Автомат сунгалт (cron) ────────────────────────────
  async processAutoRenewals(): Promise<void> {
    const renewalDue = await db.goldMembership.findMany({
      where: {
        status:    'ACTIVE',
        autoRenew: true,
        endsAt:    { lte: addDays(new Date(), 1) },
        isTrial:   false,
      },
      include: { user: true }
    })

    for (const membership of renewalDue) {
      try {
        const planConfig = LOYALTY_CONFIG.gold.plans[membership.plan]

        // Charge via saved payment method
        const payment = await chargePaymentMethod(
          membership.paymentMethodId!,
          planConfig.price,
          `Eseller Gold ${planConfig.label} сунгалт`
        )

        if (payment.success) {
          await this.activate(membership.userId, membership.plan, payment.id)
        } else {
          // Renewal failed — notify, give 3-day grace period
          await db.goldMembership.update({
            where: { userId: membership.userId },
            data:  { endsAt: addDays(membership.endsAt, 3) }
          })
          await notifyUser(membership.userId, 'GOLD_RENEWAL_FAILED', {
            amount: planConfig.price,
            gracePeriodEnds: addDays(membership.endsAt, 3),
          })
        }
      } catch (err) {
        console.error(`Gold renewal failed for ${membership.userId}:`, err)
      }
    }
  }

  // ─── Сарын 500 бонус оноо (Gold гишүүдэд) ─────────────
  async grantMonthlyBonusPoints(): Promise<void> {
    const activeMembers = await db.goldMembership.findMany({
      where: { status: 'ACTIVE', isTrial: false }
    })

    for (const member of activeMembers) {
      await loyaltyService.earn(
        member.userId, 'EARN_BONUS',
        500, 'Eseller Gold сарын бонус оноо 🏆'
      )
    }
  }
}

export const goldService = new GoldMembershipService()
```

---

## 5. LOYALTY WIDGET — Хэрэглэгчийн профайл дахь оноо хэсэг

```tsx
// components/loyalty/LoyaltyWidget.tsx
'use client'

export function LoyaltyWidget({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ['loyalty', userId],
    queryFn:  () => fetch(`/api/loyalty/${userId}`).then(r => r.json()),
  })

  if (!data) return <LoyaltyWidgetSkeleton />

  const account    = data.account
  const nextTier   = getNextTier(account.tier)
  const progress   = getProgressToNextTier(account.lifetimeEarned, account.tier)
  const goldMember = data.goldMembership

  return (
    <div style={{
      background: '#1A1A1A',
      border:     '0.5px solid #3D3D3D',
      borderRadius: '16px',
      overflow:   'hidden',
    }}>
      {/* Header — tier badge */}
      <div style={{
        padding: '16px 20px',
        background: TIER_GRADIENTS[account.tier],
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TierIcon tier={account.tier} size={32} />
          <div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              {LOYALTY_CONFIG.tiers[account.tier].label} гишүүн
            </p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>
              {account.balance.toLocaleString()} оноо
            </p>
          </div>
        </div>
        {goldMember?.status === 'ACTIVE' && (
          <GoldBadge expiresAt={goldMember.endsAt} />
        )}
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #3D3D3D' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: '#A0A0A0' }}>
              {LOYALTY_CONFIG.tiers[nextTier].label} хүрэхэд
            </span>
            <span style={{ fontSize: '11px', color: '#A0A0A0' }}>
              {(LOYALTY_CONFIG.tiers[nextTier].min - account.lifetimeEarned).toLocaleString()} оноо дутж байна
            </span>
          </div>
          <div style={{ height: '6px', background: '#2A2A2A', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '99px',
              width: `${progress}%`,
              background: TIER_COLORS[account.tier],
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
        {[
          { label: 'Оноо зарцуулах', icon: 'Gift',   action: () => openRedeemModal() },
          { label: 'Гүйлгээний түүх', icon: 'History', action: () => router.push('/profile/points') },
          { label: 'Gold болох',      icon: 'Star',   action: () => router.push('/gold'), highlight: !goldMember },
        ].map((item, i) => (
          <button key={i} onClick={item.action}
            style={{
              padding: '12px 8px',
              background: item.highlight ? 'rgba(255,215,0,0.08)' : 'transparent',
              borderRight: i < 2 ? '0.5px solid #3D3D3D' : 'none',
              border: 'none', cursor: 'pointer', transition: 'background 0.15s',
              color: item.highlight ? '#FFD700' : '#A0A0A0',
              fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
            <IconComponent name={item.icon} size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Point value hint */}
      <div style={{ padding: '10px 20px', background: '#0F0F0F', fontSize: '11px', color: '#555', textAlign: 'center' }}>
        100 оноо = 500₮ · 1 захиалгын 30% хүртэл оноогоор төлж болно
      </div>
    </div>
  )
}

const TIER_GRADIENTS: Record<LoyaltyTier, string> = {
  BRONZE:   'linear-gradient(135deg, #8B6914, #CD7F32)',
  SILVER:   'linear-gradient(135deg, #888, #C0C0C0)',
  GOLD:     'linear-gradient(135deg, #B8860B, #FFD700)',
  PLATINUM: 'linear-gradient(135deg, #6B6B6B, #E5E4E2)',
}
```

---

## 6. GOLD MEMBERSHIP PAGE — /gold

```tsx
// app/gold/page.tsx — Public membership sales page

export default async function GoldMembershipPage() {
  const session    = await getServerSession()
  const membership = session?.user ? await getGoldMembership(session.user.id) : null

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <GoldStarIcon size={24} color="#FFD700" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFD700', letterSpacing: '0.1em' }}>
            ESELLER GOLD
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '16px' }}>
          Илүү хурдан. Илүү хямд.<br />
          <span style={{ color: '#FFD700' }}>Илүү ухаалаг.</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#A0A0A0', maxWidth: '500px', margin: '0 auto 32px' }}>
          Eseller Gold гишүүн болж, жил бүр дундажаар <strong style={{ color: '#FFD700' }}>200,000₮+</strong> хэмнэнэ.
        </p>
        {!membership && (
          <Link href="/gold/trial">
            <button style={{ background: '#FFD700', color: '#0A0A0A', fontSize: '16px', fontWeight: 800, padding: '16px 40px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
              30 хоног үнэгүй туршиж үзэх →
            </button>
          </Link>
        )}
      </section>

      {/* Benefits */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
        <GoldBenefitsGrid />
      </section>

      {/* Pricing */}
      <section style={{ background: '#111', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '48px' }}>
            Хэдэн сар ашиглах вэ?
          </h2>
          <GoldPricingCards currentPlan={membership?.plan} onSelect={handlePlanSelect} />
        </div>
      </section>

      {/* Savings calculator */}
      <SavingsCalculator />

      {/* FAQ */}
      <GoldFAQ />
    </div>
  )
}

function GoldBenefitsGrid() {
  const benefits = [
    { icon: 'Truck',    title: 'Үнэгүй хүргэлт',       desc: 'Бүх захиалганд 50,000₮-с доош ч үнэгүй', color: '#22C55E' },
    { icon: 'Zap',      title: 'Оноо 2x хурдтай',       desc: 'Захиалга бүрт 2 дахин оноо цуглуулна',   color: '#F59E0B' },
    { icon: 'Clock',    title: 'Flash sale +2 цаг',      desc: 'Хямдрал бусдаас 2 цаг эртхэн харна',     color: '#E8242C' },
    { icon: 'Tag',      title: '5-10% нэмэлт хямдрал',  desc: 'Gold гишүүдэд онцгой үнэ',               color: '#FFD700' },
    { icon: 'Star',     title: 'Сар бүр 500 бонус оноо', desc: 'Захиалгагүй ч автомат 500 оноо',        color: '#7F77DD' },
    { icon: 'RotateCcw','title': 'Эхний 3 буцаалт үнэгүй','desc': 'Сэтгэл ханамжгүй бол хялбар буцаалт', color: '#3B82F6' },
    { icon: 'Headphones','title': 'Тэргүүн дэмжлэг',    desc: 'Чатын хариу 30 мин-аас бага',            color: '#1D9E75' },
    { icon: 'Gift',     title: 'Төрсөн өдрийн бонус',   desc: '2x оноо + онцгой сюрприз',               color: '#E8242C' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
      {benefits.map((b, i) => (
        <div key={i} style={{
          background: '#1A1A1A', border: '0.5px solid #3D3D3D', borderRadius: '12px', padding: '20px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', marginBottom: '12px',
            background: `${b.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconComponent name={b.icon} size={20} color={b.color} />
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>{b.title}</h3>
          <p style={{ fontSize: '12px', color: '#A0A0A0', lineHeight: 1.6 }}>{b.desc}</p>
        </div>
      ))}
    </div>
  )
}

function GoldPricingCards({ currentPlan, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
      {Object.entries(LOYALTY_CONFIG.gold.plans).map(([planKey, plan]) => {
        const isAnnual    = planKey === 'ANNUAL'
        const isCurrent   = currentPlan === planKey
        const monthlyRate = (plan.price / (plan.duration / 30)).toFixed(0)

        return (
          <div key={planKey} style={{
            background:    '#1A1A1A',
            border:        isAnnual ? '2px solid #FFD700' : '0.5px solid #3D3D3D',
            borderRadius:  '16px',
            padding:       '24px',
            position:      'relative',
            textAlign:     'center',
          }}>
            {isAnnual && (
              <div style={{
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: '#FFD700', color: '#0A0A0A', fontSize: '11px', fontWeight: 700,
                padding: '4px 16px', borderRadius: '99px',
              }}>
                ХАМГИЙН АШИГТАЙ
              </div>
            )}

            <p style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '8px' }}>{plan.label}</p>
            <p style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              {plan.price.toLocaleString()}₮
            </p>
            <p style={{ fontSize: '12px', color: '#A0A0A0', marginBottom: '20px' }}>
              сард {Number(monthlyRate).toLocaleString()}₮
            </p>

            <button
              onClick={() => onSelect(planKey)}
              disabled={isCurrent}
              style={{
                width:        '100%',
                padding:      '12px',
                borderRadius: '8px',
                fontWeight:   700,
                fontSize:     '14px',
                cursor:       isCurrent ? 'not-allowed' : 'pointer',
                border:       'none',
                background:   isCurrent ? '#2A2A2A' : isAnnual ? '#FFD700' : '#E8242C',
                color:        isCurrent ? '#555' : isAnnual ? '#0A0A0A' : '#fff',
              }}>
              {isCurrent ? 'Одоогийн төлөвлөгөө' : 'Сонгох'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
```

---

## 7. REDEEM MODAL — Оноо зарцуулах

```tsx
// components/loyalty/RedeemModal.tsx
'use client'

export function RedeemModal({ account, orderId, orderTotal, onApply, onClose }) {
  const [points, setPoints] = useState(0)
  const maxRedeemable = Math.min(
    account.balance,
    Math.floor((orderTotal * LOYALTY_CONFIG.redeem.maxRedeemPct / 100) / LOYALTY_CONFIG.redeem.pointValue)
  )
  const discount = points * LOYALTY_CONFIG.redeem.pointValue

  const handleRedeem = async () => {
    if (points < LOYALTY_CONFIG.redeem.minRedeemPoints) return
    const result = await fetch('/api/loyalty/redeem', {
      method: 'POST',
      body:   JSON.stringify({ points, orderId, type: 'discount' }),
    }).then(r => r.json())
    onApply({ couponCode: result.couponCode, discountAmount: result.valueAmount })
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
        Оноо зарцуулах
      </h2>
      <p style={{ fontSize: '13px', color: '#A0A0A0', marginBottom: '20px' }}>
        Одоогийн оноо: <strong style={{ color: '#FFD700' }}>{account.balance.toLocaleString()}</strong>
        · 100 оноо = 500₮
      </p>

      {/* Slider */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#A0A0A0' }}>
          <span>Хамгийн бага: {LOYALTY_CONFIG.redeem.minRedeemPoints} оноо</span>
          <span>Хамгийн их: {maxRedeemable} оноо</span>
        </div>
        <input type="range"
          min={LOYALTY_CONFIG.redeem.minRedeemPoints}
          max={maxRedeemable}
          step={LOYALTY_CONFIG.redeem.minRedeemPoints}
          value={points}
          onChange={e => setPoints(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', alignItems: 'baseline' }}>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#FFD700' }}>{points} оноо</span>
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#22C55E' }}>= {discount.toLocaleString()}₮ хямдрал</span>
        </div>
      </div>

      {/* Quick select */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[200, 500, 1000, maxRedeemable].filter((v, i, a) => a.indexOf(v) === i && v <= maxRedeemable).map(v => (
          <button key={v} onClick={() => setPoints(v)}
            style={{
              flex: 1, padding: '6px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
              background: points === v ? '#FFD700' : '#2A2A2A',
              color:      points === v ? '#0A0A0A' : '#A0A0A0',
              border:     '0.5px solid #3D3D3D',
            }}>
            {v === maxRedeemable ? 'Хамгийн их' : `${v} оноо`}
          </button>
        ))}
      </div>

      <Button variant="primary" className="w-full"
        disabled={points < LOYALTY_CONFIG.redeem.minRedeemPoints}
        onClick={handleRedeem}>
        {discount.toLocaleString()}₮ хямдруулж захиалах
      </Button>
      <p style={{ fontSize: '11px', color: '#555', textAlign: 'center', marginTop: '8px' }}>
        Захиалга дуусгаснаар оноо шууд хасагдана
      </p>
    </Modal>
  )
}
```

---

## 8. API ROUTES

```typescript
// GET  /api/loyalty/[userId]           — account + membership info
// POST /api/loyalty/redeem             — redeem points for discount
// GET  /api/loyalty/[userId]/history   — transaction history
// GET  /api/loyalty/[userId]/tiers     — tier info + progress

// GET  /api/gold/plans                 — available plans + pricing
// POST /api/gold/trial                 — start free trial
// POST /api/gold/subscribe             — purchase plan (post-payment)
// POST /api/gold/cancel                — cancel membership
// GET  /api/gold/status                — current membership status

// POST /api/referral/generate          — generate referral code
// POST /api/referral/apply/[code]      — apply referral code on register

// POST /api/loyalty/admin/adjust       — admin manual adjustment
// POST /api/loyalty/admin/grant-bonus  — admin bulk bonus grant

// app/api/loyalty/redeem/route.ts
export async function POST(req: Request) {
  const session = await requireAuth(req)
  const { points, orderId, type } = await req.json()

  const redemption = await loyaltyService.redeem(session.user.id, points, type, orderId)

  return Response.json({
    couponCode:   redemption.couponCode,
    valueAmount:  redemption.valueAmount,
    pointsUsed:   redemption.pointsUsed,
    expiresAt:    redemption.expiresAt,
  })
}

// app/api/gold/subscribe/route.ts
export async function POST(req: Request) {
  const session = await requireAuth(req)
  const { plan, paymentId } = await req.json()

  const membership = await goldService.activate(session.user.id, plan, paymentId)

  return Response.json(membership)
}
```

---

## 9. CHECKOUT INTEGRATION

```tsx
// In checkout flow — show loyalty options
function CheckoutLoyaltySection({ userId, orderTotal }) {
  const { data: loyalty } = useQuery(['loyalty', userId], () => fetch(`/api/loyalty/${userId}`).then(r => r.json()))
  const [redeemOpen, setRedeemOpen]   = useState(false)
  const [appliedDiscount, setApplied] = useState<number>(0)

  if (!loyalty?.account?.balance) return null

  const pointValue = LOYALTY_CONFIG.redeem.pointValue
  const maxDiscount = Math.min(
    loyalty.account.balance * pointValue,
    orderTotal * LOYALTY_CONFIG.redeem.maxRedeemPct / 100
  )

  return (
    <div style={{
      background: 'rgba(255,215,0,0.05)', border: '0.5px solid rgba(255,215,0,0.2)',
      borderRadius: '10px', padding: '14px 16px', marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GoldStarIcon size={16} color="#FFD700" />
          <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>
            {loyalty.account.balance.toLocaleString()} оноо байна
          </span>
          <span style={{ fontSize: '11px', color: '#A0A0A0' }}>
            (≈ {(loyalty.account.balance * pointValue).toLocaleString()}₮ хүртэл)
          </span>
        </div>
        {appliedDiscount > 0 ? (
          <span style={{ fontSize: '13px', color: '#22C55E', fontWeight: 600 }}>
            -{appliedDiscount.toLocaleString()}₮ хасагдсан
          </span>
        ) : (
          <button onClick={() => setRedeemOpen(true)}
            style={{ fontSize: '12px', color: '#FFD700', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Ашиглах →
          </button>
        )}
      </div>

      {redeemOpen && (
        <RedeemModal
          account={loyalty.account}
          orderTotal={orderTotal}
          onApply={({ couponCode, discountAmount }) => {
            setApplied(discountAmount)
            setRedeemOpen(false)
          }}
          onClose={() => setRedeemOpen(false)}
        />
      )}
    </div>
  )
}
```

---

## 10. CRON JOBS

```typescript
// app/api/cron/loyalty/route.ts
// Schedule: daily at 00:00 via Vercel Cron

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const results = await Promise.allSettled([
    loyaltyService.expireOldPoints(),        // Хугацаа дуусах оноо устгах
    goldService.processAutoRenewals(),        // Gold автомат сунгалт
    goldService.grantMonthlyBonusPoints(),    // Сарын 500 бонус (1-ний өдөр)
    notifyExpiringPoints(),                   // 30 хоногийн дотор дуусах оноо мэдэгдэх
    updateInactiveMemberTiers(),              // Идэвхгүй хэрэглэгчийн tier шалгах
  ])

  return Response.json({ results: results.map(r => r.status) })
}

async function notifyExpiringPoints() {
  const thirtyDaysFromNow = addDays(new Date(), 30)
  const expiring = await db.loyaltyTransaction.findMany({
    where: {
      expiresAt: { lte: thirtyDaysFromNow, gte: new Date() },
      points:    { gt: 0 },
      type:      { in: ['EARN_PURCHASE', 'EARN_REVIEW', 'EARN_BONUS'] },
    },
    include: { account: true },
    distinct: ['accountId'],
  })

  for (const tx of expiring) {
    await notifyUser(tx.account.userId, 'POINTS_EXPIRING_SOON', {
      points:    tx.account.balance,
      expiresAt: tx.expiresAt,
    })
  }
}
```

---

## 11. IMPLEMENTATION CHECKLIST

```
Week 1 — Points core:
  [ ] Prisma migration: LoyaltyAccount, LoyaltyTransaction, LoyaltyRedemption
  [ ] LoyaltyService: earn, redeem, tier check
  [ ] earnFromOrder() hook in order service
  [ ] /api/loyalty/* routes
  [ ] LoyaltyWidget component
  [ ] Profile page: points balance + history

Week 2 — Gold membership:
  [ ] Prisma migration: GoldMembership, MembershipPayment
  [ ] GoldMembershipService: startTrial, activate, cancel
  [ ] /gold public page (hero, benefits, pricing)
  [ ] QPay payment integration for plans
  [ ] Gold badge in navbar + profile

Week 3 — Checkout + UX:
  [ ] CheckoutLoyaltySection (redeem at checkout)
  [ ] RedeemModal with slider
  [ ] Points earn notification (toast after order)
  [ ] Tier upgrade celebration modal
  [ ] Gold early access feature (flash sale -2 hours)

Week 4 — Advanced + Automation:
  [ ] Referral system
  [ ] Streak bonus tracking
  [ ] Cron: expiry, auto-renewal, monthly bonus
  [ ] Admin dashboard: loyalty overview + bulk adjust
  [ ] Savings calculator on /gold page
  [ ] A/B test: trial vs no-trial conversion
```
