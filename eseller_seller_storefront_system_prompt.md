# ESELLER.MN — НЭГДСЭН ДЭЛГҮҮРИЙН СИСТЕМ
## Claude Code Master Prompt — Seller Storefront + Multi-Role App

Энэ prompt нэг нэгдсэн аппд гурван роль + борлуулагчийн дэлгүүрийн бүрэн систем хэрэгжүүлнэ.

---

## СИСТЕМИЙН ТОВЧ ТАЙЛБАР

```
ХЭРЭГЛЭГЧ нэвтрэхэд:
  → customer горим (бараа хайх, захиалах)
  → дэлгүүрийн эзэн горим (дэлгүүр засах, захиалга авах)
  → борлуулагч горим (бараа зарах, commission авах)

ДЭЛГҮҮРИЙН ЭЗЭНий ОНЦЛОГ:
  → Вэб сайт авдаг (store.eseller.mn/mystore эсвэл custom domain)
  → Hero хуудас + 7 төрлийн онцлогт тулгуурласан layout
  → Борлуулагчаар дамжуулах зөвшөөрөл олгоно
  → eБаримт, QR код, share link

БОРЛУУЛАГЧ (Affiliate Seller):
  → Нэг хуудас: /seller/[username]
  → Бараагаа жагсаасан — share хийхэд "дэлгүүр" мэт харагдана
  → Захиалга орвол тооцоо автомат орно
  → QR код, link шэйр

COMMISSION ТООЦОО:
  → Захиалга орвол: дэлгүүрт 70-85%, борлуулагчид 10-20%, систем 2.5-5%
```

---

## 1. PRISMA SCHEMA — SELLER STOREFRONT

```prisma
// Нэмэлт болон шинэчлэгдэх model-ууд

model SellerProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  username      String   @unique           // /seller/username
  displayName   String
  bio           String?
  avatar        String?
  coverImage    String?
  isVerified    Boolean  @default(false)
  isActive      Boolean  @default(true)

  // Commission
  commissionRate Float   @default(10)      // %
  totalEarned    Float   @default(0)
  totalSales     Int     @default(0)

  // Share
  shareUrl      String?                    // https://eseller.mn/seller/username
  qrCode        String?                    // Cloudinary QR image URL

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields:[userId], references:[id])
  sellerProducts SellerProduct[]
  commissions   Commission[]
}

model SellerProduct {
  id              String   @id @default(cuid())
  sellerProfileId String
  productId       String                    // Дэлгүүрийн бараа
  isApproved      Boolean  @default(false)  // Дэлгүүрийн эзэн зөвшөөрсөн
  approvedAt      DateTime?
  approvedById    String?                   // entityId (store owner)
  customPrice     Float?                    // Зарим тохиолдолд өөр үнэ
  sortOrder       Int      @default(0)
  clicks          Int      @default(0)
  conversions     Int      @default(0)
  createdAt       DateTime @default(now())

  seller          SellerProfile @relation(fields:[sellerProfileId], references:[id])
  product         Product       @relation(fields:[productId], references:[id])
}

model Commission {
  id              String   @id @default(cuid())
  orderId         String   @unique
  sellerProfileId String
  entityId        String                    // Дэлгүүрийн ID
  orderAmount     Float
  commissionRate  Float
  commissionAmount Float
  platformFee     Float
  entityAmount    Float
  status          CommissionStatus @default(PENDING)
  paidAt          DateTime?
  createdAt       DateTime @default(now())

  seller          SellerProfile @relation(fields:[sellerProfileId], references:[id])
}

enum CommissionStatus {
  PENDING    // Захиалга орсон, тооцоо хийгдэнгүй
  CONFIRMED  // Захиалга баталгаажсан
  PAID       // Борлуулагчид мөнгө шилжсэн
  CANCELLED  // Цуцлагдсан
}

// Entity (Store) model-д нэмэх
model Entity {
  // ... одоо байгаа field-үүд ...

  // Seller permission
  allowSellers    Boolean  @default(false)  // Борлуулагч зөвшөөрөх эсэх
  sellerCommission Float   @default(10)     // Default commission %
  maxSellers      Int?                      // Хязгаарлах бол

  // Storefront (вэб сайт)
  storefrontSlug  String?  @unique          // store.eseller.mn/slug
  customDomain    String?  @unique          // mystore.mn
  storefrontConfig Json?                    // Theme, colors, layout

  // 7 entity type-specific config
  entityType      EntityType @default(STORE)
  typeConfig      Json?      // Pre-order settings, agent license, etc.
}

// Storefront theme config structure (typeConfig дотор хадгалагдана)
// {
//   theme: 'minimal' | 'bold' | 'modern' | 'luxury',
//   primaryColor: '#E8242C',
//   font: 'Inter',
//   heroTitle: 'Манай дэлгүүрт тавтай морил',
//   heroSubtitle: '...',
//   showCategories: true,
//   showReviews: true,
//   showMap: true,
//   sections: ['hero', 'featured', 'categories', 'about', 'reviews', 'map', 'cta'],
//   entitySpecific: {
//     // STORE: showCart, allowPreorder
//     // AGENT: showListings, showAgentProfile
//     // COMPANY: showProjects, showGallery
//     // AUTO: showVehicles, showTestDrive
//     // SERVICE: showBooking, showPortfolio
//     // PREORDER: showBatchProgress, showDeliveryDays
//     // DIGITAL: showInstantDownload, showLicense
//   }
// }
```

---

## 2. STOREFRONT PUBLIC PAGES

### URL structure

```
/[slug]                     — Entity public storefront (хэрэглэгч хардаг)
/[slug]/products            — Бүх бараа
/[slug]/product/[id]        — Бараа дэлгэрэнгүй
/[slug]/about               — Дэлгүүрийн тухай
/[slug]/contact             — Холбоо барих
/seller/[username]          — Борлуулагчийн хуудас
/seller/[username]/[product]— Борлуулагчийн бараа
```

### Entity Storefront — app/[slug]/page.tsx

```tsx
// app/[slug]/page.tsx
// 7 entity type-т тохирсон storefront

import { notFound } from 'next/navigation'
import { db }       from '@/lib/prisma'
import { StorefrontHero }        from '@/components/storefront/StorefrontHero'
import { StorefrontProducts }    from '@/components/storefront/StorefrontProducts'
import { StorefrontAgentProfile} from '@/components/storefront/StorefrontAgentProfile'
import { StorefrontProjects }    from '@/components/storefront/StorefrontProjects'
import { StorefrontVehicles }    from '@/components/storefront/StorefrontVehicles'
import { StorefrontServices }    from '@/components/storefront/StorefrontServices'
import { StorefrontPreorder }    from '@/components/storefront/StorefrontPreorder'
import { StorefrontDigital }     from '@/components/storefront/StorefrontDigital'

export default async function StorefrontPage({
  params
}: { params: { slug: string } }) {
  const entity = await db.entity.findFirst({
    where: {
      OR: [
        { storefrontSlug: params.slug },
        { slug: params.slug },
      ],
      isVerified: true,
    },
    include: {
      locations: { where: { isPrimary: true }, take: 1 },
      products:  { where: { isActive: true }, take: 12, orderBy: { tier: 'asc' } },
      reviews:   { take: 5, orderBy: { createdAt: 'desc' } },
    }
  })

  if (!entity) notFound()

  const config = entity.storefrontConfig as StorefrontConfig || getDefaultConfig(entity.entityType)

  // Theme CSS variables inject
  const themeVars = `
    --sf-primary: ${config.primaryColor || '#E8242C'};
    --sf-bg: ${config.bgColor || '#FFFFFF'};
    --sf-text: ${config.textColor || '#0A0A0A'};
  `

  return (
    <div style={{ '--sf-primary': config.primaryColor } as any}>
      <StorefrontNav entity={entity} />

      {/* Hero — бүх 7 төрөлд байна, агуулга нь өөр */}
      <StorefrontHero entity={entity} config={config} />

      {/* Entity type-specific sections */}
      {entity.entityType === 'STORE'      && <StorefrontProducts  entity={entity} config={config} />}
      {entity.entityType === 'PRE_ORDER'  && <StorefrontPreorder  entity={entity} config={config} />}
      {entity.entityType === 'AGENT'      && <StorefrontAgentProfile entity={entity} config={config} />}
      {entity.entityType === 'COMPANY'    && <StorefrontProjects  entity={entity} config={config} />}
      {entity.entityType === 'AUTO_DEALER'&& <StorefrontVehicles  entity={entity} config={config} />}
      {entity.entityType === 'SERVICE'    && <StorefrontServices  entity={entity} config={config} />}
      {entity.entityType === 'DIGITAL'    && <StorefrontDigital   entity={entity} config={config} />}

      {/* Common sections */}
      {config.sections?.includes('reviews') && <StorefrontReviews entity={entity} />}
      {config.sections?.includes('map')     && <StorefrontMap     entity={entity} />}
      {config.sections?.includes('about')   && <StorefrontAbout   entity={entity} />}

      {/* Seller request section — борлуулагч нэмж авах */}
      {entity.allowSellers && <BecomeSellerCTA entity={entity} />}

      <StorefrontFooter entity={entity} />
    </div>
  )
}

// JSON-LD SEO
export async function generateMetadata({ params }) {
  const entity = await db.entity.findFirst({
    where: { storefrontSlug: params.slug }
  })
  if (!entity) return {}
  return {
    title:       entity.name,
    description: entity.description,
    openGraph: {
      title:  entity.name,
      images: [entity.coverImage || entity.logo],
    }
  }
}
```

---

## 3. STOREFRONT HERO — 7 ENTITY TYPE-Т ТОХИРСОН

```tsx
// components/storefront/StorefrontHero.tsx

const ENTITY_HERO_CONFIG = {
  STORE: {
    ctaPrimary:   'Захиалах',
    ctaSecondary: 'Бараа харах',
    badge:        'Онлайн дэлгүүр',
    badgeColor:   '#3B82F6',
  },
  PRE_ORDER: {
    ctaPrimary:   'Урьдчилгаа захиалах',
    ctaSecondary: 'Хүлээлтийн жагсаалт',
    badge:        'Захиалгын дэлгүүр',
    badgeColor:   '#E8242C',
    extraInfo:    true, // delivery days, min order
  },
  AGENT: {
    ctaPrimary:   'Зар харах',
    ctaSecondary: 'Холбоо барих',
    badge:        'Үл хөдлөхийн агент',
    badgeColor:   '#7F77DD',
    showStats:    true, // listings count, deals closed
  },
  COMPANY: {
    ctaPrimary:   'Төслүүд харах',
    ctaSecondary: 'Холбоо барих',
    badge:        'Барилгын компани',
    badgeColor:   '#22C55E',
  },
  AUTO_DEALER: {
    ctaPrimary:   'Машин харах',
    ctaSecondary: 'Тест драйв захиалах',
    badge:        'Авто худалдаа',
    badgeColor:   '#F59E0B',
    showBrands:   true,
  },
  SERVICE: {
    ctaPrimary:   'Цаг захиалах',
    ctaSecondary: 'Үйлчилгээ харах',
    badge:        'Үйлчилгээ',
    badgeColor:   '#888780',
  },
  DIGITAL: {
    ctaPrimary:   'Бүтээгдэхүүн харах',
    ctaSecondary: 'Instant download',
    badge:        'Дижитал контент',
    badgeColor:   '#60A5FA',
  },
}

export function StorefrontHero({ entity, config }) {
  const heroConf = ENTITY_HERO_CONFIG[entity.entityType]

  return (
    <section style={{
      background:  config.heroStyle === 'color'
        ? config.primaryColor || '#E8242C'
        : config.heroBgImage
          ? `url(${config.heroBgImage})`
          : 'var(--esl-brand)',
      minHeight: 'clamp(320px, 45vw, 520px)',
      position:  'relative',
      display:   'flex',
      alignItems:'center',
      overflow:  'hidden',
    }}>
      <div className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="flex items-center gap-3 mb-4">
          {entity.logo && (
            <img src={entity.logo} alt={entity.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/30" />
          )}
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            padding: '4px 12px', borderRadius: 99,
            background: heroConf.badgeColor + '33',
            color: '#fff', border: `1px solid ${heroConf.badgeColor}66`,
          }}>
            {heroConf.badge}
          </span>
          {entity.isVerified && (
            <span style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 99,
              background: 'rgba(255,255,255,0.15)', color: '#fff',
            }}>
              ✓ Баталгаажсан
            </span>
          )}
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 56px)',
          fontWeight: 900,
          color: '#fff',
          lineHeight: 1.1,
          marginBottom: 12,
        }}>
          {config.heroTitle || entity.name}
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 28, maxWidth: 520 }}>
          {config.heroSubtitle || entity.description}
        </p>

        {/* PRE_ORDER specific: delivery info */}
        {heroConf.extraInfo && entity.typeConfig && (
          <div className="flex gap-4 mb-6 flex-wrap">
            <StatPill icon="🕐" label={`${entity.typeConfig.deliveryDays}-${entity.typeConfig.deliveryDaysMax || entity.typeConfig.deliveryDays + 7} хоногт хүргэнэ`} />
            <StatPill icon="📦" label={`Мин. захиалга ${entity.typeConfig.minimumOrderQty} ширхэг`} />
            <StatPill icon="💳" label={`${entity.typeConfig.advancePct || 30}% урьдчилгаа`} />
          </div>
        )}

        {/* AGENT specific: stats */}
        {heroConf.showStats && (
          <div className="flex gap-6 mb-6">
            <div><p className="text-3xl font-bold text-white">{entity._count?.products || 0}</p><p className="text-white/70 text-sm">Идэвхтэй зар</p></div>
            <div><p className="text-3xl font-bold text-white">98%</p><p className="text-white/70 text-sm">Хариу өгөх</p></div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <a href="#products"
            style={{
              background: '#fff', color: config.primaryColor || '#E8242C',
              padding: '14px 28px', borderRadius: 10,
              fontWeight: 700, fontSize: 15, textDecoration: 'none',
            }}>
            {heroConf.ctaPrimary}
          </a>
          <a href="#about"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.5)',
              color: '#fff',
              padding: '14px 24px', borderRadius: 10,
              fontWeight: 600, fontSize: 15, textDecoration: 'none',
            }}>
            {heroConf.ctaSecondary}
          </a>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2 mt-4">
          <ShareButton entity={entity} />
          <QRCodeButton entity={entity} />
        </div>
      </div>
    </section>
  )
}
```

---

## 4. БОРЛУУЛАГЧИЙН ХУУДАС — /seller/[username]

```tsx
// app/seller/[username]/page.tsx

export default async function SellerPage({ params }) {
  const seller = await db.sellerProfile.findUnique({
    where: { username: params.username },
    include: {
      sellerProducts: {
        where:   { isApproved: true },
        include: { product: { include: { entity: { select: { name: true, logo: true } } } } },
        orderBy: { sortOrder: 'asc' },
      },
      user: { select: { name: true, avatar: true } },
    }
  })

  if (!seller || !seller.isActive) notFound()

  return (
    <div style={{ background: 'var(--esl-bg-page)', minHeight: '100vh' }}>

      {/* Seller hero */}
      <div style={{
        background: '#E8242C',
        padding:    '40px 24px',
        textAlign:  'center',
      }}>
        <img src={seller.avatar || '/default-avatar.png'} alt={seller.displayName}
          style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover',
            border: '3px solid white', marginBottom: 12 }} />
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, marginBottom: 4 }}>
          {seller.displayName}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{seller.bio}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{seller.totalSales}</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Борлуулалт</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{seller.sellerProducts.length}</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Бараа</p>
          </div>
        </div>

        {/* Share + QR */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
          <SharePageButton url={`https://eseller.mn/seller/${seller.username}`} />
          <QRCodeModalButton url={`https://eseller.mn/seller/${seller.username}`} />
        </div>
      </div>

      {/* Products grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--esl-text-primary)', marginBottom: 20 }}>
          Бараа бүтээгдэхүүн
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {seller.sellerProducts.map(sp => (
            <SellerProductCard
              key={sp.id}
              product={sp.product}
              sellerUsername={seller.username}
              customPrice={sp.customPrice}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Seller product card — click-д seller tracking нэмнэ
function SellerProductCard({ product, sellerUsername, customPrice }) {
  return (
    <a href={`/seller/${sellerUsername}/p/${product.slug}`}
      onClick={() => trackClick(product.id, sellerUsername)}
      style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--esl-bg-card)',
        border: '1px solid var(--esl-border)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'transform 0.15s',
      }}>
        <div style={{ aspectRatio: '1', background: 'var(--esl-bg-section)', position: 'relative' }}>
          <img src={product.images[0]} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            fontSize: 10, padding: '2px 8px', borderRadius: 99,
          }}>
            {product.entity?.name}
          </div>
        </div>
        <div style={{ padding: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--esl-text-primary)', marginBottom: 6 }}>
            {product.name}
          </p>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#E8242C' }}>
            {(customPrice || product.price).toLocaleString()}₮
          </p>
          <button style={{
            width: '100%', marginTop: 8, padding: '8px', borderRadius: 8,
            background: '#E8242C', border: 'none', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Захиалах
          </button>
        </div>
      </div>
    </a>
  )
}
```

---

## 5. ДЭЛГҮҮРИЙН ЭЗЭНий SELLER APPROVAL DASHBOARD

```tsx
// app/dashboard/seller/sellers/page.tsx
// Дэлгүүрийн эзэн борлуулагчийн хүсэлт батлах

export default async function SellerApprovalsPage() {
  const session  = await getServerSession()
  const entityId = await getActiveEntityId(session!.user.id)

  const pendingRequests = await db.sellerProduct.findMany({
    where: {
      product: { entityId },
      isApproved: false,
    },
    include: {
      seller:  { include: { user: { select: { name: true, avatar: true } } } },
      product: { select: { name: true, images: true, price: true } },
    }
  })

  const approvedSellers = await db.sellerProduct.findMany({
    where: {
      product: { entityId },
      isApproved: true,
    },
    include: {
      seller: true,
    }
  })

  return (
    <DashboardLayout>
      <PageHeader title="Борлуулагчид" subtitle={`${pendingRequests.length} хүлээгдэж буй хүсэлт`} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
        <StatCard label="Нийт борлуулагч" value={approvedSellers.length} />
        <StatCard label="Нийт борлуулалт" value={`₮${(totalSales/1000000).toFixed(1)}M`} />
        <StatCard label="Комисс төлсөн" value={`₮${(totalCommission/1000).toFixed(0)}K`} />
      </div>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Хүлээгдэж буй хүсэлтүүд</h3>
          {pendingRequests.map(req => (
            <SellerRequestCard
              key={req.id}
              request={req}
              onApprove={() => approveSeller(req.id)}
              onReject={() => rejectSeller(req.id)}
            />
          ))}
        </section>
      )}

      {/* Active sellers table */}
      <SellerTable sellers={approvedSellers} entityId={entityId} />
    </DashboardLayout>
  )
}
```

---

## 6. БОРЛУУЛАГЧ БОЛОХ + БАРАА НЭМЭХ

```tsx
// components/seller/BecomeSellerFlow.tsx
// Дэлгүүрийн хуудас дотор "Борлуулагч болох" CTA

export function BecomeSellerCTA({ entity }) {
  return (
    <section style={{
      background: 'var(--esl-bg-section)',
      padding:    '60px 24px',
      textAlign:  'center',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(232,36,44,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="#E8242C" strokeWidth="1.5" strokeLinecap="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--esl-text-primary)', marginBottom: 8 }}>
          {entity.name}-ийн борлуулагч болох
        </h2>
        <p style={{ fontSize: 15, color: 'var(--esl-text-muted)', marginBottom: 24, lineHeight: 1.7 }}>
          Борлуулагчаар нэгдэж, бараагаа сошиал медиагаар хуваалцаж commission авна уу.
          Борлуулалт бүрээс <strong>{entity.sellerCommission || 10}%</strong> авна.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28,
        }}>
          {[
            { icon: '🛍', title: 'Бараа сонго', desc: 'Дэлгүүрийн бараанаас сонго' },
            { icon: '📱', title: 'Хуваалц', desc: 'Link, QR кодоор хуваалц' },
            { icon: '💰', title: 'Commission ав', desc: 'Захиалга бүрт автомат' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--esl-bg-card)',
              border: '1px solid var(--esl-border)',
              borderRadius: 12, padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--esl-text-primary)', marginBottom: 4 }}>{s.title}</p>
              <p style={{ fontSize: 11, color: 'var(--esl-text-muted)' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <a href={`/become-seller?entity=${entity.id}`}
          style={{
            display: 'inline-block',
            background: '#E8242C', color: '#fff',
            padding: '14px 32px', borderRadius: 10,
            fontSize: 15, fontWeight: 700, textDecoration: 'none',
          }}>
          Борлуулагч болох →
        </a>
      </div>
    </section>
  )
}
```

---

## 7. COMMISSION ТООЦОО

```typescript
// lib/commission/calculateCommission.ts

interface CommissionBreakdown {
  orderAmount:      number
  entityAmount:     number   // Дэлгүүрт очих
  sellerAmount:     number   // Борлуулагчид очих
  platformAmount:   number   // Системд очих
  sellerRate:       number   // %
  platformRate:     number   // %
}

export function calculateCommission(
  orderAmount:    number,
  sellerRate:     number,   // Дэлгүүрийн тохируулсан %
  platformRate:   number = 2.5,
): CommissionBreakdown {
  const sellerAmount   = orderAmount * (sellerRate / 100)
  const platformAmount = orderAmount * (platformRate / 100)
  const entityAmount   = orderAmount - sellerAmount - platformAmount

  return {
    orderAmount,
    entityAmount:   Math.round(entityAmount),
    sellerAmount:   Math.round(sellerAmount),
    platformAmount: Math.round(platformAmount),
    sellerRate,
    platformRate,
  }
}

// Order create-д дуудна
// app/api/orders/route.ts — POST дотор
export async function processOrderCommission(orderId: string) {
  const order = await db.order.findUnique({
    where:   { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: { entity: { select: { sellerCommission: true } } }
          }
        }
      },
      sellerProfile: true,
    }
  })

  if (!order?.sellerProfileId) return // Борлуулагчаар орсон захиалга биш

  const breakdown = calculateCommission(
    order.totalAmount,
    order.sellerProfile!.commissionRate || order.items[0].product.entity!.sellerCommission || 10,
  )

  await db.commission.create({
    data: {
      orderId:          order.id,
      sellerProfileId:  order.sellerProfileId,
      entityId:         order.items[0].product.entityId,
      orderAmount:      breakdown.orderAmount,
      commissionRate:   breakdown.sellerRate,
      commissionAmount: breakdown.sellerAmount,
      platformFee:      breakdown.platformAmount,
      entityAmount:     breakdown.entityAmount,
      status:           'PENDING',
    }
  })

  // Update seller stats
  await db.sellerProfile.update({
    where: { id: order.sellerProfileId },
    data: {
      totalSales:  { increment: 1 },
      totalEarned: { increment: breakdown.sellerAmount },
    }
  })
}
```

---

## 8. SHARE + QR CODE

```typescript
// lib/share/generateShareContent.ts
import QRCode from 'qrcode'
import { uploadToCloudinary } from '@/lib/cloudinary/upload'

export async function generateEntityShareContent(entityId: string) {
  const entity = await db.entity.findUnique({ where: { id: entityId } })
  if (!entity) return

  const url = entity.customDomain
    ? `https://${entity.customDomain}`
    : `https://eseller.mn/${entity.storefrontSlug}`

  // Generate QR code
  const qrBuffer  = await QRCode.toBuffer(url, { width: 400, margin: 2 })
  const qrBase64  = `data:image/png;base64,${qrBuffer.toString('base64')}`
  const cloudUrl  = await uploadToCloudinary(qrBase64, 'qrcodes')

  await db.entity.update({
    where: { id: entityId },
    data: {
      shareUrl: url,
      storefrontConfig: {
        ...(entity.storefrontConfig as any),
        qrCodeUrl: cloudUrl,
      }
    }
  })

  return { url, qrCodeUrl: cloudUrl }
}

export async function generateSellerShareContent(sellerProfileId: string) {
  const seller = await db.sellerProfile.findUnique({ where: { id: sellerProfileId } })
  if (!seller) return

  const url      = `https://eseller.mn/seller/${seller.username}`
  const qrBuffer = await QRCode.toBuffer(url, { width: 400, margin: 2 })
  const qrBase64 = `data:image/png;base64,${qrBuffer.toString('base64')}`
  const cloudUrl = await uploadToCloudinary(qrBase64, 'qrcodes')

  await db.sellerProfile.update({
    where: { id: sellerProfileId },
    data:  { shareUrl: url, qrCode: cloudUrl }
  })

  return { url, qrCodeUrl: cloudUrl }
}

// API route
// POST /api/seller/generate-share → { url, qrCodeUrl }
// POST /api/entity/generate-share → { url, qrCodeUrl }
```

---

## 9. MOBILE APP — SELLER TAB ШИНЭЧЛЭЛТ

```tsx
// app/(seller)/index.tsx — Dashboard
// Борлуулагч горимд:
// 1. My products (approved list)
// 2. Share button → deep link + QR
// 3. Commission earnings
// 4. Pending approvals count

// app/(seller)/products/index.tsx
// Approved бараануудын жагсаалт
// Share individual product

export function SellerProductsScreen() {
  const { entityId } = useRoleStore()
  const { data } = useQuery({
    queryKey: ['seller-products', entityId],
    queryFn:  () => apiFetch('/api/seller/my-products'),
  })

  return (
    <FlatList
      data={data?.products}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 0.5, borderBottomColor: c.border }}>
          <Image source={{ uri: item.product.images[0] }} style={{ width: 56, height: 56, borderRadius: 8 }} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: c.textPrimary }}>{item.product.name}</Text>
            <Text style={{ fontSize: 12, color: brand.primary }}>{item.product.price.toLocaleString()}₮</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: c.textMuted }}>{item.clicks} click</Text>
              <Text style={{ fontSize: 11, color: c.textMuted }}>{item.conversions} захиалга</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => shareProduct(item)} style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: brand.bg,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <ShareIcon size={16} color={brand.primary} />
          </TouchableOpacity>
        </View>
      )}
    />
  )
}
```

---

## 10. CUSTOM DOMAIN SUPPORT

```typescript
// middleware.ts — Custom domain routing

import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''

  // Custom domain detection
  if (!hostname.includes('eseller.mn') && !hostname.includes('localhost')) {
    // Custom domain → find entity
    const entity = await db.entity.findFirst({
      where: { customDomain: hostname }
    })

    if (entity) {
      // Rewrite to storefront
      return NextResponse.rewrite(
        new URL(`/${entity.storefrontSlug}${req.nextUrl.pathname}`, req.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 11. ХЭРЭГЖИЛТИЙН ДАРААЛАЛ

```
Долоо хоног 1 — Суурь:
  [ ] SellerProfile, SellerProduct, Commission Prisma migration
  [ ] /[slug] storefront page (7 entity type)
  [ ] StorefrontHero component (entity type config)
  [ ] /seller/[username] page
  [ ] Commission calculation utility
  [ ] QR code generation (qrcode package)

Долоо хоног 2 — Dashboard:
  [ ] Entity storefront config editor (/dashboard/seller/storefront)
  [ ] Seller approval dashboard (/dashboard/seller/sellers)
  [ ] Commission report (/dashboard/seller/commissions)
  [ ] Share + QR modal component
  [ ] BecomeSellerCTA component

Долоо хоног 3 — Mobile:
  [ ] Seller tab: products list + share
  [ ] Commission earnings screen
  [ ] QR code display (react-native-qrcode-svg)
  [ ] Deep link: eseller://seller/username

Долоо хоног 4 — Advanced:
  [ ] Custom domain middleware
  [ ] Storefront theme builder (/dashboard/seller/storefront/design)
  [ ] 7 entity type-specific section components
  [ ] SEO: JSON-LD, OpenGraph, sitemap
```
