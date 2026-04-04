# ESELLER.MN — CLAUDE AI СИСТЕМИЙН ХӨГЖҮҮЛЭГЧ
## Claude Code Prompt — AI Developer Dashboard

Claude нь eseller.mn-ийн байнгын хөгжүүлэгч болж супер admin panel дотор
өөрийн орон зайтай, системийн алдаа/дутагдал/шинэчлэл бүгдийг
admin-д танилцуулж, зөвшөөрөл авч хэрэгжүүлдэг болно.

---

## 1. PRISMA SCHEMA

```prisma
// Claude AI-ийн ажлын орон зайн бүх мэдээлэл

model AiInsight {
  id          String      @id @default(cuid())
  type        InsightType
  priority    Priority    @default(MEDIUM)
  title       String
  description String      @db.Text
  evidence    Json?       // Баримт нотлох мэдээлэл (log, дата)
  suggestion  String?     @db.Text
  impact      String?     // Нөлөөлөл: "248 хэрэглэгчид нөлөөлнө"
  effort      String?     // Хэмжээ: "2-4 цаг"
  status      AiStatus    @default(PENDING)
  resolvedAt  DateTime?
  resolvedBy  String?
  rejectedAt  DateTime?
  rejectedReason String?
  autoFixed   Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  tasks       AiTask[]
}

enum InsightType {
  BUG              // Алдаа
  PERFORMANCE      // Гүйцэтгэлийн асуудал
  UX_ISSUE         // Хэрэглэгчийн туршлагын дутагдал
  SECURITY         // Аюулгүй байдал
  DATA_QUALITY     // Өгөгдлийн чанар (координат, алдаа)
  FEATURE_REQUEST  // Шинэ функц хүсэлт (хэрэглэгчийн давтамжаас)
  OPTIMIZATION     // Сайжруулалт
  SYSTEM_HEALTH    // Системийн эрүүл мэнд
}

enum Priority {
  CRITICAL   // Шуурхай шийдэх
  HIGH       // Өнөөдөр
  MEDIUM     // Энэ долоо хоногт
  LOW        // Цаашид
}

enum AiStatus {
  PENDING    // Admin-ийн зөвшөөрөл хүлээж байна
  APPROVED   // Зөвшөөрөгдсөн, хэрэгжүүлж байна
  REJECTED   // Татгалзсан
  DONE       // Дууссан
  AUTO_FIXED // Claude автоматаар засав (admin зөвшөөрсний дараа)
}

model AiTask {
  id          String    @id @default(cuid())
  insightId   String
  title       String
  description String    @db.Text
  fileChanges Json?     // Ямар файлд ямар өөрчлөлт хийх
  status      String    @default("pending")
  completedAt DateTime?
  createdAt   DateTime  @default(now())

  insight     AiInsight @relation(fields:[insightId], references:[id])
}

model AiActivityLog {
  id          String   @id @default(cuid())
  action      String   // "detected_bug" | "sent_proposal" | "applied_fix"
  description String
  metadata    Json?
  createdAt   DateTime @default(now())
}

model UserBehaviorPattern {
  id          String   @id @default(cuid())
  pattern     String   // "cart_abandon_after_shipping_cost"
  frequency   Int      @default(1)
  userCount   Int      @default(0)
  firstSeen   DateTime @default(now())
  lastSeen    DateTime @default(now())
  analyzed    Boolean  @default(false)
  insightId   String?
  data        Json?
  createdAt   DateTime @default(now())
}
```

---

## 2. CLAUDE AI ХУУДАС — /admin/ai

```tsx
// app/admin/ai/page.tsx
// Claude-ийн орон зай — супер admin-ийн хандалт

import { AiInsightsList }    from '@/components/admin/ai/AiInsightsList'
import { AiSystemHealth }    from '@/components/admin/ai/AiSystemHealth'
import { AiActivityFeed }    from '@/components/admin/ai/AiActivityFeed'
import { AiUserPatterns }    from '@/components/admin/ai/AiUserPatterns'

export default async function AiDashboardPage() {
  const [insights, health, patterns, activity] = await Promise.all([
    db.aiInsight.findMany({
      where:   { status: { in: ['PENDING', 'APPROVED'] } },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      include: { tasks: true },
    }),
    getSystemHealth(),
    db.userBehaviorPattern.findMany({
      where:   { analyzed: false },
      orderBy: { frequency: 'desc' },
      take:    10,
    }),
    db.aiActivityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take:    20,
    }),
  ])

  const pending  = insights.filter(i => i.status === 'PENDING').length
  const critical = insights.filter(i => i.priority === 'CRITICAL').length

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Claude logo/avatar */}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #CC785C 0%, #8B4513 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--esl-text-primary)' }}>
              Claude — Системийн хөгжүүлэгч
            </h1>
            <p style={{ fontSize: 12, color: 'var(--esl-text-muted)' }}>
              Дараагийн шинжилгээ: {getNextAnalysisTime()} · Anthropic Claude Sonnet 4.6
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {critical > 0 && (
            <span style={{
              padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
              background: 'rgba(220,38,38,0.1)', color: '#DC2626',
              border: '1px solid rgba(220,38,38,0.2)',
            }}>
              {critical} яаралтай асуудал
            </span>
          )}
          <span style={{
            padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: 'rgba(245,158,11,0.1)', color: '#D97706',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            {pending} шинэ санал
          </span>
          <button onClick={triggerManualScan}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'var(--esl-bg-input)',
              border: '1px solid var(--esl-border)',
              color: 'var(--esl-text-secondary)', fontSize: 12, cursor: 'pointer',
            }}>
            Шинжилгээ эхлүүлэх
          </button>
        </div>
      </div>

      {/* System health summary */}
      <AiSystemHealth health={health} />

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

        {/* Left: Insights list */}
        <AiInsightsList insights={insights} />

        {/* Right: Activity + patterns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AiUserPatterns patterns={patterns} />
          <AiActivityFeed activity={activity} />
        </div>
      </div>
    </AdminLayout>
  )
}
```

---

## 3. INSIGHT CARD — ЗӨВШӨӨРЛИЙН UI

```tsx
// components/admin/ai/AiInsightCard.tsx

const PRIORITY_CONFIG = {
  CRITICAL: { color: '#DC2626', bg: 'rgba(220,38,38,0.08)', label: 'Яаралтай',   icon: '🚨' },
  HIGH:     { color: '#D97706', bg: 'rgba(245,158,11,0.08)', label: 'Өндөр',     icon: '⚠️' },
  MEDIUM:   { color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  label: 'Дунд',      icon: '💡' },
  LOW:      { color: '#6B7280', bg: 'rgba(107,114,128,0.08)',label: 'Бага',      icon: 'ℹ️' },
}

const TYPE_LABELS = {
  BUG:             '🐛 Алдаа',
  PERFORMANCE:     '⚡ Гүйцэтгэл',
  UX_ISSUE:        '👤 UX асуудал',
  SECURITY:        '🔒 Аюулгүй байдал',
  DATA_QUALITY:    '📊 Өгөгдлийн чанар',
  FEATURE_REQUEST: '✨ Шинэ функц',
  OPTIMIZATION:    '🔧 Сайжруулалт',
  SYSTEM_HEALTH:   '💚 Эрүүл мэнд',
}

export function AiInsightCard({ insight, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const cfg = PRIORITY_CONFIG[insight.priority]

  return (
    <div style={{
      background: 'var(--esl-bg-card)',
      border:     `1px solid ${insight.priority === 'CRITICAL' ? cfg.color + '40' : 'var(--esl-border)'}`,
      borderLeft: `4px solid ${cfg.color}`,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}
        onClick={() => setExpanded(!expanded)}>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
              background: cfg.bg, color: cfg.color,
            }}>{cfg.label}</span>
            <span style={{ fontSize: 11, color: 'var(--esl-text-muted)' }}>
              {TYPE_LABELS[insight.type]}
            </span>
            {insight.impact && (
              <span style={{ fontSize: 11, color: 'var(--esl-text-muted)' }}>
                · {insight.impact}
              </span>
            )}
            {insight.effort && (
              <span style={{ fontSize: 11, color: 'var(--esl-text-muted)' }}>
                · ⏱ {insight.effort}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--esl-text-primary)', marginBottom: 4 }}>
            {insight.title}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--esl-text-muted)', lineHeight: 1.6 }}>
            {insight.description.slice(0, expanded ? 9999 : 120)}
            {!expanded && insight.description.length > 120 && '...'}
          </p>
        </div>

        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
          stroke="var(--esl-text-muted)" strokeWidth="1.5"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0, marginTop: 2 }}>
          <path d="M3 6l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--esl-border)' }}>

          {/* Evidence */}
          {insight.evidence && (
            <div style={{ marginTop: 12, marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--esl-text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Баримт нотлох мэдээлэл
              </p>
              <pre style={{
                background: 'var(--esl-bg-section)', border: '1px solid var(--esl-border)',
                borderRadius: 8, padding: '10px 12px',
                fontSize: 11, fontFamily: 'monospace', color: 'var(--esl-text-primary)',
                overflow: 'auto', maxHeight: 200,
              }}>
                {JSON.stringify(insight.evidence, null, 2)}
              </pre>
            </div>
          )}

          {/* Suggestion */}
          {insight.suggestion && (
            <div style={{
              background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)',
              borderRadius: 8, padding: '10px 12px', marginBottom: 12,
            }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#2563EB', marginBottom: 4 }}>
                Claude-ийн санал
              </p>
              <p style={{ fontSize: 12, color: 'var(--esl-text-secondary)', lineHeight: 1.7 }}>
                {insight.suggestion}
              </p>
            </div>
          )}

          {/* Tasks preview */}
          {insight.tasks?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--esl-text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Хийгдэх ажлууд
              </p>
              {insight.tasks.map((t, i) => (
                <div key={t.id} style={{
                  display: 'flex', gap: 8, padding: '6px 0',
                  borderBottom: i < insight.tasks.length - 1 ? '1px solid var(--esl-border)' : 'none',
                  fontSize: 12, color: 'var(--esl-text-secondary)',
                }}>
                  <span style={{ color: 'var(--esl-text-muted)', minWidth: 16 }}>{i+1}.</span>
                  <span>{t.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          {insight.status === 'PENDING' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <button onClick={() => onApprove(insight.id)}
                style={{
                  padding: '8px 20px', borderRadius: 8,
                  background: '#E8242C', border: 'none', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                ✓ Зөвшөөрч хэрэгжүүлэх
              </button>

              <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 200 }}>
                <input
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Татгалзах шалтгаан..."
                  style={{
                    flex: 1, padding: '7px 10px', border: '1px solid var(--esl-border)',
                    borderRadius: 8, fontSize: 12, background: 'var(--esl-bg-input)',
                    color: 'var(--esl-text-primary)',
                  }}
                />
                <button onClick={() => onReject(insight.id, rejectReason)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 12,
                    border: '1px solid var(--esl-border)', background: 'none',
                    color: 'var(--esl-text-secondary)', cursor: 'pointer',
                  }}>
                  Татгалзах
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## 4. CLAUDE ANALYSIS ENGINE — АВТОМАТ ШИНЖИЛГЭЭ

```typescript
// lib/ai/analyzeSystem.ts
// Энэ функц Anthropic API ашиглан системийг шинжилнэ

import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface SystemSnapshot {
  errorLogs:        any[]
  slowQueries:      any[]
  userPatterns:     any[]
  recentComplaints: any[]
  pendingIssues:    any[]
  metrics:          SystemMetrics
}

export async function analyzeSystemWithClaude(
  snapshot: SystemSnapshot
): Promise<AiInsight[]> {

  const systemPrompt = `
Та eseller.mn Монголын онлайн худалдааны платформын байнгын хөгжүүлэгч.
Таны үүрэг:
1. Системийн алдаа, дутагдлыг олох
2. Хэрэглэгчийн зан үйлийн хэв маягаас дүгнэлт гаргах
3. Сайжруулалтын саналыг тодорхой болгох
4. Хэрэгжүүлэх ажлын жагсаалт гаргах
5. Нөлөөлөл болон хүчин чадлын үнэлгээ өгөх

Хариултыг JSON форматаар өг:
{
  "insights": [
    {
      "type": "BUG|PERFORMANCE|UX_ISSUE|SECURITY|DATA_QUALITY|FEATURE_REQUEST|OPTIMIZATION|SYSTEM_HEALTH",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "title": "Товч гарчиг",
      "description": "Дэлгэрэнгүй тайлбар",
      "evidence": { "data": "..." },
      "suggestion": "Юу хийх хэрэгтэй",
      "impact": "X хэрэглэгчид нөлөөлнө",
      "effort": "X цаг",
      "tasks": [
        { "title": "Ажлын нэр", "description": "Дэлгэрэнгүй" }
      ]
    }
  ]
}
`

  const response = await claude.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 4000,
    system:     systemPrompt,
    messages: [{
      role:    'user',
      content: `
Доорх системийн мэдээллийг шинжилж, дутагдал, алдаа, сайжруулалтын саналыг гарга:

## Алдааны log (сүүлийн 24 цаг):
${JSON.stringify(snapshot.errorLogs, null, 2)}

## Удаан query-ууд (>500ms):
${JSON.stringify(snapshot.slowQueries, null, 2)}

## Хэрэглэгчийн давтамжтай үйлдлүүд:
${JSON.stringify(snapshot.userPatterns, null, 2)}

## Хэрэглэгчийн гомдол / feedback:
${JSON.stringify(snapshot.recentComplaints, null, 2)}

## Системийн метрик:
${JSON.stringify(snapshot.metrics, null, 2)}
      `
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    return parsed.insights || []
  } catch {
    console.error('Claude хариулт parse хийхэд алдаа:', text)
    return []
  }
}

// Системийн snapshot цуглуулах
async function collectSystemSnapshot(): Promise<SystemSnapshot> {
  const now   = new Date()
  const day   = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const week  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [errorLogs, patterns, complaints, metrics] = await Promise.all([
    // Vercel Runtime Logs-аас авах (API дамжуулан)
    fetchVercelLogs(),

    // Хэрэглэгчийн үйлдлийн хэв маяг
    db.userBehaviorPattern.findMany({
      where: { lastSeen: { gte: week } },
      orderBy: { frequency: 'desc' },
      take: 20,
    }),

    // Хэрэглэгчийн feedback (чат, support ticket)
    db.supportTicket?.findMany({
      where: { createdAt: { gte: week } },
      take: 20,
    }).catch(() => []),

    // Системийн метрик
    getSystemMetrics(),
  ])

  return { errorLogs, slowQueries: [], userPatterns: patterns,
    recentComplaints: complaints, pendingIssues: [], metrics }
}
```

---

## 5. ХЭРЭГЛЭГЧИЙН ХЭВИЙН ШИНЖИЛГЭЭ

```typescript
// lib/ai/trackBehavior.ts
// Хэрэглэгчийн давтамжтай үйлдлийг бүртгэж шинжилнэ

export async function trackUserBehavior(
  pattern:   string,
  userId?:   string,
  metadata?: Record<string, any>
) {
  await db.userBehaviorPattern.upsert({
    where:  { pattern },
    create: { pattern, frequency: 1, userCount: 1, data: metadata },
    update: {
      frequency: { increment: 1 },
      lastSeen:  new Date(),
      data:      metadata,
      userCount: { increment: userId ? 1 : 0 },
    },
  })
}

// Хэрэглэх газрууд — бүх чухал үйлдэлд нэмнэ:
// app/cart/page.tsx — сагс орхих
// await trackUserBehavior('cart_abandon_checkout', userId, { totalAmount })

// app/(customer)/search.tsx — хайлт дуусгалгүй
// await trackUserBehavior('search_no_results', userId, { query })

// app/checkout/page.tsx — төлбөрийн алхамд зогсох
// await trackUserBehavior('checkout_drop_at_payment', userId)

// app/product/[slug]/page.tsx — бараа харсан ч захиалаагүй
// await trackUserBehavior('product_view_no_purchase', userId, { productId })

// app/become-seller/page.tsx — wizard дутуу
// await trackUserBehavior('seller_wizard_abandoned', userId, { step })
```

---

## 6. API ROUTES

```typescript
// app/api/admin/ai/route.ts — GET insights

export async function GET(req: Request) {
  requireAdmin(req)
  const insights = await db.aiInsight.findMany({
    where:   { status: { not: 'DONE' } },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    include: { tasks: true },
  })
  return Response.json(insights)
}

// app/api/admin/ai/[id]/approve/route.ts — Зөвшөөрөх

export async function POST(req, { params }) {
  requireAdmin(req)

  await db.aiInsight.update({
    where: { id: params.id },
    data:  { status: 'APPROVED' }
  })

  // Claude Code-д автомат хэрэгжүүлэх trigger
  // (Claude Code API integration)
  await triggerClaudeCodeImplementation(params.id)

  await db.aiActivityLog.create({
    data: {
      action:      'admin_approved',
      description: `Admin зөвшөөрлөө — insight ${params.id}`,
    }
  })

  return Response.json({ success: true })
}

// app/api/admin/ai/[id]/reject/route.ts

export async function POST(req, { params }) {
  requireAdmin(req)
  const { reason } = await req.json()

  await db.aiInsight.update({
    where: { id: params.id },
    data:  { status: 'REJECTED', rejectedAt: new Date(), rejectedReason: reason }
  })

  return Response.json({ success: true })
}

// app/api/admin/ai/scan/route.ts — Manual scan trigger

export async function POST(req) {
  requireAdmin(req)

  const snapshot  = await collectSystemSnapshot()
  const insights  = await analyzeSystemWithClaude(snapshot)

  for (const insight of insights) {
    await db.aiInsight.create({
      data: {
        ...insight,
        tasks: { create: insight.tasks || [] }
      }
    })
  }

  await db.aiActivityLog.create({
    data: {
      action:      'manual_scan',
      description: `Manual scan: ${insights.length} шинэ санал олдлоо`,
    }
  })

  return Response.json({ count: insights.length, insights })
}
```

---

## 7. CRON — АВТОМАТ ШИНЖИЛГЭЭ

```typescript
// app/api/cron/ai-analysis/route.ts
// Өдөр бүр 06:00-д ажиллана
// vercel.json: { "crons": [{ "path": "/api/cron/ai-analysis", "schedule": "0 6 * * *" }] }

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const snapshot = await collectSystemSnapshot()
    const insights = await analyzeSystemWithClaude(snapshot)

    let created = 0
    for (const insight of insights) {
      // Давхардал шалгах
      const exists = await db.aiInsight.findFirst({
        where: { title: insight.title, status: { not: 'DONE' } }
      })
      if (exists) continue

      await db.aiInsight.create({
        data: {
          ...insight,
          tasks: { create: insight.tasks || [] }
        }
      })
      created++
    }

    // Critical байвал admin-д шуурхай мэдэгдэл
    const critical = insights.filter(i => i.priority === 'CRITICAL')
    if (critical.length > 0) {
      await notifyAdmin('CRITICAL_AI_INSIGHT', {
        count:    critical.length,
        titles:   critical.map(i => i.title),
        url:      `${process.env.APP_URL}/admin/ai`,
      })
    }

    await db.aiActivityLog.create({
      data: {
        action:      'daily_scan',
        description: `Daily scan: ${created} шинэ санал`,
        metadata:    { total: insights.length, created, critical: critical.length },
      }
    })

    return Response.json({ success: true, created, total: insights.length })
  } catch (err: any) {
    console.error('AI analysis failed:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
```

---

## 8. SIDEBAR MENU — ADMIN-Д НЭМЭХ

```tsx
// Dashboard sidebar-д Claude-ийн орон зайг нэмэх

// admin nav items-д:
{
  label:   'Claude AI',
  icon:    BrainIcon,
  href:    '/admin/ai',
  badge:   pendingCount > 0 ? pendingCount : undefined,
  badgeColor: 'red',
  special: true,  // Тусгай дизайнаар тэмдэглэнэ
}

// Sidebar дотор тусгай хэсэг:
<div style={{ borderTop: '1px solid var(--esl-border)', paddingTop: 12, marginTop: 12 }}>
  <p style={{ fontSize: 10, color: 'var(--esl-text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, paddingLeft: 10 }}>
    AI Хөгжүүлэгч
  </p>
  <NavItem item={{ label: 'Claude', icon: BrainIcon, href: '/admin/ai', badge: pendingCount }} special />
</div>
```

---

## 9. ENVIRONMENT VARIABLES

```bash
# .env.local — нэмэх
ANTHROPIC_API_KEY=sk-ant-...
CRON_SECRET=...  # Аль хэдийн байгаа байх
```

---

## 10. ХЭРЭГЖИЛТИЙН ДАРААЛАЛ

```
1. Prisma migration:
   AiInsight, AiTask, AiActivityLog, UserBehaviorPattern

2. API routes:
   GET/POST /api/admin/ai
   POST /api/admin/ai/[id]/approve
   POST /api/admin/ai/[id]/reject
   POST /api/admin/ai/scan

3. UI components:
   /admin/ai page
   AiInsightCard (approve/reject)
   AiSystemHealth
   AiActivityFeed

4. Analysis engine:
   lib/ai/analyzeSystem.ts (Claude API)
   lib/ai/trackBehavior.ts

5. Cron:
   /api/cron/ai-analysis (өдөр бүр 06:00)
   vercel.json-д нэмэх

6. trackUserBehavior() дуудлагуудыг
   cart, checkout, search, product detail,
   become-seller wizard-д нэмэх

7. Admin sidebar-д Claude хэсэг нэмэх
```
