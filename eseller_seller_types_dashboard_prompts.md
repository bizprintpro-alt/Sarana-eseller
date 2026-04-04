# Eseller.mn — Дэлгүүрийн төрлийн систем
## Claude Code Prompt багц — Prompt 26а, 26б, 26в

---

## PROMPT A: WIZARD + 7 ENTITY TYPE ШИНЭЧЛЭЛТ

### NEW ENTITY TYPES (add to existing 5)

```typescript
enum EntityType {
  STORE       = 'store',        // Дэлгүүр (existing)
  PRE_ORDER   = 'pre_order',    // Захиалгын дэлгүүр (NEW)
  AGENT       = 'agent',        // Үл хөдлөхийн агент (existing)
  COMPANY     = 'company',      // Барилгын компани (existing)
  AUTO_DEALER = 'auto_dealer',  // Авто худалдаа (existing)
  SERVICE     = 'service',      // Үйлчилгээ (existing)
  DIGITAL     = 'digital',      // Файл/Дижитал бараа (NEW)
}
```

### ENTITY TYPE DEFINITIONS

```typescript
const ENTITY_DEFINITIONS = {
  store: {
    label:    'Дэлгүүр',
    subtitle: 'Бараа бүтээгдэхүүн зарах онлайн дэлгүүр',
    icon:     'ShoppingBag',
    color:    'blue',
    tags:     ['Бараа удирдлага', 'Захиалга систем', 'Хүргэлт', 'Хямдрал & купон'],
    step2Fields: ['businessName', 'slug', 'category', 'description', 'address'],
    kycDocs:  ['business_certificate'],
    planOptions: ['free', 'pro', 'business'],
  },

  pre_order: {
    label:    'Захиалгын дэлгүүр',
    subtitle: 'Гадаадаас захиалж оруулдаг бараа',
    icon:     'Clock',
    color:    'red',
    badge:    'Шинэ',
    tags:     ['Pre-order систем', 'Хүлээх хугацаа', 'Минимум захиалга', 'Урьдчилгаа төлбөр'],
    step2Fields: [
      'businessName', 'slug', 'sourceCountry',
      'deliveryDays',
      'minimumOrderQty',
      'advancePaymentPct',
      'category', 'description',
    ],
    kycDocs:  ['id_card', 'customs_certificate'],
    planOptions: ['pro', 'business'],
    specialFeatures: [
      'PREORDER_QUEUE',
      'BATCH_ORDER',
      'ADVANCE_PAYMENT',
      'DELIVERY_TRACKER',
      'WAITING_LIST',
    ],
  },

  digital: {
    label:    'Файл / Дижитал бараа',
    subtitle: 'Татаж авах дижитал контент зарах',
    icon:     'Download',
    color:    'info',
    badge:    'Шинэ',
    tags:     ['PDF, ZIP, видео', 'Instant download', 'Subscription', 'License key'],
    step2Fields: ['displayName', 'slug', 'category', 'description'],
    kycDocs:  ['id_card'],
    planOptions: ['free', 'pro'],
    specialFeatures: [
      'INSTANT_DELIVERY',
      'DRM_PROTECTION',
      'DOWNLOAD_LIMIT',
      'SUBSCRIPTION',
      'PREVIEW_MODE',
    ],
  },
}
```

### WIZARD COMPONENT — dynamic steps

```tsx
// app/(auth)/become-seller/page.tsx
'use client'

const TOTAL_STEPS = 5

export default function BecomeSellerPage() {
  const [step, setStep]         = useState(1)
  const [entityType, setType]   = useState<EntityType | null>(null)
  const [formData, setFormData] = useState({})

  const def = entityType ? ENTITY_DEFINITIONS[entityType] : null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4"
      style={{ background: 'var(--esl-bg-page)' }}>

      <ProgressBar current={step} total={TOTAL_STEPS} />

      <div className="w-full max-w-2xl">
        <p className="text-center text-sm text-[#A0A0A0] mb-1">Алхам {step}/{TOTAL_STEPS}</p>
        <h1 className="text-center text-2xl font-black text-white mb-8">
          {step === 1 ? 'Төрөл сонгох' :
           step === 2 ? 'Үндсэн мэдээлэл' :
           step === 3 ? 'Баталгаажуулалт' :
           step === 4 ? 'Профайл тохируулах' :
           'Үнийн төлөвлөгөө'}
        </h1>

        {step === 1 && (
          <EntityTypeSelector
            selected={entityType}
            onSelect={(type) => setType(type)}
          />
        )}

        {step === 2 && def && (
          <DynamicInfoForm
            fields={def.step2Fields}
            entityType={entityType}
            values={formData}
            onChange={(vals) => setFormData(prev => ({ ...prev, ...vals }))}
          />
        )}

        {step === 3 && def && (
          <KYCDocumentUpload
            requiredDocs={def.kycDocs}
            entityType={entityType}
          />
        )}

        {step === 4 && (
          <ProfileSetup entityType={entityType} />
        )}

        {step === 5 && def && (
          <PlanSelector
            plans={def.planOptions}
            entityType={entityType}
            trialDays={30}
          />
        )}

        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="text-sm text-[#A0A0A0] hover:text-white transition-colors">
              ← Өмнөх
            </button>
          ) : <span />}

          <button
            disabled={step === 1 && !entityType}
            onClick={() => step < TOTAL_STEPS ? setStep(s => s + 1) : handleSubmit()}
            style={{ background: entityType || step > 1 ? '#E8242C' : '#2A2A2A' }}
            className="px-8 py-3 rounded-lg text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
            {step === TOTAL_STEPS ? 'Бүртгэл дуусгах' : 'Дараах →'}
          </button>
        </div>

        {step === 5 && (
          <p className="text-center text-xs text-[#555] mt-4 cursor-pointer hover:text-[#A0A0A0]"
            onClick={handleSubmit}>
            Одоохондоо үнэгүй эхлэх → Dashboard-аас дараа upgrade хийнэ
          </p>
        )}
      </div>
    </div>
  )
}
```

### ENTITY TYPE SELECTOR CARD — updated UI

```tsx
export function EntityTypeSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-col gap-3">
      {Object.entries(ENTITY_DEFINITIONS).map(([key, def]) => (
        <button
          key={key}
          onClick={() => onSelect(key as EntityType)}
          className={`w-full text-left p-4 rounded-xl border transition-all ${
            selected === key
              ? 'border-[#E8242C] bg-[rgba(232,36,44,0.08)]'
              : 'border-[#3D3D3D] bg-[#1A1A1A] hover:border-[#555]'
          }`}
        >
          <div className="flex items-center gap-3">
            <EntityIcon type={key} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-white">{def.label}</span>
                {def.badge && (
                  <span className="text-[10px] font-bold bg-[#E8242C] text-white px-2 py-0.5 rounded-full">
                    {def.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A0A0A0] mb-2">{def.subtitle}</p>
              <div className="flex gap-1.5 flex-wrap">
                {def.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A2A2A] text-[#A0A0A0]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {selected === key && (
              <div className="w-5 h-5 rounded-full bg-[#E8242C] flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                  <path d="M2 5l2.5 2.5L8 2.5"/>
                </svg>
              </div>
            )}
          </div>
        </button>
      ))}

      <p className="text-center text-xs text-[#555] mt-2">
        Dashboard-аас хүссэн үедээ нэмэлт дэлгүүрийн эрх нэмж болно
      </p>
    </div>
  )
}
```

---

## PROMPT B: ENTITY-SPECIFIC DASHBOARD SYSTEM

Each entity type gets a customized dashboard with relevant nav,
widgets, and quick actions. One user can have multiple entities.

### DASHBOARD ROUTING

```typescript
// /dashboard/[entityId]/* — entity-specific dashboard
// app/dashboard/[entityId]/layout.tsx
export default async function DashboardLayout({ params, children }) {
  const entity = await getEntity(params.entityId)
  const navItems = NAV_CONFIG[entity.type]

  return (
    <DashboardShell entity={entity} navItems={navItems}>
      {children}
    </DashboardShell>
  )
}
```

### NAV CONFIG — per entity type

```typescript
const NAV_CONFIG: Record<EntityType, NavItem[]> = {

  store: [
    { label: 'Тойм',         icon: 'LayoutDashboard', href: '/dashboard/[id]' },
    { label: 'Бараанууд',    icon: 'Package',         href: '/dashboard/[id]/products' },
    { label: 'Захиалгууд',   icon: 'ShoppingCart',    href: '/dashboard/[id]/orders' },
    { label: 'Хямдрал',      icon: 'Tag',             href: '/dashboard/[id]/discounts' },
    { label: 'Хүргэлт',      icon: 'Truck',           href: '/dashboard/[id]/shipping' },
    { label: 'Аналитик',     icon: 'BarChart',        href: '/dashboard/[id]/analytics' },
    { label: 'Сурталчилгаа', icon: 'Megaphone',       href: '/dashboard/[id]/promotions' },
    { label: 'Чат',          icon: 'MessageSquare',   href: '/dashboard/[id]/messages' },
    { label: 'Тохиргоо',     icon: 'Settings',        href: '/dashboard/[id]/settings' },
  ],

  pre_order: [
    { label: 'Тойм',                 icon: 'LayoutDashboard', href: '...' },
    { label: 'Бараа каталог',        icon: 'BookOpen',        href: '.../catalog' },
    { label: 'Захиалгын дараалал',   icon: 'ClipboardList',   href: '.../queue',    badge: 'NEW' },
    { label: 'Багцын захиалга',      icon: 'Layers',          href: '.../batches',  badge: 'NEW' },
    { label: 'Ачааны мөрдөлт',       icon: 'MapPin',          href: '.../tracking', badge: 'NEW' },
    { label: 'Урьдчилгаа',           icon: 'CreditCard',      href: '.../deposits', badge: 'NEW' },
    { label: 'Хүлээлтийн жагсаалт', icon: 'Users',           href: '.../waitlist' },
    { label: 'Чат',                  icon: 'MessageSquare',   href: '.../messages' },
    { label: 'Тохиргоо',             icon: 'Settings',        href: '.../settings' },
  ],

  agent: [
    { label: 'Тойм',           icon: 'LayoutDashboard', href: '...' },
    { label: 'Зарууд',         icon: 'Home',            href: '.../listings' },
    { label: 'Зар нэмэх',      icon: 'PlusCircle',      href: '.../listings/new' },
    { label: 'Байршлын зураг', icon: 'Map',             href: '.../map' },
    { label: 'Хариу хүсэлт',   icon: 'Mail',            href: '.../inquiries' },
    { label: 'Профайл',        icon: 'User',            href: '.../profile' },
    { label: 'Аналитик',       icon: 'BarChart',        href: '.../analytics' },
    { label: 'Тохиргоо',       icon: 'Settings',        href: '.../settings' },
  ],

  company: [
    { label: 'Тойм',             icon: 'LayoutDashboard', href: '...' },
    { label: 'Төслүүд',          icon: 'Building',        href: '.../projects' },
    { label: 'Зургийн галлерей', icon: 'Image',           href: '.../gallery' },
    { label: 'Баримт бичиг',     icon: 'FileText',        href: '.../documents' },
    { label: 'Хүсэлт / Inquiry', icon: 'Mail',            href: '.../inquiries' },
    { label: 'VIP байршил',      icon: 'Star',            href: '.../promote' },
    { label: 'Тохиргоо',         icon: 'Settings',        href: '.../settings' },
  ],

  auto_dealer: [
    { label: 'Тойм',              icon: 'LayoutDashboard', href: '...' },
    { label: 'Машины жагсаалт',   icon: 'Car',             href: '.../vehicles' },
    { label: 'Тест драйв захиалга',icon: 'Calendar',       href: '.../test-drives' },
    { label: 'Техник үзүүлэлт',   icon: 'FileText',        href: '.../specs' },
    { label: 'Үнийн харьцуулалт', icon: 'BarChart2',       href: '.../pricing' },
    { label: 'Тохиргоо',          icon: 'Settings',        href: '.../settings' },
  ],

  service: [
    { label: 'Тойм',               icon: 'LayoutDashboard', href: '...' },
    { label: 'Үйлчилгээ жагсаалт', icon: 'Wrench',          href: '.../services' },
    { label: 'Цаг захиалга',        icon: 'Calendar',        href: '.../bookings' },
    { label: 'Хийсэн ажлууд',       icon: 'Briefcase',       href: '.../portfolio' },
    { label: 'Үнэлгээ',             icon: 'Star',            href: '.../reviews' },
    { label: 'Тохиргоо',            icon: 'Settings',        href: '.../settings' },
  ],

  digital: [
    { label: 'Тойм',           icon: 'LayoutDashboard', href: '...' },
    { label: 'Файлууд',        icon: 'Files',           href: '.../files' },
    { label: 'Татаж авалтууд', icon: 'Download',        href: '.../downloads' },
    { label: 'Лицензүүд',      icon: 'Key',             href: '.../licenses' },
    { label: 'Орлого',         icon: 'DollarSign',      href: '.../revenue' },
    { label: 'Аналитик',       icon: 'BarChart',        href: '.../analytics' },
    { label: 'Тохиргоо',       icon: 'Settings',        href: '.../settings' },
  ],
}
```

### MULTI-ENTITY SWITCHER

```tsx
export function EntitySwitcher({ currentEntity, userEntities }) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2A2A2A] hover:bg-[#3D3D3D] cursor-pointer">
          <EntityIcon type={currentEntity.type} size={16} />
          <span className="text-sm text-white font-medium">{currentEntity.name}</span>
          <EntityTypeBadge type={currentEntity.type} />
          <ChevronDown size={12} className="text-[#A0A0A0]" />
        </div>
      </DropdownTrigger>

      <DropdownContent>
        {userEntities.map(entity => (
          <DropdownItem key={entity.id}
            onClick={() => router.push(`/dashboard/${entity.id}`)}>
            <EntityIcon type={entity.type} size={14} />
            <div>
              <p className="text-sm text-white">{entity.name}</p>
              <p className="text-xs text-[#A0A0A0]">{ENTITY_DEFINITIONS[entity.type].label}</p>
            </div>
            {entity.id === currentEntity.id && <CheckIcon size={12} />}
          </DropdownItem>
        ))}

        <DropdownSeparator />

        <DropdownItem onClick={() => router.push('/become-seller')}>
          <PlusCircle size={14} className="text-[#E8242C]" />
          <span className="text-sm text-[#E8242C] font-medium">+ Шинэ дэлгүүр нэмэх</span>
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  )
}
```

### DASHBOARD STATS — per entity type

```typescript
const DASHBOARD_STATS: Record<EntityType, StatConfig[]> = {
  store: [
    { key: 'totalOrders',    label: 'Нийт захиалга',    color: 'blue' },
    { key: 'revenue',        label: 'Сарын орлого',      color: 'green' },
    { key: 'activeProducts', label: 'Идэвхтэй бараа',   color: 'info' },
    { key: 'avgRating',      label: 'Дундаж үнэлгээ',   color: 'warn' },
  ],
  pre_order: [
    { key: 'pendingOrders',  label: 'Хүлээгдэж буй захиалга', color: 'warn' },
    { key: 'inTransit',      label: 'Ачаанд явж буй',         color: 'info' },
    { key: 'deposits',       label: 'Урьдчилгаа дүн',         color: 'green' },
    { key: 'waitlistCount',  label: 'Хүлээлтийн жагсаалт',   color: 'purple' },
  ],
  agent: [
    { key: 'activeListings', label: 'Идэвхтэй зар',    color: 'blue' },
    { key: 'inquiries',      label: 'Хариу хүсэлт',    color: 'info' },
    { key: 'viewCount',      label: 'Нийт үзэгдэлт',   color: 'teal' },
    { key: 'dealsClosed',    label: 'Гүйцэтгэсэн зар', color: 'green' },
  ],
  digital: [
    { key: 'totalDownloads', label: 'Нийт татаж авалт', color: 'blue' },
    { key: 'revenue',        label: 'Орлого',            color: 'green' },
    { key: 'activeFiles',    label: 'Идэвхтэй файл',    color: 'info' },
    { key: 'subscribers',    label: 'Гишүүд',            color: 'purple' },
  ],
  company: [
    { key: 'activeProjects', label: 'Идэвхтэй төсөл',  color: 'blue' },
    { key: 'totalUnits',     label: 'Нийт нэгж',        color: 'info' },
    { key: 'soldPct',        label: 'Зарагдсан %',      color: 'green' },
    { key: 'inquiries',      label: 'Inquiry',           color: 'warn' },
  ],
  auto_dealer: [
    { key: 'totalVehicles',  label: 'Нийт машин',       color: 'blue' },
    { key: 'testDrives',     label: 'Тест драйв',       color: 'info' },
    { key: 'soldCount',      label: 'Борлуулалт',       color: 'green' },
    { key: 'avgPrice',       label: 'Дундаж үнэ',       color: 'warn' },
  ],
  service: [
    { key: 'totalBookings',  label: 'Нийт захиалга',    color: 'blue' },
    { key: 'todaySlots',     label: 'Өнөөдрийн цаг',   color: 'info' },
    { key: 'portfolio',      label: 'Портфолио',         color: 'teal' },
    { key: 'avgRating',      label: 'Үнэлгээ',          color: 'warn' },
  ],
}
```

---

## PROMPT C: PRE-ORDER STORE — FULL SYSTEM

Build a complete pre-order store for sellers who import goods from abroad.
Unique flow: customer orders → seller batches → imports → delivers.

### PRISMA SCHEMA

```prisma
model PreOrderProduct {
  id               String         @id @default(cuid())
  entityId         String
  refId            String         @unique
  name             String
  description      String?
  images           String[]
  sourceCountry    String
  priceEstimate    Float
  priceFinal       Float?
  advancePct       Int            @default(30)
  minOrderQty      Int            @default(1)
  maxOrderQty      Int?
  deliveryDays     Int
  deliveryDaysMax  Int?
  status           PreOrderStatus @default(OPEN)
  batchDeadline    DateTime?
  currentOrders    Int            @default(0)
  targetOrders     Int?
  shippingTracking String?
  customsInfo      Json?
  createdAt        DateTime       @default(now())

  orders  PreOrderItem[]
  batches PreOrderBatch[]
}

enum PreOrderStatus {
  DRAFT
  OPEN
  BATCH_FULL
  ORDERED
  IN_TRANSIT
  CUSTOMS
  ARRIVED
  DELIVERING
  COMPLETED
  CANCELLED
}

model PreOrderItem {
  id              String              @id @default(cuid())
  productId       String
  buyerId         String
  quantity        Int
  unitPrice       Float
  advanceAmount   Float
  remainingAmount Float
  advancePaidAt   DateTime?
  finalPaidAt     DateTime?
  status          PreOrderItemStatus  @default(PENDING)
  notes           String?
  createdAt       DateTime            @default(now())
}

enum PreOrderItemStatus {
  PENDING
  ADVANCE_PAID
  IN_BATCH
  SHIPPED
  ARRIVED
  FINAL_PAID
  DELIVERED
  CANCELLED
}

model PreOrderBatch {
  id          String      @id @default(cuid())
  productId   String
  batchNumber Int
  orderCount  Int
  totalQty    Int
  orderedAt   DateTime?
  eta         DateTime?
  trackingCode String?
  status      BatchStatus @default(COLLECTING)
  createdAt   DateTime    @default(now())
}

enum BatchStatus {
  COLLECTING
  ORDERED
  IN_TRANSIT
  CUSTOMS
  ARRIVED
  DISTRIBUTED
}
```

### PRE-ORDER PRODUCT PAGE — unique UX

```tsx
export function PreOrderProductPage({ product }) {
  const daysLeft = differenceInDays(product.batchDeadline, new Date())
  const progress = product.targetOrders
    ? Math.min(100, (product.currentOrders / product.targetOrders) * 100)
    : null

  return (
    <div>
      <MediaGallery items={product.images} />

      {/* Pre-order badge block */}
      <div className="rounded-xl p-4 mb-4"
        style={{ background: 'rgba(232,36,44,0.08)', border: '1px solid rgba(232,36,44,0.2)' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold bg-[#E8242C] text-white px-2 py-0.5 rounded-full">
            PRE-ORDER
          </span>
          <span className="text-xs text-[#A0A0A0]">
            Гадаадаас {product.sourceCountry}-с захиална
          </span>
        </div>

        {/* Delivery estimate */}
        <div className="flex items-center gap-3 mb-3 text-sm">
          <ClockIcon className="text-[#F59E0B]" size={16} />
          <span className="text-[#E0E0E0]">
            Хүлээх хугацаа:{' '}
            <strong className="text-white">
              {product.deliveryDays}–{product.deliveryDaysMax || product.deliveryDays + 7} хоног
            </strong>
          </span>
        </div>

        {/* Batch progress */}
        {progress !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-[#A0A0A0] mb-1">
              <span>{product.currentOrders} захиалга</span>
              <span>Зорилго: {product.targetOrders}</span>
            </div>
            <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div className="h-full bg-[#E8242C] rounded-full transition-all"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Deadline countdown */}
        {daysLeft > 0 && (
          <p className="text-xs text-[#F59E0B]">
            Захиалга авах хугацаа: {daysLeft} хоног үлдсэн
          </p>
        )}
      </div>

      {/* Price block */}
      <div className="mb-4">
        <div className="text-2xl font-black text-[#E8242C] mb-1">
          {product.priceFinal?.toLocaleString() || product.priceEstimate.toLocaleString()}₮
          {!product.priceFinal && (
            <span className="text-xs font-normal text-[#A0A0A0] ml-2">~ тооцоолол үнэ</span>
          )}
        </div>
        <p className="text-xs text-[#A0A0A0]">
          Урьдчилгаа: {product.advancePct}% ={' '}
          {Math.ceil(product.priceEstimate * product.advancePct / 100).toLocaleString()}₮
        </p>
        <p className="text-xs text-[#555]">Үлдэгдэл ачаа ирэхэд төлнө</p>
      </div>

      <Button variant="primary" size="xl" className="w-full" onClick={handlePreOrder}>
        Урьдчилгаа ({product.advancePct}%) төлж захиалах
      </Button>
    </div>
  )
}
```

### PRE-ORDER SELLER DASHBOARD — unique panels

```tsx
// 1. QUEUE MANAGEMENT
<PreOrderQueuePanel>
  {products.map(p => (
    <QueueCard key={p.id} product={p}>
      <ProgressBar current={p.currentOrders} target={p.targetOrders} />
      <StatusBadge status={p.status} />
      <Button onClick={() => processBatch(p.id)}>Batch эхлүүлэх</Button>
    </QueueCard>
  ))}
</PreOrderQueuePanel>

// 2. BATCH TRACKER
<BatchTrackerPanel>
  {batches.map(b => (
    <BatchRow key={b.id}>
      <TrackingTimeline status={b.status} />
      <TrackingInput
        value={b.trackingCode}
        onChange={(code) => updateTracking(b.id, code)}
      />
      <ETA date={b.eta} />
    </BatchRow>
  ))}
</BatchTrackerPanel>

// 3. PAYMENT COLLECTION
<PaymentCollectionPanel>
  <StatRow label="Урьдчилгаа хүлээгдэж буй" value={pendingAdvanceCount} />
  <StatRow label="Үлдэгдэл хүлээгдэж буй (ачаа ирсэн)" value={pendingFinalCount} />
  <Button onClick={sendFinalPaymentBlast}>
    Үлдэгдэл төлбөр нэхэмжлэх (SMS + Push)
  </Button>
</PaymentCollectionPanel>
```

### PRE-ORDER BUYER FLOW

```
1. Бараа харах → "PRE-ORDER" badge харагдана
2. Урьдчилгаа % болон хүргэлтийн хоног харна
3. QPay-р урьдчилгаа төлнө
4. "Захиалга хүлээгдэж байна" статус
5. Batch дүүрвэл → "Нийлүүлэгчид захиалагдлаа" push мэдэгдэл
6. Ачаа гарвал → Tracking код + "X хоногт ирнэ" мэдэгдэл
7. Монголд ирвэл → "Үлдэгдэл төлбөр хийнэ үү" SMS + push
8. Үлдэгдэл төлвөл → Хүргэлт эхэлнэ
9. Хүргэгдсэн → eБаримт + үнэлгээ хүсэлт
```

### API ROUTES

```typescript
// POST   /api/pre-order/products           — create pre-order product
// GET    /api/pre-order/products/[id]      — get with queue status
// POST   /api/pre-order/order              — place pre-order (advance payment)
// POST   /api/pre-order/batch/[productId]  — start batch processing
// PATCH  /api/pre-order/batch/[id]/status  — update batch status + tracking
// POST   /api/pre-order/notify-final/[batchId] — send final payment requests
// POST   /api/pre-order/confirm-delivery/[itemId] — mark as delivered
```

---

*Eseller.mn · Prompt багц · 2026*
