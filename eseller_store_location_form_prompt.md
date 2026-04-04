# Eseller.mn — Дэлгүүрийн байршил нэмэх форм
## Claude Code Prompt — Store Location Form

Дэлгүүрийн байршил нэмэх / засах хуудас хэрэгжүүл.
Route: /dashboard/seller/locations/new болон /dashboard/seller/locations/[id]/edit

---

## 1. PRISMA SCHEMA

```prisma
model StoreLocation {
  id          String   @id @default(cuid())
  entityId    String
  name        String                        // "Sarana Fashion — Хан-Уул салбар"
  isPrimary   Boolean  @default(false)      // Үндсэн байршил эсэх

  // Хаяг
  district    String                        // Дүүрэг
  khoroo      String                        // Хороо
  address     String                        // Дэлгэрэнгүй хаяг
  landmark    String?                       // Ойрын тэмдэгт газар
  lat         Float?                        // Газрын зургийн координат
  lng         Float?

  // Цагийн хуваарь
  hours       Json     @default("{}")
  // {
  //   mon: { open: "09:00", close: "21:00", closed: false },
  //   tue: { open: "09:00", close: "21:00", closed: false },
  //   wed: { open: "09:00", close: "21:00", closed: false },
  //   thu: { open: "09:00", close: "21:00", closed: false },
  //   fri: { open: "09:00", close: "22:00", closed: false },
  //   sat: { open: "10:00", close: "22:00", closed: false },
  //   sun: { open: "10:00", close: "20:00", closed: false },
  // }

  // Холбоо барих
  phone       String
  phone2      String?
  email       String?
  website     String?
  facebook    String?
  instagram   String?
  whatsapp    String?

  // Онцлог
  features    String[] @default([])
  // ["parking", "elevator", "card_payment", "foreign_lang", "delivery", "returns", "security", "wheelchair"]

  notes       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  entity      Entity   @relation(fields: [entityId], references: [id])
}
```

---

## 2. PAGE STRUCTURE

```
/dashboard/seller/locations
├── page.tsx          — Байршлуудын жагсаалт (карт + map preview)
├── new/page.tsx      — Шинэ байршил нэмэх
└── [id]/
    └── edit/page.tsx — Байршил засах
```

---

## 3. LOCATION FORM COMPONENT

```tsx
// app/dashboard/seller/locations/new/page.tsx
// app/dashboard/seller/locations/[id]/edit/page.tsx

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const locationSchema = z.object({
  name:      z.string().min(2, 'Нэр оруулна уу').max(100),
  district:  z.string().min(1, 'Дүүрэг сонгоно уу'),
  khoroo:    z.string().min(1, 'Хороо сонгоно уу'),
  address:   z.string().min(5, 'Дэлгэрэнгүй хаяг оруулна уу'),
  landmark:  z.string().optional(),
  lat:       z.number().optional(),
  lng:       z.number().optional(),
  phone:     z.string().regex(/^\+?976[0-9]{8}$/, 'Утасны дугаар буруу'),
  phone2:    z.string().optional(),
  email:     z.string().email().optional().or(z.literal('')),
  website:   z.string().url().optional().or(z.literal('')),
  facebook:  z.string().optional(),
  instagram: z.string().optional(),
  whatsapp:  z.string().optional(),
  hours:     z.object({
    mon: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    tue: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    wed: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    thu: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    fri: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    sat: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    sun: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  }),
  features: z.array(z.string()).default([]),
  notes:    z.string().optional(),
})

type LocationForm = z.infer<typeof locationSchema>

const DEFAULT_HOURS = {
  mon: { open: '09:00', close: '21:00', closed: false },
  tue: { open: '09:00', close: '21:00', closed: false },
  wed: { open: '09:00', close: '21:00', closed: false },
  thu: { open: '09:00', close: '21:00', closed: false },
  fri: { open: '09:00', close: '22:00', closed: false },
  sat: { open: '10:00', close: '22:00', closed: false },
  sun: { open: '10:00', close: '20:00', closed: false },
}

const DISTRICTS = [
  'Хан-Уул дүүрэг', 'Сүхбаатар дүүрэг', 'Баянгол дүүрэг',
  'Баянзүрх дүүрэг', 'Чингэлтэй дүүрэг', 'Налайх дүүрэг',
  'Багануур дүүрэг', 'Багахангай дүүрэг', 'Сонгинохайрхан дүүрэг',
]

const FEATURES = [
  { key: 'parking',      label: 'Машины зогсоол' },
  { key: 'elevator',     label: 'Лифт байна' },
  { key: 'card_payment', label: 'Картаар төлнэ' },
  { key: 'foreign_lang', label: 'Гадаад хэл' },
  { key: 'delivery',     label: 'Хүргэлтэй' },
  { key: 'returns',      label: 'Буцаалттай' },
  { key: 'wheelchair',   label: 'Хөгжлийн бэрхшээлтэй' },
  { key: 'security',     label: 'Аюулгүй байдал' },
]

const DAY_LABELS: Record<string, string> = {
  mon: 'Даваа', tue: 'Мягмар', wed: 'Лхагва',
  thu: 'Пүрэв', fri: 'Баасан', sat: 'Бямба', sun: 'Ням',
}

// Time options: 00:00 – 23:30 (30 min intervals)
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

export default function LocationFormPage({
  initialData,
  entityId,
}: {
  initialData?: Partial<LocationForm>
  entityId: string
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [mapCoords, setMapCoords] = useState({
    lat: initialData?.lat || 47.8864,
    lng: initialData?.lng || 106.9057,
  })

  const { register, control, handleSubmit, watch, setValue,
    formState: { errors } } = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      hours:    DEFAULT_HOURS,
      features: [],
      ...initialData,
    },
  })

  const features = watch('features')

  const toggleFeature = (key: string) => {
    const current = features || []
    setValue(
      'features',
      current.includes(key) ? current.filter(f => f !== key) : [...current, key]
    )
  }

  const applyTemplate = (template: 'weekdays' | 'daily' | 'weekend') => {
    const templates = {
      weekdays: {
        mon: { open: '09:00', close: '18:00', closed: false },
        tue: { open: '09:00', close: '18:00', closed: false },
        wed: { open: '09:00', close: '18:00', closed: false },
        thu: { open: '09:00', close: '18:00', closed: false },
        fri: { open: '09:00', close: '18:00', closed: false },
        sat: { open: '10:00', close: '16:00', closed: false },
        sun: { open: '10:00', close: '16:00', closed: true  },
      },
      daily: {
        mon: { open: '09:00', close: '21:00', closed: false },
        tue: { open: '09:00', close: '21:00', closed: false },
        wed: { open: '09:00', close: '21:00', closed: false },
        thu: { open: '09:00', close: '21:00', closed: false },
        fri: { open: '09:00', close: '21:00', closed: false },
        sat: { open: '09:00', close: '21:00', closed: false },
        sun: { open: '09:00', close: '21:00', closed: false },
      },
      weekend: {
        mon: { open: '09:00', close: '18:00', closed: true  },
        tue: { open: '09:00', close: '18:00', closed: true  },
        wed: { open: '09:00', close: '18:00', closed: true  },
        thu: { open: '09:00', close: '18:00', closed: true  },
        fri: { open: '09:00', close: '18:00', closed: true  },
        sat: { open: '10:00', close: '20:00', closed: false },
        sun: { open: '10:00', close: '20:00', closed: false },
      },
    }
    setValue('hours', templates[template])
  }

  const onSubmit = async (data: LocationForm) => {
    setSaving(true)
    try {
      const method  = initialData ? 'PATCH' : 'POST'
      const url     = initialData
        ? `/api/seller/locations/${(initialData as any).id}`
        : '/api/seller/locations'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...data, entityId, lat: mapCoords.lat, lng: mapCoords.lng }),
      })

      if (!res.ok) throw new Error('Хадгалахад алдаа гарлаа')

      router.push('/dashboard/seller/locations')
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#A0A0A0] mb-6">
        <span>Дэлгүүрийн тохиргоо</span>
        <ChevronRight size={14} />
        <a href="/dashboard/seller/locations" className="hover:text-white">Байршлууд</a>
        <ChevronRight size={14} />
        <span className="text-white">{initialData ? 'Засах' : 'Шинэ байршил'}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">
            {initialData ? 'Байршил засах' : 'Шинэ байршил нэмэх'}
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-1">
            Дэлгүүрийн хаяг, цагийн хуваарь, холбоо барих мэдээлэл
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">

        {/* ── Card 1: Address ── */}
        <FormCard title="Хаягийн мэдээлэл" icon={<MapPin size={16} color="#E8242C" />}>

          <FormField label="Байршлын нэр" required error={errors.name?.message}>
            <input {...register('name')}
              placeholder="жш: Гол салбар · Зайсан · 2-р давхар" />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Дүүрэг" required error={errors.district?.message}>
              <select {...register('district')}>
                <option value="">Дүүрэг сонгох...</option>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </FormField>

            <FormField label="Хороо" required error={errors.khoroo?.message}>
              <select {...register('khoroo')}>
                <option value="">Хороо сонгох...</option>
                {Array.from({ length: 20 }, (_, i) => (
                  <option key={i+1}>{i+1}-р хороо</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Дэлгэрэнгүй хаяг" required error={errors.address?.message}
            hint="Байшин, орц, тоот, дэлгүүрийн нэр">
            <input {...register('address')}
              placeholder="жш: Зайсан Хилл Молл, 2 давхар, Б-205" />
          </FormField>

          <FormField label="Ойрын тэмдэгт газар"
            hint="Хэрэглэгч хаанаас хэрхэн олохыг тайлбарлана">
            <input {...register('landmark')}
              placeholder="жш: Зайсан мемориалаас 200м, улаан барилгын урд" />
          </FormField>

          {/* Map picker */}
          <FormField label="Газрын зураг дээр тэмдэглэх">
            <MapPicker
              lat={mapCoords.lat}
              lng={mapCoords.lng}
              onChange={(lat, lng) => setMapCoords({ lat, lng })}
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-[10px] text-[#A0A0A0] mb-1">Өргөрөг (lat)</p>
                <input value={mapCoords.lat.toFixed(6)} readOnly
                  className="font-mono text-xs bg-[#2A2A2A]" />
              </div>
              <div>
                <p className="text-[10px] text-[#A0A0A0] mb-1">Уртраг (lng)</p>
                <input value={mapCoords.lng.toFixed(6)} readOnly
                  className="font-mono text-xs bg-[#2A2A2A]" />
              </div>
            </div>
          </FormField>
        </FormCard>

        {/* ── Card 2: Hours ── */}
        <FormCard
          title="Цагийн хуваарь"
          icon={<Clock size={16} color="#3B82F6" />}
          action={
            <TemplateDropdown onSelect={applyTemplate} />
          }
        >
          {/* Header row */}
          <div className="grid grid-cols-[90px_1fr_1fr_80px] gap-2 pb-2 border-b border-[#3D3D3D] mb-3
            text-[10px] font-medium text-[#A0A0A0] uppercase tracking-wider">
            <span>Өдөр</span>
            <span>Нээх</span>
            <span>Хаах</span>
            <span className="text-center">Хаалттай</span>
          </div>

          {Object.entries(DAY_LABELS).map(([day, label]) => (
            <Controller key={day} name={`hours.${day as keyof typeof DEFAULT_HOURS}`}
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-[90px_1fr_1fr_80px] gap-2 items-center mb-3">
                  <span className="text-sm text-[#E0E0E0]">{label}</span>

                  <select
                    value={field.value.open}
                    disabled={field.value.closed}
                    onChange={e => field.onChange({ ...field.value, open: e.target.value })}
                    className={field.value.closed ? 'opacity-30' : ''}
                  >
                    {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>

                  <select
                    value={field.value.close}
                    disabled={field.value.closed}
                    onChange={e => field.onChange({ ...field.value, close: e.target.value })}
                    className={field.value.closed ? 'opacity-30' : ''}
                  >
                    {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>

                  <div className="flex items-center justify-center">
                    <button type="button"
                      onClick={() => field.onChange({ ...field.value, closed: !field.value.closed })}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        field.value.closed ? 'bg-[#E8242C]' : 'bg-[#3D3D3D]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${
                        field.value.closed ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              )}
            />
          ))}
        </FormCard>

        {/* ── Card 3: Contact ── */}
        <FormCard title="Холбоо барих" icon={<Phone size={16} color="#22C55E" />}>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Утасны дугаар" required error={errors.phone?.message}>
              <input {...register('phone')} placeholder="+976 9900 0000" />
            </FormField>
            <FormField label="Нэмэлт утас">
              <input {...register('phone2')} placeholder="+976 9900 0001" />
            </FormField>
          </div>

          <FormField label="Имэйл хаяг">
            <input {...register('email')} placeholder="sarana@gmail.com" />
          </FormField>

          <FormField label="Вэб сайт">
            <input {...register('website')} placeholder="https://sarana.mn" />
          </FormField>

          {/* Social */}
          <div className="border-t border-[#3D3D3D] pt-4 mt-2">
            <p className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider mb-3">
              Сошиал сүлжээ
            </p>
            <div className="space-y-2">
              <SocialInput icon="facebook"   {...register('facebook')}   placeholder="facebook.com/sarana" />
              <SocialInput icon="instagram"  {...register('instagram')}  placeholder="instagram.com/sarana" />
              <SocialInput icon="whatsapp"   {...register('whatsapp')}   placeholder="+976 9900 0000" />
            </div>
          </div>
        </FormCard>

        {/* ── Card 4: Features ── */}
        <FormCard title="Нэмэлт мэдээлэл" icon={<Star size={16} color="#F59E0B" />}>

          <p className="text-xs text-[#A0A0A0] mb-3">Давуу тал, боломжууд</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {FEATURES.map(f => (
              <button key={f.key} type="button"
                onClick={() => toggleFeature(f.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all ${
                  features?.includes(f.key)
                    ? 'border-[#E8242C] bg-[rgba(232,36,44,0.08)] text-[#E8242C]'
                    : 'border-[#3D3D3D] bg-[#2A2A2A] text-[#A0A0A0] hover:border-[#555]'
                }`}>
                <FeatureIcon type={f.key} />
                <span className="text-center leading-tight">{f.label}</span>
              </button>
            ))}
          </div>

          <FormField label="Нэмэлт тэмдэглэл">
            <textarea {...register('notes')} rows={3}
              placeholder="Хэрэглэгчид мэдэх ёстой бусад мэдээлэл..." />
          </FormField>
        </FormCard>

        {/* Action bar */}
        <div className="flex items-center justify-between py-4">
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg border border-[#3D3D3D] text-sm text-[#A0A0A0] hover:bg-[#2A2A2A] transition-colors">
            Болих
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[#E8242C] hover:bg-[#C41E25] text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {saving ? 'Хадгалж байна...' : 'Байршил хадгалах →'}
          </button>
        </div>

      </form>
    </DashboardLayout>
  )
}
```

---

## 4. MAP PICKER COMPONENT

```tsx
// components/seller/MapPicker.tsx
// Leaflet.js ашиглана (Cloudflare CDN дэмжинэ)

'use client'
import { useEffect, useRef } from 'react'

interface MapPickerProps {
  lat:      number
  lng:      number
  onChange: (lat: number, lng: number) => void
}

export function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const mapRef  = useRef<HTMLDivElement>(null)
  const mapObj  = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return

    // Leaflet dynamic import
    import('leaflet').then(L => {
      const map = L.map(mapRef.current!).setView([lat, lng], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)

      const icon = L.divIcon({
        html: `<div style="width:24px;height:24px;background:#E8242C;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className: '',
      })

      const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map)
      markerRef.current = marker

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)))
      })

      map.on('click', (e: any) => {
        const pos = e.latlng
        marker.setLatLng(pos)
        onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)))
      })

      mapObj.current = map
    })

    return () => {
      mapObj.current?.remove()
      mapObj.current = null
    }
  }, [])

  return (
    <div ref={mapRef}
      style={{ height: '220px', borderRadius: '10px', overflow: 'hidden',
        border: '0.5px solid #3D3D3D' }}
    />
  )
}
```

---

## 5. API ROUTES

```typescript
// app/api/seller/locations/route.ts
export async function GET(req: Request) {
  const session  = await requireAuth(req)
  const entityId = await getActiveEntityId(session.user.id)
  const locations = await db.storeLocation.findMany({
    where:   { entityId, isActive: true },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  })
  return Response.json(locations)
}

export async function POST(req: Request) {
  const session  = await requireAuth(req)
  const entityId = await getActiveEntityId(session.user.id)
  const body     = await req.json()

  // First location = primary automatically
  const count = await db.storeLocation.count({ where: { entityId } })
  const location = await db.storeLocation.create({
    data: { ...body, entityId, isPrimary: count === 0 }
  })

  // Invalidate store profile cache
  await revalidateTag(`store-${entityId}`)

  return Response.json(location, { status: 201 })
}

// app/api/seller/locations/[id]/route.ts
export async function PATCH(req, { params }) {
  const session  = await requireAuth(req)
  const entityId = await getActiveEntityId(session.user.id)

  // Ownership check
  const existing = await db.storeLocation.findFirst({
    where: { id: params.id, entityId }
  })
  if (!existing) return new Response('Not found', { status: 404 })

  const body = await req.json()
  const updated = await db.storeLocation.update({
    where: { id: params.id },
    data:  body,
  })
  return Response.json(updated)
}

export async function DELETE(req, { params }) {
  const session  = await requireAuth(req)
  const entityId = await getActiveEntityId(session.user.id)

  // Can't delete primary location if others exist
  const location = await db.storeLocation.findFirst({
    where: { id: params.id, entityId }
  })
  if (!location) return new Response('Not found', { status: 404 })
  if (location.isPrimary) {
    const count = await db.storeLocation.count({ where: { entityId, isActive: true } })
    if (count > 1) return new Response('Primary байршлыг устгах боломжгүй', { status: 400 })
  }

  await db.storeLocation.update({
    where: { id: params.id },
    data:  { isActive: false }
  })
  return new Response(null, { status: 204 })
}
```

---

## 6. LOCATIONS LIST PAGE

```tsx
// app/dashboard/seller/locations/page.tsx

export default async function LocationsPage() {
  const session   = await getServerSession()
  const entityId  = await getActiveEntityId(session!.user.id)
  const locations = await db.storeLocation.findMany({
    where:   { entityId, isActive: true },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  })

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Байршлууд</h1>
          <p className="text-sm text-[#A0A0A0]">{locations.length} байршил бүртгэлтэй</p>
        </div>
        <Link href="/dashboard/seller/locations/new">
          <Button variant="primary">+ Байршил нэмэх</Button>
        </Link>
      </div>

      {locations.length === 0 ? (
        <EmptyState
          icon={<MapPin />}
          title="Байршил нэмээгүй байна"
          description="Дэлгүүрийн байршлаа нэмж хэрэглэгчдэд олдохоо болго"
          action={
            <Link href="/dashboard/seller/locations/new">
              <Button variant="primary">Байршил нэмэх</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {locations.map(loc => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

function LocationCard({ location }) {
  const todayHours = getTodayHours(location.hours)

  return (
    <div className="bg-[#1A1A1A] border border-[#3D3D3D] rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(232,36,44,0.1)] flex items-center justify-center">
            <MapPin size={18} color="#E8242C" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white">{location.name}</p>
              {location.isPrimary && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(232,36,44,0.15)] text-[#E8242C] border border-[rgba(232,36,44,0.3)]">
                  Үндсэн
                </span>
              )}
            </div>
            <p className="text-sm text-[#A0A0A0]">{location.district}, {location.address}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/seller/locations/${location.id}/edit`}>
            <button className="px-3 py-1.5 text-xs border border-[#3D3D3D] rounded-lg text-[#A0A0A0] hover:bg-[#2A2A2A]">
              Засах
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#3D3D3D]">
        <div>
          <p className="text-[10px] text-[#555] mb-1">Өнөөдрийн цаг</p>
          <p className="text-xs text-[#E0E0E0]">{todayHours}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#555] mb-1">Утас</p>
          <p className="text-xs text-[#E0E0E0]">{location.phone}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#555] mb-1">Онцлог</p>
          <p className="text-xs text-[#E0E0E0]">{location.features?.length || 0} боломж</p>
        </div>
      </div>
    </div>
  )
}
```

---

## 7. PACKAGE DEPENDENCIES

```bash
# Leaflet map
npm install leaflet @types/leaflet

# Form validation
npm install react-hook-form @hookform/resolvers zod

# Already installed:
# next, prisma, @prisma/client, react
```

---

## 8. SIDEBAR MENU — нэмэх

```tsx
// Dashboard sidebar-д нэмэх:
{
  label: 'Байршлууд',
  icon:  MapPin,
  href:  '/dashboard/seller/locations',
}
// "Дэлгүүрийн тохиргоо" section дотор
```

---

## IMPLEMENTATION ORDER

```
1. Prisma migration: StoreLocation model нэмэх
2. /api/seller/locations GET + POST + PATCH + DELETE
3. MapPicker component (Leaflet)
4. LocationFormPage component (react-hook-form + zod)
5. /dashboard/seller/locations list page
6. /dashboard/seller/locations/new page
7. /dashboard/seller/locations/[id]/edit page
8. Sidebar menu-д байршлууд нэмэх
```
