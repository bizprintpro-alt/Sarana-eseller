# ESELLER.MN — ENTITY КАРТ + SELLER ДЭЛГҮҮР СИСТЕМ
## Claude Code Prompt

---

## 1. ENTITY МЕДИА СИСТЕМ

### Prisma — нэмэх
```prisma
model EntityMedia {
  id          String    @id @default(cuid())
  entityId    String?
  productId   String?
  feedPostId  String?
  
  type        MediaType
  url         String
  thumbnail   String?
  caption     String?
  sortOrder   Int       @default(0)
  duration    Int?      // Видео секунд
  
  createdAt   DateTime  @default(now())
}

enum MediaType { IMAGE VIDEO VIRTUAL_TOUR FLOOR_PLAN }
```

---

## 2. ENTITY-Д ТОХИРСОН КАРТ БҮТЭЦ

### 7 карт — тус бүрийн field-үүд

```typescript
// lib/cards/entityCardConfig.ts

export const ENTITY_CARD_CONFIG = {

  STORE: {
    mediaTypes:  ['IMAGE', 'VIDEO'],
    maxImages:   20,
    maxVideos:   3,
    fields:      ['name','price','originalPrice','rating','orderCount','deliveryDays'],
    primaryCta:  'Захиалах',
    sellerCta:   'Борлуулж эхлэх',
    badge:       'Дэлгүүр',
    color:       '#E8242C',
  },

  REAL_ESTATE: {
    mediaTypes:  ['IMAGE', 'VIDEO', 'VIRTUAL_TOUR', 'FLOOR_PLAN'],
    maxImages:   20,
    maxVideos:   2,
    fields:      ['name','price','area','rooms','floor','district','agentName'],
    primaryCta:  'Холбогдох',
    sellerCta:   'Борлуулж эхлэх',
    badge:       'Үл хөдлөх',
    color:       '#2563EB',
  },

  AUTO: {
    mediaTypes:  ['IMAGE', 'VIDEO'],
    maxImages:   20,
    maxVideos:   2,
    fields:      ['name','price','year','mileage','fuelType','transmission','brand'],
    primaryCta:  'Тест драйв',
    sellerCta:   'Борлуулж эхлэх',
    badge:       'Авто',
    color:       '#16A34A',
  },

  SERVICE: {
    mediaTypes:  ['IMAGE', 'VIDEO'],
    maxImages:   10,
    maxVideos:   2,
    fields:      ['name','price','duration','rating','availableSlots','category'],
    primaryCta:  'Цаг захиалах',
    sellerCta:   'Зуучлах',
    badge:       'Үйлчилгээ',
    color:       '#7C3AED',
  },

  CONSTRUCTION: {
    mediaTypes:  ['IMAGE', 'VIDEO', 'FLOOR_PLAN'],
    maxImages:   20,
    maxVideos:   3,
    fields:      ['name','pricePerSqm','totalUnits','soldUnits','completionDate','location'],
    primaryCta:  'Захиалга өгөх',
    sellerCta:   'Борлуулж эхлэх',
    badge:       'Барилга',
    color:       '#0891B2',
  },

  PRE_ORDER: {
    mediaTypes:  ['IMAGE', 'VIDEO'],
    maxImages:   10,
    maxVideos:   1,
    fields:      ['name','price','advancePercent','minBatch','currentBatch','deliveryEstimate'],
    primaryCta:  'Урьдчилж захиалах',
    sellerCta:   'Борлуулж эхлэх',
    badge:       'Pre-order',
    color:       '#D97706',
  },

  DIGITAL: {
    mediaTypes:  ['IMAGE', 'VIDEO'],
    maxImages:   5,
    maxVideos:   1,
    fields:      ['name','price','fileType','fileSize','previewUrl','downloadCount'],
    primaryCta:  'Татаж авах',
    sellerCta:   'Борлуулж эхлэх',
    badge:       'Дижитал',
    color:       '#6366F1',
  },
}
```

---

## 3. ENTITY КАРТ КОМПОНЕНТ

```tsx
// components/cards/EntityCard.tsx
'use client'
import { useState } from 'react'
import { ENTITY_CARD_CONFIG } from '@/lib/cards/entityCardConfig'

export function EntityCard({ item, entityType, onStartSelling, showSellerBtn = false }) {
  const [mediaIdx, setMediaIdx] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const config = ENTITY_CARD_CONFIG[entityType]

  const images = item.media?.filter(m => m.type === 'IMAGE') || []
  const videos = item.media?.filter(m => m.type === 'VIDEO') || []
  const hasVideo = videos.length > 0

  return (
    <div style={{
      background:   'var(--esl-bg-card)',
      border:       '1px solid var(--esl-border)',
      borderRadius: 12,
      overflow:     'hidden',
      cursor:       'pointer',
      transition:   'transform .15s, box-shadow .15s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'none'
      e.currentTarget.style.boxShadow = 'none'
    }}>

      {/* МЕДИА ХЭСЭГ */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#111' }}>

        {/* Зураг / видео */}
        {showVideo && videos[0] ? (
          <video
            src={videos[0].url}
            autoPlay muted controls
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img
            src={images[mediaIdx]?.url || '/placeholder.jpg'}
            alt={item.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Entity type badge */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: config.color, color: '#fff',
          borderRadius: 99, padding: '2px 8px',
          fontSize: 10, fontWeight: 600,
        }}>
          {config.badge}
        </div>

        {/* Видео товч */}
        {hasVideo && !showVideo && (
          <button onClick={e => { e.stopPropagation(); setShowVideo(true) }}
            style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.7)', border: 'none',
              borderRadius: 99, padding: '4px 10px',
              color: '#fff', fontSize: 11, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
            ▶ Видео
          </button>
        )}

        {/* Зургийн carousel dots */}
        {images.length > 1 && !showVideo && (
          <div style={{
            position: 'absolute', bottom: 8, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', gap: 4,
          }}>
            {images.slice(0, 5).map((_, i) => (
              <button key={i}
                onClick={e => { e.stopPropagation(); setMediaIdx(i) }}
                style={{
                  width: 6, height: 6, borderRadius: '50%', border: 'none',
                  background: i === mediaIdx ? '#fff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', padding: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Virtual tour badge */}
        {item.media?.some(m => m.type === 'VIRTUAL_TOUR') && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(0,0,0,0.7)', color: '#fff',
            borderRadius: 99, padding: '2px 8px', fontSize: 10,
          }}>
            🌐 360°
          </div>
        )}
      </div>

      {/* МЭДЭЭЛЛИЙН ХЭСЭГ */}
      <div style={{ padding: '10px 12px' }}>

        {/* Нэр */}
        <p style={{
          fontSize: 13, fontWeight: 500,
          color: 'var(--esl-text-primary)',
          marginBottom: 4, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {item.name}
        </p>

        {/* Entity-д тохирсон field-үүд */}
        <EntityCardFields item={item} entityType={entityType} />

        {/* Үнэ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: config.color }}>
            {formatPrice(item.price)}
          </span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span style={{ fontSize: 12, color: 'var(--esl-text-muted)', textDecoration: 'line-through' }}>
              {formatPrice(item.originalPrice)}
            </span>
          )}
          {item.originalPrice && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#16A34A',
              background: 'rgba(22,163,74,0.1)', borderRadius: 99, padding: '1px 6px',
            }}>
              -{Math.round((1 - item.price/item.originalPrice)*100)}%
            </span>
          )}
        </div>

        {/* CTA товчнууд */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{
            flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
            background: config.color, color: '#fff',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}>
            {config.primaryCta}
          </button>

          {/* Борлуулагчийн товч */}
          {showSellerBtn && item.allowAffiliate && (
            <button
              onClick={e => { e.stopPropagation(); onStartSelling?.(item) }}
              style={{
                padding: '8px 12px', borderRadius: 8,
                border: `1px solid ${config.color}`,
                background: 'none', color: config.color,
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
              📢 {config.sellerCta}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Entity-д тохирсон field-үүд
function EntityCardFields({ item, entityType }) {
  const s = { fontSize: 11, color: 'var(--esl-text-secondary)', marginBottom: 2,
    display: 'flex', alignItems: 'center', gap: 4 }

  if (entityType === 'REAL_ESTATE') return (
    <div>
      <div style={s}>📐 {item.area}м² · {item.rooms} өрөө · {item.floor}-р давхар</div>
      <div style={s}>📍 {item.district}</div>
    </div>
  )

  if (entityType === 'AUTO') return (
    <div>
      <div style={s}>📅 {item.year} · {(item.mileage/1000).toFixed(0)}мян км · {item.fuelType}</div>
      <div style={s}>⚙️ {item.transmission} · {item.brand}</div>
    </div>
  )

  if (entityType === 'SERVICE') return (
    <div>
      <div style={s}>⏱ {item.duration} мин · ⭐ {item.rating} ({item.reviewCount})</div>
      <div style={{ ...s, color: item.availableSlots > 0 ? '#16A34A' : '#E8242C' }}>
        {item.availableSlots > 0 ? `✓ ${item.availableSlots} цаг байна` : '✗ Цаг дүүрсэн'}
      </div>
    </div>
  )

  if (entityType === 'CONSTRUCTION') return (
    <div>
      <div style={s}>📐 {item.pricePerSqm?.toLocaleString()}₮/м²</div>
      <div style={s}>
        <div style={{
          height: 4, background: 'var(--esl-border)', borderRadius: 99,
          flex: 1, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 99, background: '#E8242C',
            width: `${(item.soldUnits/item.totalUnits)*100}%`,
          }}/>
        </div>
        <span>{item.soldUnits}/{item.totalUnits} зарагдсан</span>
      </div>
    </div>
  )

  if (entityType === 'PRE_ORDER') return (
    <div>
      <div style={s}>
        <div style={{
          height: 4, background: 'var(--esl-border)', borderRadius: 99,
          flex: 1, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 99, background: '#D97706',
            width: `${(item.currentBatch/item.minBatch)*100}%`,
          }}/>
        </div>
        <span>{item.currentBatch}/{item.minBatch}</span>
      </div>
      <div style={s}>📅 Хүргэлт: {item.deliveryEstimate}</div>
    </div>
  )

  // Default: STORE, DIGITAL
  return (
    <div>
      {item.rating && <div style={s}>⭐ {item.rating} · {item.orderCount} захиалга</div>}
      {item.deliveryDays && <div style={s}>🚚 {item.deliveryDays} хоногт</div>}
    </div>
  )
}

function formatPrice(price) {
  if (!price) return '—'
  if (price >= 1_000_000_000) return `${(price/1_000_000_000).toFixed(1)}тэрбум₮`
  if (price >= 1_000_000)     return `${(price/1_000_000).toFixed(0)}сая₮`
  return `${price.toLocaleString()}₮`
}
```

---

## 4. "БОРЛУУЛЖ ЭХЛЭХ" MODAL

```tsx
// components/seller/StartSellingModal.tsx
'use client'

export function StartSellingModal({ item, isOpen, onClose }) {
  const [selectedStore, setSelectedStore] = useState('')
  const [status, setStatus]               = useState<'idle'|'sent'|'error'>('idle')

  // Борлуулагчийн дэлгүүрүүд авах
  const { data: myStores } = useSellerStores()

  const handleSubmit = async () => {
    const res = await fetch('/api/seller/request-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId:      item.id,
        sellerStoreId:  selectedStore,
        entityType:     item.entityType,
      })
    })
    setStatus(res.ok ? 'sent' : 'error')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Борлуулж эхлэх">
      {status === 'sent' ? (
        <SuccessState
          title="Хүсэлт явуулсан!"
          desc="Дэлгүүрийн эзэн зөвшөөрсөний дараа таны дэлгүүрт нэмэгдэнэ."
        />
      ) : (
        <>
          {/* Бараа preview */}
          <ProductPreview item={item} />

          {/* Commission харуулах */}
          <CommissionPreview
            price={item.price}
            commission={item.affiliateCommission}
          />

          {/* Дэлгүүр сонгох */}
          <StoreSelector
            stores={myStores}
            selected={selectedStore}
            onChange={setSelectedStore}
          />

          {/* Дэлгүүр байхгүй бол */}
          {myStores?.length === 0 && (
            <Alert type="info">
              Дэлгүүр байхгүй байна.
              <Link href="/dashboard/store/settings/shop-type">
                Дэлгүүр нээх →
              </Link>
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedStore}
            color="#E8242C"
          >
            📨 Хүсэлт явуулах
          </Button>
        </>
      )}
    </Modal>
  )
}
```

---

## 5. БОРЛУУЛАГЧИЙН ДЭЛГҮҮР

```tsx
// app/seller/[username]/page.tsx — шинэчлэх

// Одоогийн: demo data
// Шинэ: DB-с бодит өгөгдөл

export default async function SellerPage({ params }) {
  const seller = await db.sellerProfile.findUnique({
    where: { username: params.username },
    include: {
      user: true,
      entity: {  // Борлуулагчийн дэлгүүр (Pro бол)
        include: {
          storefrontConfig: true,
          customDomain: true,
        }
      },
      sellerProducts: {
        where: { isApproved: true, isActive: true },
        include: {
          product: {
            include: { media: { orderBy: { sortOrder: 'asc' } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!seller) notFound()

  // Pro бол storefront config авна
  const config = seller.entity?.storefrontConfig

  return (
    <div style={{
      maxWidth: 1200, margin: '0 auto',
      fontFamily: config?.font || 'Inter',
    }}>
      {/* Hero */}
      <SellerHero seller={seller} config={config} />

      {/* Бараануудын grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16, padding: 24,
      }}>
        {seller.sellerProducts.map(sp => (
          <EntityCard
            key={sp.id}
            item={sp.product}
            entityType={sp.product.entityType}
            showSellerBtn={false}  // Seller page-д харуулахгүй
          />
        ))}
      </div>

      {/* Share + QR */}
      <SellerShareSection seller={seller} />

      {/* Chat widget */}
      {seller.entity && (
        <ChatWidget
          entityId={seller.entity.id}
          entityName={seller.displayName || seller.user.name}
          primaryColor={config?.primaryColor || '#E8242C'}
        />
      )}
    </div>
  )
}
```

---

## 6. DOMAIN/SUBDOMAIN СИСТЕМ

```typescript
// middleware.ts — шинэчлэх

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const path     = req.nextUrl.pathname

  // 1. Custom domain — дэлгүүрийн эзэн (mystore.mn)
  if (!hostname.includes('eseller.mn') && !hostname.includes('localhost')) {
    const entity = await db.entity.findFirst({
      where: { customDomain: hostname, isActive: true }
    })
    if (entity?.storefrontSlug) {
      return NextResponse.rewrite(
        new URL(`/${entity.storefrontSlug}${path}`, req.url)
      )
    }
  }

  // 2. Subdomain — борлуулагчийн дэлгүүр (bold.eseller.mn)
  if (hostname.endsWith('.eseller.mn')) {
    const sub = hostname.replace('.eseller.mn', '')

    // System subdomains
    if (['www', 'api', 'admin', 'cdn'].includes(sub)) {
      return NextResponse.next()
    }

    // Борлуулагчийн username
    const seller = await db.sellerProfile.findFirst({
      where: { username: sub, isActive: true }
    })
    if (seller) {
      return NextResponse.rewrite(
        new URL(`/seller/${sub}${path}`, req.url)
      )
    }

    // Дэлгүүрийн slug
    const entity = await db.entity.findFirst({
      where: { storefrontSlug: sub, isActive: true }
    })
    if (entity) {
      return NextResponse.rewrite(
        new URL(`/${sub}${path}`, req.url)
      )
    }
  }

  return NextResponse.next()
}
```

---

## 7. МЕДИА UPLOAD СИСТЕМ

```tsx
// components/shared/MediaUploader.tsx
// Бараа/зар нэмэхэд ашиглах

export function MediaUploader({ entityType, value, onChange }) {
  const config  = ENTITY_CARD_CONFIG[entityType]
  const maxImgs = config.maxImages
  const hasVT   = config.mediaTypes.includes('VIRTUAL_TOUR')
  const hasFP   = config.mediaTypes.includes('FLOOR_PLAN')

  return (
    <div>
      {/* Зураг upload */}
      <Section title={`Зурагнууд (хамгийн ихдээ ${maxImgs})`}>
        <CloudinaryMultiUpload
          maxFiles={maxImgs}
          accept="image/*"
          onUpload={urls => onChange({ ...value, images: urls })}
        />
      </Section>

      {/* Видео upload */}
      {config.mediaTypes.includes('VIDEO') && (
        <Section title="Видео (хамгийн ихдээ 2 мин)">
          <CloudinaryVideoUpload
            maxDuration={120}
            onUpload={url => onChange({ ...value, video: url })}
          />
        </Section>
      )}

      {/* Virtual tour — үл хөдлөх */}
      {hasVT && (
        <Section title="360° Виртуал тойрог (YouTube/Matterport URL)">
          <input
            placeholder="https://..."
            value={value.virtualTour || ''}
            onChange={e => onChange({ ...value, virtualTour: e.target.value })}
          />
        </Section>
      )}

      {/* Floor plan — барилга */}
      {hasFP && (
        <Section title="Байрны зураглал (floor plan)">
          <CloudinaryUpload
            accept="image/*"
            onUpload={url => onChange({ ...value, floorPlan: url })}
          />
        </Section>
      )}
    </div>
  )
}
```

---

## 8. API ROUTES

```
POST /api/seller/request-product
  { productId, sellerStoreId, entityType }
  → SellerProduct.status = 'PENDING'
  → Дэлгүүрт мэдэгдэл (SMS + email)

GET  /api/seller/[username]/products
  → Зөвшөөрөгдсөн бараануудын жагсаалт

POST /api/media/upload
  { file, type, entityId/productId }
  → Cloudinary upload → EntityMedia save

GET  /api/products/[id]/media
  → EntityMedia жагсаалт
```

---

## 9. ХЭРЭГЖИЛТИЙН ДАРААЛАЛ

```
1. Prisma migration:
   EntityMedia model нэмэх
   Product-д entityType, allowAffiliate,
   area, rooms, year, mileage... field нэмэх
   npx prisma migrate dev --name add_entity_media

2. lib/cards/entityCardConfig.ts үүсгэх

3. components/cards/EntityCard.tsx үүсгэх
   (carousel, video, entity fields, dual CTA)

4. components/seller/StartSellingModal.tsx үүсгэх

5. components/shared/MediaUploader.tsx үүсгэх

6. app/seller/[username]/page.tsx шинэчлэх
   DB fetch + EntityCard ашиглах

7. middleware.ts шинэчлэх
   Subdomain detect нэмэх

8. /dashboard/affiliate/page.tsx:
   "Борлуулж эхлэх" товч → StartSellingModal

9. Build + test + push
```
