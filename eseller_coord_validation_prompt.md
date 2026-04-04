# Eseller.mn — Дэлгүүрийн координат шалгалтын бүрэн систем
## Claude Code Prompt — Full Coordinate Validation System

Дэлгүүрийн байршлын координат (lat/lng) шалгах бүрэн систем:
1. Utility функц — validateCoords()
2. Prisma schema нэмэлт
3. API validation (POST/PATCH)
4. Admin dashboard — бүх дэлгүүрийн координат хяналт
5. Seller reminder — dashboard banner + location badge
6. Cron job — 7 хоног бүр автомат шалгалт + мэдэгдэл

---

## 1. UTILITY ФУНКЦ — lib/location/validateCoords.ts

```typescript
// lib/location/validateCoords.ts

const MONGOLIA_BOUNDS = {
  latMin: 41.5, latMax: 52.2,
  lngMin: 87.7, lngMax: 119.9,
}

const UB_BOUNDS = {
  latMin: 47.7, latMax: 48.1,
  lngMin: 106.6, lngMax: 107.3,
}

export type CoordStatus =
  | 'valid_ub'
  | 'valid_mongolia'
  | 'outside'
  | 'zero'
  | 'missing'

export interface CoordValidation {
  status:      CoordStatus
  valid:       boolean
  message:     string
  needsUpdate: boolean
}

export function validateCoords(
  lat: number | null | undefined,
  lng: number | null | undefined
): CoordValidation {

  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    return {
      status: 'missing', valid: false, needsUpdate: true,
      message: 'Байршлын координат оруулаагүй байна. Газрын зураг дээр pin тавина уу.',
    }
  }

  if (lat === 0 && lng === 0) {
    return {
      status: 'zero', valid: false, needsUpdate: true,
      message: 'Байршил тогтоогоогүй байна (0, 0). Газрын зурагт тэмдэглэнэ үү.',
    }
  }

  const inMongolia = (
    lat >= MONGOLIA_BOUNDS.latMin && lat <= MONGOLIA_BOUNDS.latMax &&
    lng >= MONGOLIA_BOUNDS.lngMin && lng <= MONGOLIA_BOUNDS.lngMax
  )
  if (!inMongolia) {
    return {
      status: 'outside', valid: false, needsUpdate: true,
      message: `Координат Монголоос гадна байна (${lat.toFixed(4)}, ${lng.toFixed(4)}). Шалгана уу.`,
    }
  }

  const inUB = (
    lat >= UB_BOUNDS.latMin && lat <= UB_BOUNDS.latMax &&
    lng >= UB_BOUNDS.lngMin && lng <= UB_BOUNDS.lngMax
  )

  return {
    status:      inUB ? 'valid_ub' : 'valid_mongolia',
    valid:       true,
    needsUpdate: false,
    message:     inUB ? 'Улаанбаатар хотод байна' : 'Монгол улсад байна',
  }
}

export function validateCoordsMany(
  locations: Array<{ id: string; name: string; lat: number | null; lng: number | null }>
) {
  return locations.map(loc => ({
    id: loc.id, name: loc.name,
    validation: validateCoords(loc.lat, loc.lng),
  }))
}

export function getCoordStats(
  locations: Array<{ lat: number | null; lng: number | null }>
) {
  const results = locations.map(l => validateCoords(l.lat, l.lng))
  return {
    total:       results.length,
    valid:       results.filter(r => r.valid).length,
    missing:     results.filter(r => r.status === 'missing').length,
    zero:        results.filter(r => r.status === 'zero').length,
    outside:     results.filter(r => r.status === 'outside').length,
    needsUpdate: results.filter(r => r.needsUpdate).length,
  }
}
```

---

## 2. PRISMA SCHEMA — нэмэлт field

```prisma
// schema.prisma — StoreLocation model-д нэмэх

model StoreLocation {
  // ... одоо байгаа field-үүд ...

  // Координат шалгалтын field-үүд (ШИНЭ)
  coordStatus      String?  @default("missing")
  // "valid_ub" | "valid_mongolia" | "outside" | "zero" | "missing"

  coordNeedsUpdate Boolean  @default(true)
  // true = seller-д сануулга явуулах

  coordCheckedAt   DateTime?
  // Сүүлд шалгасан огноо
}

// Migration ажиллуулах:
// npx prisma migrate dev --name add_coord_validation
```

---

## 3. API ROUTES — validation нэмэх

```typescript
// app/api/seller/locations/route.ts

import { validateCoords } from '@/lib/location/validateCoords'

export async function POST(req: Request) {
  const session  = await requireAuth(req)
  const entityId = await getActiveEntityId(session.user.id)
  const body     = await req.json()
  const { lat, lng } = body

  const coordCheck = validateCoords(lat, lng)

  const location = await db.storeLocation.create({
    data: {
      ...body,
      entityId,
      coordStatus:      coordCheck.status,
      coordNeedsUpdate: coordCheck.needsUpdate,
      coordCheckedAt:   new Date(),
    }
  })

  // Координат буруу бол seller task үүсгэх
  if (coordCheck.needsUpdate) {
    await db.sellerTask.upsert({
      where:  {
        entityId_type: { entityId, type: 'UPDATE_LOCATION_COORDS' }
      },
      create: {
        entityId,
        type:       'UPDATE_LOCATION_COORDS',
        priority:   'medium',
        title:      'Байршлын координат шинэчлэх шаардлагатай',
        message:    coordCheck.message,
        locationId: location.id,
      },
      update: { updatedAt: new Date() },
    })
  }

  return Response.json({
    location,
    coordWarning: coordCheck.needsUpdate ? coordCheck.message : null,
  }, { status: 201 })
}

export async function GET(req: Request) {
  const session  = await requireAuth(req)
  const entityId = await getActiveEntityId(session.user.id)
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter')

  const where: any = { entityId, isActive: true }
  if (filter === 'needs_coords') {
    where.coordNeedsUpdate = true
  }

  const locations = await db.storeLocation.findMany({
    where,
    orderBy: [{ coordNeedsUpdate: 'desc' }, { createdAt: 'desc' }],
  })

  return Response.json(locations)
}

// app/api/seller/locations/[id]/route.ts — PATCH
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session  = await requireAuth(req)
  const entityId = await getActiveEntityId(session.user.id)

  const existing = await db.storeLocation.findFirst({
    where: { id: params.id, entityId }
  })
  if (!existing) return new Response('Not found', { status: 404 })

  const body = await req.json()
  const { lat, lng } = body
  const coordCheck = validateCoords(lat, lng)

  const updated = await db.storeLocation.update({
    where: { id: params.id },
    data: {
      ...body,
      coordStatus:      coordCheck.status,
      coordNeedsUpdate: coordCheck.needsUpdate,
      coordCheckedAt:   new Date(),
    }
  })

  // Координат зассан бол task устгах
  if (!coordCheck.needsUpdate) {
    await db.sellerTask.deleteMany({
      where: {
        entityId,
        type:       'UPDATE_LOCATION_COORDS',
        locationId: params.id,
      }
    })
  }

  return Response.json(updated)
}
```

---

## 4. ADMIN DASHBOARD — /admin/locations

```typescript
// app/admin/locations/page.tsx

import { validateCoords, getCoordStats } from '@/lib/location/validateCoords'

export default async function AdminLocationsPage() {
  const locations = await db.storeLocation.findMany({
    where:   { isActive: true },
    include: { entity: { select: { id: true, name: true } } },
    orderBy: { coordNeedsUpdate: 'desc' },
  })

  const stats = getCoordStats(locations)

  return (
    <AdminLayout>
      <PageHeader
        title="Байршлын координат шалгалт"
        subtitle={`Нийт ${stats.total} байршил · ${stats.needsUpdate} шинэчлэх шаардлагатай`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <NotifyAllButton  count={stats.needsUpdate} />
            <AutoGeocodeButton />
          </div>
        }
      />

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
        <StatCard label="Нийт байршил"         value={stats.total}       color="blue"    />
        <StatCard label="Зөв координаттай"      value={stats.valid}       color="green"   />
        <StatCard label="Координат байхгүй"     value={stats.missing}     color="danger"  />
        <StatCard label="Шинэчлэх шаардлагатай" value={stats.needsUpdate} color="warning" />
      </div>

      {/* Warning banner */}
      {stats.needsUpdate > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border:     '0.5px solid rgba(245,158,11,0.25)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontWeight: 500, color: '#F59E0B', fontSize: 13 }}>
              {stats.needsUpdate} дэлгүүрт координат дутуу / буруу байна
            </p>
            <p style={{ fontSize: 11, color: '#A0A0A0', marginTop: 2 }}>
              Дэлгүүр эзэдэд мэдэгдэл явуулах эсвэл хаягаар автомат geocode хийж болно
            </p>
          </div>
          <NotifyAllButton count={stats.needsUpdate} />
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#1A1A1A', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid #3D3D3D' }}>
              {['Дэлгүүр', 'Хаяг', 'Координат', 'Статус', 'Сүүлд шалгасан', 'Үйлдэл']
                .map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left',
                    fontSize: 10, color: '#A0A0A0', textTransform: 'uppercase',
                    letterSpacing: '0.06em', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locations.map(loc => {
              const check = validateCoords(loc.lat, loc.lng)
              return (
                <tr key={loc.id}
                  style={{ borderBottom: '0.5px solid #2A2A2A' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <p style={{ fontWeight: 500, color: '#fff' }}>{loc.entity.name}</p>
                    <p style={{ fontSize: 11, color: '#A0A0A0' }}>{loc.name}</p>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#E0E0E0', fontSize: 11 }}>
                    {loc.district}<br/>{loc.address?.slice(0, 28)}...
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#E0E0E0' }}>
                    {loc.lat != null
                      ? `${loc.lat.toFixed(4)}, ${loc.lng?.toFixed(4)}`
                      : <span style={{ color: '#555' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <CoordStatusBadge status={check.status} />
                  </td>
                  <td style={{ padding: '10px 14px', color: '#A0A0A0', fontSize: 11 }}>
                    {loc.coordCheckedAt
                      ? formatDistanceToNow(loc.coordCheckedAt, { addSuffix: true })
                      : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`/admin/locations/${loc.id}/fix`}>
                        <button style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 11,
                          border: '0.5px solid #3D3D3D', background: 'none', color: '#E0E0E0', cursor: 'pointer',
                        }}>Засах</button>
                      </a>
                      {check.needsUpdate && (
                        <NotifySellerButton entityId={loc.entity.id} locationId={loc.id} />
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

// Status badge component
function CoordStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    valid_ub:       { label: 'УБ ✓',           bg: 'rgba(34,197,94,0.12)',  color: '#4ADE80' },
    valid_mongolia: { label: 'Монгол ✓',       bg: 'rgba(34,197,94,0.12)',  color: '#4ADE80' },
    outside:        { label: 'Монголоос гадна', bg: 'rgba(220,38,38,0.12)', color: '#F87171' },
    zero:           { label: '0,0 буруу',       bg: 'rgba(245,158,11,0.12)', color: '#FBBF24' },
    missing:        { label: 'Байхгүй',         bg: 'rgba(220,38,38,0.12)', color: '#F87171' },
  }
  const c = config[status] || config.missing
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px',
      borderRadius: 99, background: c.bg, color: c.color,
    }}>
      {c.label}
    </span>
  )
}
```

---

## 5. SELLER REMINDER COMPONENTS

```tsx
// components/seller/LocationCoordReminder.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { validateCoords } from '@/lib/location/validateCoords'

// Dashboard дээд хэсэгт харуулах banner
export function LocationCoordReminder({ entityId }: { entityId: string }) {
  const { data = [] } = useQuery({
    queryKey:  ['locations-check', entityId],
    queryFn:   () => fetch('/api/seller/locations?filter=needs_coords').then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  if (!data.length) return null

  return (
    <div style={{
      background:   'rgba(245,158,11,0.08)',
      border:       '0.5px solid rgba(245,158,11,0.25)',
      borderRadius: 10,
      padding:      '12px 16px',
      marginBottom: 16,
      display:      'flex',
      alignItems:   'center',
      gap:          12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(245,158,11,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
          stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round">
          <path d="M8 1L1 14h14L8 1z"/><path d="M8 6v4M8 11v1"/>
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#FBBF24', marginBottom: 2 }}>
          {data.length} байршлын координат шинэчлэх шаардлагатай
        </p>
        <p style={{ fontSize: 11, color: '#A0A0A0' }}>
          Хэрэглэгчид газрын зурагт таны дэлгүүрийг харахгүй байж болно
        </p>
      </div>

      <a href="/dashboard/seller/locations?filter=needs_coords" style={{
        padding:       '6px 14px',
        borderRadius:  8,
        background:    'rgba(245,158,11,0.15)',
        border:        '0.5px solid rgba(245,158,11,0.3)',
        color:         '#FBBF24',
        fontSize:      12,
        fontWeight:    500,
        textDecoration:'none',
        flexShrink:    0,
        whiteSpace:    'nowrap',
      }}>
        Засах →
      </a>
    </div>
  )
}

// Байршлын карт доторх badge
export function LocationCoordBadge({
  lat, lng
}: { lat: number | null; lng: number | null }) {
  const check = validateCoords(lat, lng)
  if (check.valid) return null

  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          4,
      padding:      '2px 8px',
      borderRadius: 99,
      background:   'rgba(245,158,11,0.12)',
      border:       '0.5px solid rgba(245,158,11,0.25)',
      fontSize:     10,
      color:        '#FBBF24',
    }}>
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 1L1 14h14L8 1z"/><path d="M8 6v3M8 10v1"/>
      </svg>
      Координат дутуу
    </span>
  )
}
```

---

## 6. CRON JOB — 7 хоног бүр автомат шалгалт

```typescript
// app/api/cron/check-locations/route.ts
// vercel.json: { "crons": [{ "path": "/api/cron/check-locations", "schedule": "0 10 * * 4" }] }

import { validateCoords } from '@/lib/location/validateCoords'
import { subDays }        from 'date-fns'

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const locations = await db.storeLocation.findMany({
    where:   { isActive: true },
    include: {
      entity: {
        include: { user: { select: { id: true, email: true, name: true } } }
      }
    },
  })

  let valid = 0, flagged = 0, notified = 0

  for (const loc of locations) {
    const check = validateCoords(loc.lat, loc.lng)

    // Статус DB-д шинэчлэх
    await db.storeLocation.update({
      where: { id: loc.id },
      data:  {
        coordStatus:      check.status,
        coordNeedsUpdate: check.needsUpdate,
        coordCheckedAt:   new Date(),
      }
    })

    if (!check.needsUpdate) { valid++; continue }

    flagged++

    // 7 хоногт нэг л удаа мэдэгдэл явуулах
    const recentNotif = await db.notification.findFirst({
      where: {
        userId:    loc.entity.user.id,
        type:      'LOCATION_COORD_MISSING',
        refId:     loc.id,
        createdAt: { gte: subDays(new Date(), 7) },
      }
    })

    if (!recentNotif) {
      // In-app notification
      await db.notification.create({
        data: {
          userId:  loc.entity.user.id,
          type:    'LOCATION_COORD_MISSING',
          refId:   loc.id,
          title:   'Байршлын координат шинэчлэх шаардлагатай',
          message: `"${loc.name}" байршлын координат дутуу байна. Засна уу.`,
          url:     `/dashboard/seller/locations/${loc.id}/edit`,
        }
      })

      // Email reminder
      await emailService.send(
        loc.entity.user.email,
        '📍 Байршлын координатаа шинэчлэнэ үү — Eseller.mn',
        `<p>Сайн байна уу, ${loc.entity.user.name}!</p>
         <p>"${loc.name}" байршлын координат дутуу байгаа тул хэрэглэгчид
         газрын зурагт таны дэлгүүрийг харахгүй байна.</p>
         <p><a href="${process.env.APP_URL}/dashboard/seller/locations/${loc.id}/edit"
           style="background:#E8242C;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">
           Координат засах →
         </a></p>`,
        { campaignId: `coord-check-${loc.id}` }
      )

      notified++
    }
  }

  // Admin-д нийт тайлан
  await db.adminLog.create({
    data: {
      type:    'CRON_COORD_CHECK',
      message: `Координат шалгалт дууслаа: нийт ${locations.length}, зөв ${valid}, алдаатай ${flagged}, мэдэгдэл ${notified}`,
    }
  })

  return Response.json({
    total: locations.length,
    valid, flagged, notified,
    checkedAt: new Date().toISOString(),
  })
}
```

---

## 7. ХЭРЭГЖИЛТИЙН ДАРААЛАЛ

```
1. validateCoords utility функц үүсгэх
   → lib/location/validateCoords.ts

2. Prisma migration
   → StoreLocation-д coordStatus, coordNeedsUpdate, coordCheckedAt нэмэх
   → npx prisma migrate dev --name add_coord_validation

3. API routes шинэчлэх
   → POST /api/seller/locations — координат шалгаж хадгалах
   → PATCH /api/seller/locations/[id] — засахад дахин шалгах
   → GET /api/seller/locations?filter=needs_coords — шүүж авах

4. Admin хуудас үүсгэх
   → /admin/locations — CoordStatusBadge, stats, notify button

5. Seller reminder нэмэх
   → LocationCoordReminder — dashboard-ийн дээд хэсэгт
   → LocationCoordBadge — байршлын карт доторх badge
   → app/dashboard/seller/layout.tsx-д нэмэх

6. Vercel Cron тохируулах
   → vercel.json-д cron нэмэх
   → CRON_SECRET environment variable нэмэх
```
