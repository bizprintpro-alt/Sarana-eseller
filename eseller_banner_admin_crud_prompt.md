# Eseller.mn — Баннер удирдлагын Admin CRUD + Байршуулах хуудас
## Claude Code Prompt — Banner Management System

---

## PROMPT: BANNER MANAGEMENT SYSTEM — FULL IMPLEMENTATION

Build a complete banner management system for eseller.mn including:
- Admin CRUD for all banner slots
- Public-facing banner placement on homepage
- Seller self-service banner purchase flow
- Analytics & performance tracking
- Cloudinary image upload integration

Stack: Next.js 14 App Router, Prisma, Cloudinary, Zustand, React Query

---

## 1. PRISMA SCHEMA

```prisma
model Banner {
  id          String       @id @default(cuid())
  refId       String       @unique  // BNR-2604-001
  title       String                // Internal admin label
  slot        BannerSlot            // Which placement
  imageUrl    String                // Cloudinary URL (desktop)
  imageMobile String?               // Cloudinary URL (mobile, optional)
  linkUrl     String                // Click destination
  altText     String?               // Accessibility
  bgColor     String?               // Fallback bg color e.g. "#E8242C"

  // Ownership
  entityId    String?               // null = admin-placed (free/system)
  entityName  String?               // Denormalized for display

  // Scheduling
  status      BannerStatus @default(DRAFT)
  startsAt    DateTime
  endsAt      DateTime
  sortOrder   Int          @default(0)  // Within same slot

  // Payment
  isPaid      Boolean      @default(false)
  planId      String?
  paymentId   String?
  price       Float?

  // Analytics
  impressions Int          @default(0)
  clicks      Int          @default(0)

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  createdById String?      // admin user id

  entity      Entity?      @relation(fields: [entityId], references: [id])
  plan        BannerPlan?  @relation(fields: [planId], references: [id])
  analytics   BannerAnalytic[]
}

enum BannerSlot {
  HERO              // Hero carousel — нүүр хуудасны гол
  ANNOUNCEMENT      // Top marquee bar — navbar доорх мөр
  MID_PAGE          // Mid-page horizontal strip
  IN_FEED           // In-feed native sponsored card
  SIDEBAR_RIGHT     // Right sidebar sticky (desktop)
  SECTION_SEPARATOR // Between sections divider banner
  CATEGORY_TOP      // Category page top banner
  PRODUCT_BELOW     // Below product description
}

enum BannerStatus {
  DRAFT       // Ноорог
  PENDING     // Төлбөр хүлээгдэж байна
  SCHEDULED   // Тохируулсан, идэвхжээгүй
  ACTIVE      // Идэвхтэй, харагдаж байна
  PAUSED      // Түр зогссон
  EXPIRED     // Хугацаа дууссан
  REJECTED    // Админ татгалзсан
}

model BannerPlan {
  id           String       @id @default(cuid())
  name         String       // "Hero 7 хоног"
  slot         BannerSlot
  durationDays Int
  price        Float        // MNT
  isActive     Boolean      @default(true)
  sortOrder    Int          @default(0)
  maxPerPeriod Int?         // Max concurrent banners in this slot
  description  String?
  features     String[]     // Display features list
  createdAt    DateTime     @default(now())

  banners      Banner[]
}

model BannerAnalytic {
  id          String   @id @default(cuid())
  bannerId    String
  date        DateTime @db.Date
  impressions Int      @default(0)
  clicks      Int      @default(0)
  ctr         Float?   // clicks / impressions * 100

  banner      Banner   @relation(fields: [bannerId], references: [id])

  @@unique([bannerId, date])
}

// Announcement bar items (separate from banner slots)
model Announcement {
  id        String   @id @default(cuid())
  text      String
  icon      String?  // emoji or icon name
  linkUrl   String?
  isActive  Boolean  @default(true)
  sortOrder Int      @default(0)
  startsAt  DateTime?
  endsAt    DateTime?
  createdAt DateTime @default(now())
}
```

---

## 2. ADMIN BANNER MANAGEMENT — /admin/banners

### Page structure

```
/admin/banners
├── /                 — Overview: all banners table + slot grid
├── /new              — Create new banner (admin-placed)
├── /[id]             — Edit banner
├── /slots            — Slot availability calendar view
├── /plans            — Banner plan CRUD (pricing)
└── /analytics        — Performance dashboard
```

### Main page — /admin/banners/page.tsx

```tsx
// app/admin/banners/page.tsx
import { BannerStatsRow } from '@/components/admin/banners/BannerStatsRow'
import { SlotAvailabilityGrid } from '@/components/admin/banners/SlotAvailabilityGrid'
import { BannersTable } from '@/components/admin/banners/BannersTable'

export default async function AdminBannersPage() {
  const [stats, banners, slots] = await Promise.all([
    getBannerStats(),
    getBanners({ page: 1, limit: 20 }),
    getSlotAvailability(),
  ])

  return (
    <AdminLayout>
      <PageHeader
        title="Баннер удирдлага"
        subtitle="Бүх байршлын баннер хяналт"
        action={
          <Link href="/admin/banners/new">
            <Button variant="primary">+ Баннер нэмэх</Button>
          </Link>
        }
      />

      {/* Stats */}
      <BannerStatsRow stats={stats} />

      {/* Slot availability overview */}
      <SlotAvailabilityGrid slots={slots} />

      {/* Banners table */}
      <BannersTable initialData={banners} />
    </AdminLayout>
  )
}
```

### Stats row component

```tsx
// components/admin/banners/BannerStatsRow.tsx
export function BannerStatsRow({ stats }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
      gap: '10px',
      marginBottom: '24px',
    }}>
      {[
        { label: 'Нийт идэвхтэй',    value: stats.active,     color: '#22C55E' },
        { label: 'Өнөөдөр дуусах',   value: stats.expiringToday, color: '#F59E0B' },
        { label: 'Хүлээгдэж буй',    value: stats.pending,    color: '#E8242C' },
        { label: 'Энэ сарын орлого', value: stats.revenue,    color: '#3B82F6', isMoney: true },
        { label: 'Нийт impression',  value: stats.impressions, suffix: 'K' },
      ].map(stat => (
        <div key={stat.label} style={{
          background: 'var(--esl-bg-surface)',
          border: '0.5px solid var(--esl-border)',
          borderRadius: '10px',
          padding: '14px',
        }}>
          <p style={{ fontSize: '11px', color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            {stat.label}
          </p>
          <p style={{ fontSize: '22px', fontWeight: 700, color: stat.color || '#fff' }}>
            {stat.isMoney
              ? `${(stat.value / 1_000_000).toFixed(1)}M₮`
              : stat.suffix
                ? `${(stat.value / 1000).toFixed(0)}${stat.suffix}`
                : stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
```

### Slot availability grid

```tsx
// components/admin/banners/SlotAvailabilityGrid.tsx
// Visual grid showing each slot and its current occupancy

const SLOT_LABELS: Record<BannerSlot, { label: string; maxConcurrent: number; price: string }> = {
  HERO:              { label: 'Hero carousel',     maxConcurrent: 5,  price: '500K–1.5M₮' },
  ANNOUNCEMENT:      { label: 'Announcement bar',  maxConcurrent: 6,  price: '50K–150K₮' },
  MID_PAGE:          { label: 'Mid-page strip',     maxConcurrent: 3,  price: '150K–400K₮' },
  IN_FEED:           { label: 'In-feed native',    maxConcurrent: 10, price: 'CPM загвар' },
  SIDEBAR_RIGHT:     { label: 'Sidebar sticky',    maxConcurrent: 2,  price: '120K–320K₮' },
  SECTION_SEPARATOR: { label: 'Section divider',   maxConcurrent: 3,  price: '100K–300K₮' },
  CATEGORY_TOP:      { label: 'Ангилалын дээд',   maxConcurrent: 8,  price: 'Ангилалаар' },
  PRODUCT_BELOW:     { label: 'Бараа доорх',       maxConcurrent: 4,  price: 'CPM загвар' },
}

export function SlotAvailabilityGrid({ slots }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '10px',
      marginBottom: '24px',
    }}>
      {Object.entries(SLOT_LABELS).map(([slotKey, cfg]) => {
        const slotData = slots[slotKey] || { active: 0, scheduled: 0 }
        const occupancy = (slotData.active / cfg.maxConcurrent) * 100
        const isFull = slotData.active >= cfg.maxConcurrent

        return (
          <Link key={slotKey} href={`/admin/banners/new?slot=${slotKey}`}>
            <div style={{
              background: 'var(--esl-bg-surface)',
              border: `0.5px solid ${isFull ? '#E8242C' : '#3D3D3D'}`,
              borderRadius: '10px',
              padding: '12px',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>{cfg.label}</span>
                <span style={{
                  fontSize: '10px', fontWeight: 500, padding: '2px 7px', borderRadius: '99px',
                  background: isFull ? 'rgba(232,36,44,0.15)' : 'rgba(34,197,94,0.15)',
                  color: isFull ? '#FF4D53' : '#4ade80',
                }}>
                  {isFull ? 'Дүүрсэн' : `${slotData.active}/${cfg.maxConcurrent}`}
                </span>
              </div>
              {/* Occupancy bar */}
              <div style={{ height: '4px', background: '#2A2A2A', borderRadius: '99px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{
                  height: '100%', borderRadius: '99px',
                  width: `${Math.min(100, occupancy)}%`,
                  background: isFull ? '#E8242C' : occupancy > 60 ? '#F59E0B' : '#22C55E',
                  transition: 'width 0.3s',
                }} />
              </div>
              <p style={{ fontSize: '10px', color: '#A0A0A0' }}>{cfg.price}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
```

### Banners table

```tsx
// components/admin/banners/BannersTable.tsx
'use client'

export function BannersTable({ initialData }) {
  const [filters, setFilters] = useState({ status: 'all', slot: 'all', search: '' })
  const [selected, setSelected] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners', filters],
    queryFn: () => fetch(`/api/admin/banners?${new URLSearchParams(filters)}`).then(r => r.json()),
    initialData,
  })

  return (
    <div style={{
      background: 'var(--esl-bg-surface)',
      border: '0.5px solid var(--esl-border)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', borderBottom: '0.5px solid #3D3D3D', flexWrap: 'wrap' }}>
        <SearchInput
          placeholder="Баннер хайх..."
          value={filters.search}
          onChange={v => setFilters(f => ({ ...f, search: v }))}
          style={{ flex: 1, minWidth: '180px' }}
        />
        <Select
          value={filters.status}
          onChange={v => setFilters(f => ({ ...f, status: v }))}
          options={[
            { value: 'all',       label: 'Бүх статус' },
            { value: 'ACTIVE',    label: 'Идэвхтэй' },
            { value: 'SCHEDULED', label: 'Хуваарьт' },
            { value: 'PENDING',   label: 'Хүлээгдэж буй' },
            { value: 'EXPIRED',   label: 'Дууссан' },
            { value: 'DRAFT',     label: 'Ноорог' },
          ]}
        />
        <Select
          value={filters.slot}
          onChange={v => setFilters(f => ({ ...f, slot: v }))}
          options={[
            { value: 'all', label: 'Бүх байршил' },
            ...Object.entries(SLOT_LABELS).map(([k, v]) => ({ value: k, label: v.label })),
          ]}
        />
        {selected.length > 0 && (
          <BulkActionsBar
            count={selected.length}
            onActivate={() => bulkUpdateStatus(selected, 'ACTIVE')}
            onPause={() => bulkUpdateStatus(selected, 'PAUSED')}
            onDelete={() => bulkDelete(selected)}
            onClear={() => setSelected([])}
          />
        )}
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '0.5px solid #3D3D3D' }}>
            <Th style={{ width: '32px' }}>
              <input type="checkbox"
                checked={selected.length === data?.items?.length}
                onChange={e => setSelected(e.target.checked ? data.items.map(b => b.id) : [])}
              />
            </Th>
            <Th>Баннер</Th>
            <Th>Байршил</Th>
            <Th>Дэлгүүр</Th>
            <Th>Хугацаа</Th>
            <Th>Статус</Th>
            <Th>CTR</Th>
            <Th>Үйлдэл</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <BannerRowSkeleton key={i} />)
          ) : (
            data?.items?.map(banner => (
              <BannerRow
                key={banner.id}
                banner={banner}
                isSelected={selected.includes(banner.id)}
                onToggleSelect={() => setSelected(s =>
                  s.includes(banner.id) ? s.filter(id => id !== banner.id) : [...s, banner.id]
                )}
              />
            ))
          )}
        </tbody>
      </table>

      <Pagination data={data?.meta} />
    </div>
  )
}

function BannerRow({ banner, isSelected, onToggleSelect }) {
  const daysLeft = differenceInDays(new Date(banner.endsAt), new Date())
  const ctr = banner.impressions > 0
    ? ((banner.clicks / banner.impressions) * 100).toFixed(2)
    : '0.00'

  return (
    <tr style={{
      borderBottom: '0.5px solid #3D3D3D',
      background: isSelected ? 'rgba(232,36,44,0.05)' : 'transparent',
    }}>
      <Td>
        <input type="checkbox" checked={isSelected} onChange={onToggleSelect} />
      </Td>
      <Td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Thumbnail */}
          <div style={{ width: '64px', height: '36px', borderRadius: '6px', overflow: 'hidden', background: '#2A2A2A', flexShrink: 0 }}>
            {banner.imageUrl && (
              <img src={banner.imageUrl} alt={banner.altText || banner.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
          <div>
            <p style={{ fontWeight: 500, color: '#fff', marginBottom: '2px' }}>{banner.title}</p>
            <p style={{ fontSize: '11px', color: '#A0A0A0', fontFamily: 'monospace' }}>{banner.refId}</p>
          </div>
        </div>
      </Td>
      <Td>
        <SlotBadge slot={banner.slot} />
      </Td>
      <Td>
        <p style={{ fontSize: '12px', color: '#E0E0E0' }}>{banner.entityName || '—'}</p>
      </Td>
      <Td>
        <p style={{ fontSize: '12px', color: '#E0E0E0' }}>
          {format(new Date(banner.startsAt), 'MM/dd')} – {format(new Date(banner.endsAt), 'MM/dd')}
        </p>
        {daysLeft >= 0 && daysLeft <= 3 && (
          <p style={{ fontSize: '10px', color: '#F59E0B' }}>{daysLeft} хоног үлдсэн</p>
        )}
      </Td>
      <Td>
        <StatusBadge status={banner.status} />
      </Td>
      <Td>
        <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#E0E0E0' }}>{ctr}%</p>
        <p style={{ fontSize: '10px', color: '#A0A0A0' }}>{banner.clicks} click</p>
      </Td>
      <Td>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Link href={`/admin/banners/${banner.id}`}>
            <ActionButton>Засах</ActionButton>
          </Link>
          <ActionButton
            onClick={() => toggleStatus(banner.id, banner.status)}
            variant={banner.status === 'ACTIVE' ? 'warn' : 'primary'}
          >
            {banner.status === 'ACTIVE' ? 'Зогсоох' : 'Идэвхжүүлэх'}
          </ActionButton>
          <ActionButton variant="danger" onClick={() => deleteBanner(banner.id)}>
            Устгах
          </ActionButton>
        </div>
      </Td>
    </tr>
  )
}
```

---

## 3. BANNER CREATE/EDIT FORM — /admin/banners/new + /admin/banners/[id]

```tsx
// app/admin/banners/[id]/page.tsx  (new uses id='new')
'use client'

export default function BannerEditPage({ params }) {
  const isNew = params.id === 'new'
  const banner = isNew ? null : await getBanner(params.id)

  const [form, setForm] = useState({
    title:       banner?.title || '',
    slot:        banner?.slot || (searchParams.get('slot') as BannerSlot) || 'HERO',
    imageUrl:    banner?.imageUrl || '',
    imageMobile: banner?.imageMobile || '',
    linkUrl:     banner?.linkUrl || '',
    altText:     banner?.altText || '',
    bgColor:     banner?.bgColor || '#E8242C',
    entityId:    banner?.entityId || '',
    planId:      banner?.planId || '',
    startsAt:    banner?.startsAt || addDays(new Date(), 1),
    endsAt:      banner?.endsAt || addDays(new Date(), 8),
    sortOrder:   banner?.sortOrder || 0,
    status:      banner?.status || 'DRAFT',
  })

  return (
    <AdminLayout>
      <PageHeader
        title={isNew ? 'Шинэ баннер нэмэх' : 'Баннер засах'}
        subtitle={isNew ? '' : `#${banner?.refId}`}
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" onClick={() => router.back()}>Болих</Button>
            <Button variant="primary" onClick={handleSave}>
              {isNew ? 'Баннер үүсгэх' : 'Хадгалах'}
            </Button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '16px', alignItems: 'start' }}>

        {/* Left: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Basic info */}
          <FormCard title="Үндсэн мэдээлэл">
            <FormField label="Баннерын нэр (дотоод)">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="жш: Hero – Зул сарын хямдрал 2026" />
            </FormField>

            <FormField label="Байршил (slot)">
              <Select
                value={form.slot}
                onChange={v => setForm(f => ({ ...f, slot: v }))}
                options={Object.entries(SLOT_LABELS).map(([k, v]) => ({ value: k, label: v.label }))}
              />
              <SlotDescription slot={form.slot} />
            </FormField>

            <FormField label="Дэлгүүр (сонголтоор)">
              <EntitySearch
                value={form.entityId}
                onChange={id => setForm(f => ({ ...f, entityId: id }))}
                placeholder="Дэлгүүр хайх..."
              />
            </FormField>

            <FormField label="Үнийн төлөвлөгөө">
              <PlanSelector
                slot={form.slot}
                value={form.planId}
                onChange={id => setForm(f => ({ ...f, planId: id }))}
              />
            </FormField>
          </FormCard>

          {/* Image upload */}
          <FormCard title="Зураг байршуулах">
            <FormField
              label="Desktop зураг"
              hint={SLOT_SPECS[form.slot]?.desktop || '1200×400px, JPG/PNG/WebP, max 2MB'}
            >
              <CloudinaryUploader
                value={form.imageUrl}
                onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
                folder="banners"
                transformation={SLOT_SPECS[form.slot]?.transform}
                accept="image/*"
                maxSizeMB={2}
              />
            </FormField>

            <FormField
              label="Mobile зураг (сонголтоор)"
              hint="375×200px — орхивол desktop зураг ашиглана"
            >
              <CloudinaryUploader
                value={form.imageMobile}
                onChange={url => setForm(f => ({ ...f, imageMobile: url }))}
                folder="banners/mobile"
                accept="image/*"
                maxSizeMB={1}
              />
            </FormField>

            <FormField label="Дарахад очих URL">
              <input value={form.linkUrl}
                onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                placeholder="https://eseller.mn/products?category=..." />
            </FormField>

            <FormField label="Alt текст (accessibility)">
              <input value={form.altText}
                onChange={e => setForm(f => ({ ...f, altText: e.target.value }))}
                placeholder="Зулсарын хямдрал — 50% хүртэл" />
            </FormField>

            <FormField label="Дэвсгэр өнгө (зураг ачаалахаас өмнө)">
              <ColorPicker
                value={form.bgColor}
                onChange={v => setForm(f => ({ ...f, bgColor: v }))}
              />
            </FormField>
          </FormCard>

          {/* Schedule */}
          <FormCard title="Хуваарь & Статус">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormField label="Эхлэх огноо">
                <DateTimePicker
                  value={form.startsAt}
                  onChange={v => setForm(f => ({ ...f, startsAt: v }))}
                  min={new Date()}
                />
              </FormField>
              <FormField label="Дуусах огноо">
                <DateTimePicker
                  value={form.endsAt}
                  onChange={v => setForm(f => ({ ...f, endsAt: v }))}
                  min={form.startsAt}
                />
              </FormField>
            </div>

            <FormField label="Дараалал (slot дотор)">
              <input type="number" value={form.sortOrder} min={0} max={99}
                onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
              <p style={{ fontSize: '11px', color: '#A0A0A0', marginTop: '4px' }}>
                0 = хамгийн эхэнд харагдана
              </p>
            </FormField>

            <FormField label="Статус">
              <Select
                value={form.status}
                onChange={v => setForm(f => ({ ...f, status: v }))}
                options={[
                  { value: 'DRAFT',     label: 'Ноорог' },
                  { value: 'SCHEDULED', label: 'Хуваарьт — огноо болоход автомат идэвхжинэ' },
                  { value: 'ACTIVE',    label: 'Шууд идэвхжүүлэх' },
                  { value: 'PAUSED',    label: 'Түр зогссон' },
                ]}
              />
            </FormField>
          </FormCard>
        </div>

        {/* Right: Live preview */}
        <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <BannerLivePreview banner={form} />

          {/* Duration & price summary */}
          {form.planId && (
            <BannerPriceSummary
              plan={plans.find(p => p.id === form.planId)}
              startsAt={form.startsAt}
              endsAt={form.endsAt}
            />
          )}

          {/* Slot conflict checker */}
          <SlotConflictChecker
            slot={form.slot}
            startsAt={form.startsAt}
            endsAt={form.endsAt}
            excludeId={banner?.id}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
```

---

## 4. BANNER LIVE PREVIEW COMPONENT

```tsx
// components/admin/banners/BannerLivePreview.tsx

export function BannerLivePreview({ banner }) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')

  return (
    <div style={{
      background: 'var(--esl-bg-surface)',
      border: '0.5px solid var(--esl-border)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #3D3D3D', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>Урьдчилж харах</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['desktop', 'mobile'].map(mode => (
            <button key={mode}
              onClick={() => setViewMode(mode as any)}
              style={{
                padding: '3px 10px', borderRadius: '99px', fontSize: '11px', border: 'none', cursor: 'pointer',
                background: viewMode === mode ? '#E8242C' : '#2A2A2A',
                color: viewMode === mode ? '#fff' : '#A0A0A0',
              }}>
              {mode === 'desktop' ? 'Desktop' : 'Mobile'}
            </button>
          ))}
        </div>
      </div>

      {/* Preview area */}
      <div style={{
        padding: '12px',
        background: '#0A0A0A',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          width: viewMode === 'mobile' ? '280px' : '100%',
          transition: 'width 0.3s',
        }}>
          <BannerSlotPreview
            slot={banner.slot}
            imageUrl={viewMode === 'mobile' && banner.imageMobile ? banner.imageMobile : banner.imageUrl}
            bgColor={banner.bgColor}
            linkUrl={banner.linkUrl}
          />
        </div>
      </div>

      {/* Specs */}
      <div style={{ padding: '10px 14px', fontSize: '11px', color: '#A0A0A0' }}>
        {SLOT_SPECS[banner.slot]?.description}
      </div>
    </div>
  )
}

// Renders a realistic preview per slot type
function BannerSlotPreview({ slot, imageUrl, bgColor, linkUrl }) {
  const wrapperStyle = {
    width: '100%',
    overflow: 'hidden',
    borderRadius: '6px',
    background: bgColor || '#1A1A1A',
    cursor: 'pointer',
  }

  const heightMap: Record<BannerSlot, string> = {
    HERO:              'clamp(120px, 25vw, 200px)',
    ANNOUNCEMENT:      '22px',
    MID_PAGE:          '80px',
    IN_FEED:           '120px',
    SIDEBAR_RIGHT:     '250px',
    SECTION_SEPARATOR: '60px',
    CATEGORY_TOP:      '100px',
    PRODUCT_BELOW:     '80px',
  }

  return (
    <div style={{ ...wrapperStyle, height: heightMap[slot], position: 'relative' }}>
      {imageUrl ? (
        <img src={imageUrl} alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)', fontSize: '12px',
        }}>
          {SLOT_LABELS[slot]?.label} — зураг байршуулна уу
        </div>
      )}
    </div>
  )
}
```

---

## 5. SLOT SPECS — image requirements per slot

```typescript
// lib/banner/slotSpecs.ts

export const SLOT_SPECS: Record<BannerSlot, SlotSpec> = {
  HERO: {
    desktop:    '1440×480px (3:1 ratio) — JPG/PNG/WebP, max 2MB',
    mobile:     '768×300px',
    transform:  { width: 1440, height: 480, crop: 'fill', gravity: 'center' },
    description:'Нүүр хуудасны гол carousel баннер. Хамгийн их үзэгдэлттэй байршил.',
  },
  ANNOUNCEMENT: {
    desktop:    'Текст мессеж — зураг шаардлагагүй',
    mobile:     'Текст мессеж',
    transform:  null,
    description:'Navbar доорх хөдөлгөөнтэй мөр. Текст + emoji дэмжинэ.',
  },
  MID_PAGE: {
    desktop:    '1200×90px (leaderboard) эсвэл 1200×250px',
    mobile:     '768×90px',
    transform:  { width: 1200, height: 90, crop: 'fill' },
    description:'Feed дундаас гарах horizontal strip. CTR дундаж 1.2%.',
  },
  IN_FEED: {
    desktop:    '400×400px (1:1) — бараа картын хэмжээ',
    mobile:     '300×300px',
    transform:  { width: 400, height: 400, crop: 'fill', gravity: 'center' },
    description:'Бараа карт шиг харагддаг native sponsored content.',
  },
  SIDEBAR_RIGHT: {
    desktop:    '300×600px (half page) эсвэл 300×250px',
    mobile:     'Харагдахгүй',
    transform:  { width: 300, height: 600, crop: 'fill' },
    description:'Desktop-т l sticky sidebar баннер.',
  },
  SECTION_SEPARATOR: {
    desktop:    '1200×120px',
    mobile:     '768×80px',
    transform:  { width: 1200, height: 120, crop: 'fill' },
    description:'Хэсгүүдийн хооронд байрлах divider баннер.',
  },
  CATEGORY_TOP: {
    desktop:    '1200×200px',
    mobile:     '768×150px',
    transform:  { width: 1200, height: 200, crop: 'fill' },
    description:'Ангилалын хуудасны дээд хэсэгт.',
  },
  PRODUCT_BELOW: {
    desktop:    '800×160px',
    mobile:     '400×120px',
    transform:  { width: 800, height: 160, crop: 'fill' },
    description:'Бараа дэлгэрэнгүй хуудасны доод хэсэгт.',
  },
}
```

---

## 6. API ROUTES

```typescript
// app/api/admin/banners/route.ts
export async function GET(req: Request) {
  requireAdmin(req)
  const { searchParams } = new URL(req.url)
  const { status, slot, search, page, limit } = Object.fromEntries(searchParams)

  const where = {
    ...(status && status !== 'all' ? { status: status as BannerStatus } : {}),
    ...(slot   && slot   !== 'all' ? { slot:   slot   as BannerSlot   } : {}),
    ...(search ? {
      OR: [
        { title:      { contains: search, mode: 'insensitive' } },
        { refId:      { contains: search, mode: 'insensitive' } },
        { entityName: { contains: search, mode: 'insensitive' } },
      ]
    } : {}),
  }

  const [items, total] = await Promise.all([
    db.banner.findMany({
      where,
      orderBy: [{ status: 'asc' }, { startsAt: 'desc' }],
      skip: (Number(page || 1) - 1) * Number(limit || 20),
      take:  Number(limit || 20),
    }),
    db.banner.count({ where }),
  ])

  return Response.json({ items, meta: { total, page: Number(page || 1), hasMore: total > Number(page || 1) * Number(limit || 20) } })
}

export async function POST(req: Request) {
  requireAdmin(req)
  const body = await req.json()

  // Generate refId
  const count = await db.banner.count()
  const refId = `BNR-${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(4,'0')}`

  const banner = await db.banner.create({
    data: { ...body, refId, createdById: getAdminId(req) }
  })

  // Log to audit
  await auditLog(getAdminId(req), 'BANNER_CREATED', 'Banner', banner.id)

  return Response.json(banner, { status: 201 })
}

// app/api/admin/banners/[id]/route.ts
export async function PATCH(req, { params }) {
  requireAdmin(req)
  const body = await req.json()
  const banner = await db.banner.update({ where: { id: params.id }, data: body })
  await auditLog(getAdminId(req), 'BANNER_UPDATED', 'Banner', banner.id, body)
  return Response.json(banner)
}

export async function DELETE(req, { params }) {
  requireAdmin(req)
  await db.banner.delete({ where: { id: params.id } })
  await auditLog(getAdminId(req), 'BANNER_DELETED', 'Banner', params.id)
  return new Response(null, { status: 204 })
}

// app/api/admin/banners/stats/route.ts
export async function GET(req) {
  requireAdmin(req)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [active, pending, expiringToday, revenue, impressions] = await Promise.all([
    db.banner.count({ where: { status: 'ACTIVE' } }),
    db.banner.count({ where: { status: 'PENDING' } }),
    db.banner.count({ where: { status: 'ACTIVE', endsAt: { lte: endOfDay(now) } } }),
    db.banner.aggregate({ where: { isPaid: true, createdAt: { gte: startOfMonth } }, _sum: { price: true } }),
    db.banner.aggregate({ where: { status: 'ACTIVE' }, _sum: { impressions: true } }),
  ])

  return Response.json({
    active,
    pending,
    expiringToday,
    revenue: revenue._sum.price || 0,
    impressions: impressions._sum.impressions || 0,
  })
}

// app/api/banners/[slot]/route.ts — Public endpoint for homepage
export async function GET(req, { params }) {
  const now = new Date()
  const banners = await db.banner.findMany({
    where: {
      slot:      params.slot as BannerSlot,
      status:    'ACTIVE',
      startsAt:  { lte: now },
      endsAt:    { gte: now },
    },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true, imageUrl: true, imageMobile: true,
      linkUrl: true, altText: true, bgColor: true, title: true,
    },
  })

  // Increment impression count async (don't await)
  if (banners.length > 0) {
    db.banner.updateMany({
      where: { id: { in: banners.map(b => b.id) } },
      data:  { impressions: { increment: 1 } },
    }).catch(console.error)
  }

  return Response.json(banners)
}

// app/api/banners/[id]/click/route.ts — Track clicks
export async function POST(req, { params }) {
  await db.banner.update({
    where: { id: params.id },
    data:  { clicks: { increment: 1 } },
  })
  return new Response(null, { status: 204 })
}
```

---

## 7. HOMEPAGE BANNER PLACEMENT — Server Components

```tsx
// components/home/HeroBanner.tsx
import 'swiper/css'
import 'swiper/css/pagination'

export async function HeroBanner() {
  const banners = await fetch(`${process.env.APP_URL}/api/banners/HERO`, {
    next: { revalidate: 60 },  // Cache 60 seconds
  }).then(r => r.json())

  if (!banners?.length) return <HeroBannerFallback />

  return <HeroBannerClient banners={banners} />
}

// Hero client wrapper (Swiper needs 'use client')
// components/home/HeroBannerClient.tsx
'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'

export function HeroBannerClient({ banners }) {
  const handleClick = (bannerId: string) => {
    fetch(`/api/banners/${bannerId}/click`, { method: 'POST' })
  }

  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      pagination={{ clickable: true }}
      loop={banners.length > 1}
      style={{ width: '100%', height: 'clamp(240px, 38vw, 420px)' }}
    >
      {banners.map(banner => (
        <SwiperSlide key={banner.id}>
          <a
            href={banner.linkUrl}
            onClick={() => handleClick(banner.id)}
            style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}
          >
            <div style={{ width: '100%', height: '100%', background: banner.bgColor || '#1A1A1A' }}>
              <picture>
                {banner.imageMobile && (
                  <source media="(max-width: 768px)" srcSet={banner.imageMobile} />
                )}
                <img
                  src={banner.imageUrl}
                  alt={banner.altText || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="eager"
                />
              </picture>
            </div>
          </a>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

// components/home/AnnouncementBar.tsx
export async function AnnouncementBar() {
  const [banners, items] = await Promise.all([
    fetch(`${process.env.APP_URL}/api/banners/ANNOUNCEMENT`, { next: { revalidate: 60 } }).then(r => r.json()),
    db.announcement.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ])

  const allItems = [
    ...items.map(i => ({ text: i.text, icon: i.icon, linkUrl: i.linkUrl })),
    ...banners.map(b => ({ text: b.title, icon: '★', linkUrl: b.linkUrl, bannerId: b.id })),
  ]

  if (!allItems.length) return null

  return (
    <div style={{ background: '#1A1A1A', borderBottom: '0.5px solid #3D3D3D', overflow: 'hidden', height: '36px', display: 'flex', alignItems: 'center' }}>
      <AnnouncementMarquee items={allItems} />
    </div>
  )
}
```

---

## 8. BANNER PLAN ADMIN — /admin/banners/plans

```tsx
// Full CRUD for banner pricing plans
// Admin can create/edit/delete plans without code changes

export default async function BannerPlansPage() {
  const plans = await db.bannerPlan.findMany({ orderBy: [{ slot: 'asc' }, { price: 'asc' }] })

  return (
    <AdminLayout>
      <PageHeader title="Баннерын үнийн төлөвлөгөө" />

      {/* Group by slot */}
      {Object.entries(groupBy(plans, 'slot')).map(([slot, slotPlans]) => (
        <div key={slot} style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '10px' }}>
            {SLOT_LABELS[slot as BannerSlot]?.label}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
            {slotPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} onEdit={openEditModal} onDelete={deletePlan} />
            ))}
            <AddPlanCard slot={slot} onClick={openCreateModal} />
          </div>
        </div>
      ))}
    </AdminLayout>
  )
}
```

---

## 9. CLOUDINARY UPLOAD SERVICE

```typescript
// lib/cloudinary/upload.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Server-side: generate signed upload URL for client
export async function generateSignedUploadUrl(
  folder: string,
  transformation?: object
): Promise<SignedUploadResult> {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const params = {
    timestamp,
    folder: `eseller/${folder}`,
    ...(transformation ? { transformation: JSON.stringify(transformation) } : {}),
  }
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!)

  return {
    signature,
    timestamp,
    apiKey:    process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder:    params.folder,
  }
}

// Client: upload file to Cloudinary
export async function uploadToCloudinary(
  file: File,
  signedData: SignedUploadResult,
  onProgress?: (pct: number) => void
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', signedData.apiKey)
  formData.append('timestamp', signedData.timestamp.toString())
  formData.append('signature', signedData.signature)
  formData.append('folder', signedData.folder)

  const xhr = new XMLHttpRequest()
  xhr.upload.onprogress = e => onProgress?.(Math.round((e.loaded / e.total) * 100))

  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText)
      if (xhr.status === 200) resolve(data.secure_url)
      else reject(new Error(data.error?.message || 'Upload failed'))
    }
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${signedData.cloudName}/image/upload`)
    xhr.send(formData)
  })
}
```

---

## 10. CRON: AUTO-EXPIRE + AUTO-ACTIVATE BANNERS

```typescript
// app/api/cron/banners/route.ts
// Schedule: every 5 minutes via Vercel Cron or cron-job.org

export async function GET(req: Request) {
  // Verify cron secret
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()

  // 1. Auto-activate scheduled banners
  const activated = await db.banner.updateMany({
    where: { status: 'SCHEDULED', startsAt: { lte: now }, endsAt: { gte: now } },
    data:  { status: 'ACTIVE' },
  })

  // 2. Auto-expire active banners past end date
  const expired = await db.banner.updateMany({
    where: { status: 'ACTIVE', endsAt: { lt: now } },
    data:  { status: 'EXPIRED' },
  })

  // 3. Notify sellers whose banners expired today
  const expiredBanners = await db.banner.findMany({
    where: {
      status:   'EXPIRED',
      endsAt:   { gte: startOfDay(now), lte: endOfDay(now) },
      entityId: { not: null },
    },
    include: { entity: { include: { user: true } } },
  })

  for (const banner of expiredBanners) {
    await notifyUser(banner.entity!.userId, 'BANNER_EXPIRED', {
      bannerTitle: banner.title,
      slot:        SLOT_LABELS[banner.slot].label,
      renewUrl:    `${process.env.APP_URL}/dashboard/${banner.entityId}/promote`,
    })
  }

  return Response.json({ activated: activated.count, expired: expired.count })
}
```

---

## IMPLEMENTATION CHECKLIST

```
Phase 1 — Core (1 долоо хоног):
  [ ] Prisma migration: Banner, BannerPlan, BannerAnalytic, Announcement models
  [ ] /admin/banners — main table page
  [ ] /admin/banners/new — create form with Cloudinary upload
  [ ] /admin/banners/[id] — edit form
  [ ] /api/admin/banners CRUD routes
  [ ] /api/banners/[slot] — public endpoint
  [ ] HeroBanner + AnnouncementBar homepage components
  [ ] Cron: auto-activate + auto-expire

Phase 2 — Enhanced (2-р долоо хоног):
  [ ] BannerLivePreview component (desktop/mobile toggle)
  [ ] SlotAvailabilityGrid
  [ ] SlotConflictChecker
  [ ] /admin/banners/plans — plan CRUD
  [ ] Click tracking API
  [ ] Banner analytics dashboard /admin/banners/analytics

Phase 3 — Seller self-service (3-р долоо хоног):
  [ ] /dashboard/[entityId]/promote — seller banner purchase page
  [ ] QPay payment flow for banner purchase
  [ ] Seller banner status notifications
  [ ] Email: banner expiring soon reminder
```
