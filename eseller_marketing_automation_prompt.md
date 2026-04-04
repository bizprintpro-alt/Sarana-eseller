# Eseller.mn — SMS & Email Marketing Campaign Builder + Automation
## Claude Code Prompt — Full Marketing Automation System

Stack: Next.js 14, Prisma, Redis (BullMQ), Resend (email), Unitel/MobiCom SMS API, React Email

---

## 1. PRISMA SCHEMA

```prisma
// ─────────────────────────────────────────
// CAMPAIGN CORE
// ─────────────────────────────────────────

model Campaign {
  id            String         @id @default(cuid())
  refId         String         @unique   // CMP-2604-0001
  name          String
  type          CampaignType
  status        CampaignStatus @default(DRAFT)
  entityId      String?                  // null = platform-wide (admin)
  createdById   String

  // Content
  subject       String?                  // Email subject
  previewText   String?                  // Email preview text
  smsText       String?                  // SMS body (max 160 chars)
  emailHtml     String?                  // Rendered HTML
  emailJson     Json?                    // Visual builder JSON state
  pushTitle     String?
  pushBody      String?

  // Audience
  audienceType  AudienceType   @default(ALL)
  segmentId     String?
  audienceCount Int            @default(0)  // Estimated reach

  // Schedule
  scheduledAt   DateTime?
  sentAt        DateTime?
  completedAt   DateTime?

  // Stats
  totalSent     Int            @default(0)
  delivered     Int            @default(0)
  opened        Int            @default(0)
  clicked       Int            @default(0)
  bounced       Int            @default(0)
  unsubscribed  Int            @default(0)
  converted     Int            @default(0)
  revenue       Float          @default(0)

  // Cost
  estimatedCost Float?
  actualCost    Float?

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  entity        Entity?        @relation(fields:[entityId], references:[id])
  segment       Segment?       @relation(fields:[segmentId], references:[id])
  sends         CampaignSend[]
  events        CampaignEvent[]
  abTests       ABTest[]
}

enum CampaignType   { SMS | EMAIL | PUSH | MULTI_CHANNEL }
enum CampaignStatus { DRAFT | SCHEDULED | SENDING | SENT | PAUSED | CANCELLED | FAILED }
enum AudienceType   { ALL | SEGMENT | MANUAL_LIST | CART_ABANDONERS | WISHLIST | INACTIVE }

// ─────────────────────────────────────────
// AUTOMATION FLOWS
// ─────────────────────────────────────────

model AutomationFlow {
  id          String         @id @default(cuid())
  name        String
  trigger     AutoTrigger
  triggerConfig Json?                    // e.g. { minutesAfter: 60, minAmount: 50000 }
  isActive    Boolean        @default(false)
  entityId    String?                    // null = platform-wide
  steps       AutoStep[]
  runs        AutoRun[]
  createdAt   DateTime       @default(now())
}

model AutoStep {
  id          String       @id @default(cuid())
  flowId      String
  order       Int
  type        StepType
  config      Json         // channel-specific config
  delayMinutes Int         @default(0)  // Wait before this step
  condition   Json?        // Optional: only run if condition met
  flow        AutomationFlow @relation(fields:[flowId], references:[id])
}

model AutoRun {
  id          String     @id @default(cuid())
  flowId      String
  userId      String
  triggeredAt DateTime   @default(now())
  completedAt DateTime?
  status      String     @default("running")  // running | completed | stopped
  currentStep Int        @default(0)
  metadata    Json?
  flow        AutomationFlow @relation(fields:[flowId], references:[id])
}

enum AutoTrigger {
  CART_ABANDONED          // Сагс орхисон
  ORDER_PLACED            // Захиалга хийсэн
  ORDER_DELIVERED         // Хүргэгдсэн
  FIRST_PURCHASE          // Анхны худалдан авалт
  WISHLIST_PRICE_DROP     // Хүслийн жагсаалтын бараа хямдарсан
  USER_REGISTERED         // Шинэ хэрэглэгч
  USER_INACTIVE           // X хоног нэвтрээгүй
  CUSTOM_DATE             // Тодорхой огноо (birthday, anniversary)
  MANUAL                  // Гар аргаар эхлүүлэх
}

enum StepType {
  SEND_SMS
  SEND_EMAIL
  SEND_PUSH
  WAIT
  CONDITION_BRANCH
  UPDATE_SEGMENT
}

// ─────────────────────────────────────────
// AUDIENCE SEGMENTS
// ─────────────────────────────────────────

model Segment {
  id          String    @id @default(cuid())
  name        String
  description String?
  entityId    String?
  filters     Json      // Array of filter conditions
  memberCount Int       @default(0)
  lastBuiltAt DateTime?
  createdAt   DateTime  @default(now())
  campaigns   Campaign[]
  members     SegmentMember[]
}

model SegmentMember {
  id        String   @id @default(cuid())
  segmentId String
  userId    String
  addedAt   DateTime @default(now())
  segment   Segment  @relation(fields:[segmentId], references:[id])
  @@unique([segmentId, userId])
}

// ─────────────────────────────────────────
// SEND LOG & EVENTS
// ─────────────────────────────────────────

model CampaignSend {
  id          String    @id @default(cuid())
  campaignId  String
  userId      String
  channel     String    // sms | email | push
  recipient   String    // phone or email
  status      String    @default("pending")
  sentAt      DateTime?
  deliveredAt DateTime?
  errorMsg    String?
  messageId   String?   // Provider's message ID
  campaign    Campaign  @relation(fields:[campaignId], references:[id])
}

model CampaignEvent {
  id          String    @id @default(cuid())
  campaignId  String
  userId      String?
  sendId      String?
  type        String    // opened | clicked | bounced | unsubscribed | converted
  metadata    Json?     // { url, orderId, amount }
  occurredAt  DateTime  @default(now())
  campaign    Campaign  @relation(fields:[campaignId], references:[id])
}

// ─────────────────────────────────────────
// UNSUBSCRIBE / OPT-OUT
// ─────────────────────────────────────────

model MarketingOptOut {
  id        String   @id @default(cuid())
  userId    String?
  phone     String?
  email     String?
  channel   String   // sms | email | push | all
  reason    String?
  optedOutAt DateTime @default(now())
  @@unique([phone, channel])
  @@unique([email, channel])
}

// ─────────────────────────────────────────
// A/B TEST
// ─────────────────────────────────────────

model ABTest {
  id           String   @id @default(cuid())
  campaignId   String
  variantA     Json     // { subject, smsText, emailHtml }
  variantB     Json
  splitPct     Int      @default(50)  // % sent to variant A
  winnerPicked String?  // 'A' | 'B' | null
  winnerId     String?
  createdAt    DateTime @default(now())
  campaign     Campaign @relation(fields:[campaignId], references:[id])
}
```

---

## 2. SMS SERVICE — Unitel + MobiCom gateway

```typescript
// lib/marketing/sms/SMSService.ts

interface SMSSendResult {
  messageId:  string
  status:     'sent' | 'failed'
  errorCode?: string
  errorMsg?:  string
  cost:       number   // MNT per message
}

class SMSService {
  private readonly COST_PER_SMS = 50  // ₮ per message

  // Primary: Unitel MobiFinance API
  // Fallback: MobiCom SMS API
  async send(phone: string, text: string): Promise<SMSSendResult> {
    // Validate Mongolian phone
    const cleaned = phone.replace(/\D/g, '')
    if (!/^(9[578]\d{6}|8[56]\d{6})$/.test(cleaned)) {
      return { messageId: '', status: 'failed', errorMsg: 'Утасны дугаар буруу', cost: 0 }
    }

    // Check opt-out
    const optedOut = await db.marketingOptOut.findFirst({
      where: { phone: cleaned, channel: { in: ['sms', 'all'] } }
    })
    if (optedOut) {
      return { messageId: '', status: 'failed', errorMsg: 'Хэрэглэгч татгалзсан', cost: 0 }
    }

    try {
      return await this.sendViaUnitel(cleaned, text)
    } catch {
      return await this.sendViaMobiCom(cleaned, text)
    }
  }

  private async sendViaUnitel(phone: string, text: string): Promise<SMSSendResult> {
    const res = await fetch(process.env.UNITEL_SMS_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.UNITEL_SMS_USER}:${process.env.UNITEL_SMS_PASS}`
        ).toString('base64')}`,
      },
      body: JSON.stringify({
        from:    process.env.UNITEL_SMS_SENDER || 'Eseller',
        to:      `976${phone}`,
        message: text,
      }),
    })
    const data = await res.json()
    return {
      messageId: data.messageId || data.id,
      status:    res.ok ? 'sent' : 'failed',
      errorMsg:  res.ok ? undefined : data.error,
      cost:      this.COST_PER_SMS,
    }
  }

  private async sendViaMobiCom(phone: string, text: string): Promise<SMSSendResult> {
    const res = await fetch(process.env.MOBICOM_SMS_URL!, {
      method: 'POST',
      headers: { 'X-API-Key': process.env.MOBICOM_SMS_KEY! },
      body: JSON.stringify({ phone: `+976${phone}`, message: text }),
    })
    const data = await res.json()
    return {
      messageId: data.id,
      status:    res.ok ? 'sent' : 'failed',
      errorMsg:  res.ok ? undefined : data.message,
      cost:      this.COST_PER_SMS,
    }
  }

  // Bulk send with rate limiting (10/sec)
  async sendBulk(
    recipients: Array<{ userId: string; phone: string }>,
    text: string,
    campaignId: string,
    onProgress?: (sent: number, total: number) => void
  ): Promise<{ sent: number; failed: number; cost: number }> {
    let sent = 0, failed = 0, cost = 0
    const chunks = chunkArray(recipients, 10)

    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (r) => {
        const result = await this.send(r.phone, text)
        await db.campaignSend.create({
          data: {
            campaignId,
            userId:    r.userId,
            channel:   'sms',
            recipient: r.phone,
            status:    result.status,
            messageId: result.messageId,
            sentAt:    result.status === 'sent' ? new Date() : undefined,
            errorMsg:  result.errorMsg,
          }
        })
        if (result.status === 'sent') { sent++; cost += result.cost }
        else failed++
        onProgress?.(sent + failed, recipients.length)
      }))

      await sleep(100) // 10 batches/sec = 100 SMS/sec max
    }

    return { sent, failed, cost }
  }

  // Template rendering with personalization
  renderTemplate(template: string, vars: Record<string, string>): string {
    return template
      .replace(/\{\{name\}\}/g,     vars.name     || 'Хэрэглэгч')
      .replace(/\{\{amount\}\}/g,   vars.amount   || '')
      .replace(/\{\{discount\}\}/g, vars.discount || '')
      .replace(/\{\{product\}\}/g,  vars.product  || '')
      .replace(/\{\{url\}\}/g,      vars.url      || process.env.APP_URL!)
      .slice(0, 160)  // SMS max 160 chars
  }
}

export const smsService = new SMSService()
```

---

## 3. EMAIL SERVICE — Resend + React Email

```typescript
// lib/marketing/email/EmailService.ts
import { Resend } from 'resend'
import { renderAsync } from '@react-email/render'

const resend = new Resend(process.env.RESEND_API_KEY)

class EmailService {
  private readonly FROM = 'Eseller.mn <no-reply@eseller.mn>'

  async send(
    to:      string,
    subject: string,
    html:    string,
    metadata?: Record<string, string>
  ): Promise<{ messageId: string; status: 'sent' | 'failed'; errorMsg?: string }> {

    // Check opt-out
    const optedOut = await db.marketingOptOut.findFirst({
      where: { email: to, channel: { in: ['email', 'all'] } }
    })
    if (optedOut) {
      return { messageId: '', status: 'failed', errorMsg: 'Хэрэглэгч татгалзсан' }
    }

    try {
      const { data, error } = await resend.emails.send({
        from:    this.FROM,
        to:      [to],
        subject,
        html,
        tags:    metadata ? Object.entries(metadata).map(([n, v]) => ({ name: n, value: v })) : undefined,
        headers: {
          'X-Entity-Ref-ID': metadata?.campaignId || '',
          'List-Unsubscribe': `<${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(to)}>`,
        },
      })

      if (error) return { messageId: '', status: 'failed', errorMsg: error.message }
      return { messageId: data!.id, status: 'sent' }
    } catch (err: any) {
      return { messageId: '', status: 'failed', errorMsg: err.message }
    }
  }

  async sendBulk(
    recipients: Array<{ userId: string; email: string; vars: Record<string, string> }>,
    subject:    string,
    htmlTemplate: string,
    campaignId: string,
    onProgress?: (sent: number, total: number) => void
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0, failed = 0
    // Resend batch API: max 100/batch
    const chunks = chunkArray(recipients, 100)

    for (const chunk of chunks) {
      const batch = chunk.map(r => ({
        from:    this.FROM,
        to:      [r.email],
        subject: this.renderSubject(subject, r.vars),
        html:    this.renderHtml(htmlTemplate, r.vars),
        tags:    [{ name: 'campaignId', value: campaignId }],
        headers: {
          'List-Unsubscribe': `<${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(r.email)}>`,
        },
      }))

      try {
        const { data, error } = await resend.batch.send(batch)
        if (error) {
          failed += chunk.length
        } else {
          for (let i = 0; i < chunk.length; i++) {
            const result = data![i]
            await db.campaignSend.create({
              data: {
                campaignId,
                userId:    chunk[i].userId,
                channel:   'email',
                recipient: chunk[i].email,
                status:    'sent',
                messageId: result.id,
                sentAt:    new Date(),
              }
            })
            sent++
          }
        }
      } catch {
        failed += chunk.length
      }

      onProgress?.(sent + failed, recipients.length)
      await sleep(1000) // Resend rate limit: 100 emails/sec
    }

    return { sent, failed }
  }

  renderSubject(template: string, vars: Record<string, string>): string {
    return template
      .replace(/\{\{name\}\}/g,     vars.name || 'Хэрэглэгч')
      .replace(/\{\{discount\}\}/g, vars.discount || '')
      .replace(/\{\{product\}\}/g,  vars.product || '')
  }

  renderHtml(template: string, vars: Record<string, string>): string {
    return template
      .replace(/\{\{name\}\}/g,     vars.name || 'Хэрэглэгч')
      .replace(/\{\{amount\}\}/g,   vars.amount || '')
      .replace(/\{\{discount\}\}/g, vars.discount || '')
      .replace(/\{\{product\}\}/g,  vars.product || '')
      .replace(/\{\{url\}\}/g,      vars.url || process.env.APP_URL!)
      .replace(/\{\{unsubscribe\}\}/g, `${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(vars.email || '')}`)
  }
}

export const emailService = new EmailService()
```

---

## 4. EMAIL TEMPLATES — React Email

```tsx
// emails/templates/CartAbandonedEmail.tsx
import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Img, Hr,
} from '@react-email/components'

interface CartAbandonedEmailProps {
  userName:    string
  cartItems:   Array<{ name: string; price: number; image: string }>
  totalAmount: number
  couponCode?: string
  couponPct?:  number
  cartUrl:     string
}

export function CartAbandonedEmail({
  userName, cartItems, totalAmount, couponCode, couponPct, cartUrl,
}: CartAbandonedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ background: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>

          {/* Header */}
          <Section style={{ background: '#E8242C', padding: '24px', textAlign: 'center' }}>
            <Img src={`${process.env.APP_URL}/logo-white.png`} width="120" alt="Eseller.mn" />
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px 24px' }}>
            <Heading style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '8px' }}>
              {userName}, сагсаа мартсан уу? 🛒
            </Heading>
            <Text style={{ color: '#555', lineHeight: 1.7 }}>
              Таны сагсанд {cartItems.length} бараа хүлээж байна.
              {couponPct && ` Одоо захиалбал ${couponPct}% хямдрал авна!`}
            </Text>

            {/* Cart items */}
            {cartItems.slice(0, 3).map((item, i) => (
              <Section key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #F0F0F0' }}>
                <Img src={item.image} width="64" height="64" style={{ borderRadius: '8px', objectFit: 'cover' }} alt={item.name} />
                <div>
                  <Text style={{ margin: 0, fontWeight: 500, color: '#0A0A0A' }}>{item.name}</Text>
                  <Text style={{ margin: 0, color: '#E8242C', fontWeight: 700 }}>{item.price.toLocaleString()}₮</Text>
                </div>
              </Section>
            ))}

            {/* Coupon */}
            {couponCode && (
              <Section style={{ background: '#FFF5F5', border: '2px dashed #E8242C', borderRadius: '8px', padding: '16px', textAlign: 'center', margin: '20px 0' }}>
                <Text style={{ margin: 0, fontSize: '12px', color: '#888' }}>Таны хямдралын код</Text>
                <Text style={{ margin: '4px 0', fontSize: '24px', fontWeight: 700, color: '#E8242C', letterSpacing: '4px' }}>
                  {couponCode}
                </Text>
                <Text style={{ margin: 0, fontSize: '12px', color: '#888' }}>Нийт дүнгээс {couponPct}% хямдрал</Text>
              </Section>
            )}

            <Button
              href={cartUrl}
              style={{
                background: '#E8242C', color: '#fff', fontSize: '16px', fontWeight: 700,
                padding: '14px 32px', borderRadius: '8px', textDecoration: 'none',
                display: 'block', textAlign: 'center', margin: '20px 0',
              }}>
              Захиалгаа дуусгах →
            </Button>

            <Text style={{ fontSize: '12px', color: '#AAA', textAlign: 'center' }}>
              Нийт дүн: <strong style={{ color: '#0A0A0A' }}>{totalAmount.toLocaleString()}₮</strong>
            </Text>
          </Section>

          <Hr style={{ borderColor: '#F0F0F0' }} />
          <Section style={{ padding: '16px 24px', textAlign: 'center' }}>
            <Text style={{ fontSize: '11px', color: '#BBB' }}>
              Та Eseller.mn-д бүртгэлтэй учир энэ имэйлийг хүлээн авлаа.{' '}
              <a href="{{unsubscribe}}" style={{ color: '#888' }}>Татгалзах</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
```

---

## 5. CAMPAIGN BUILDER UI — /dashboard/[entityId]/campaigns/new

```tsx
// app/dashboard/[entityId]/campaigns/new/page.tsx
'use client'

export default function CampaignBuilderPage() {
  const [step, setStep]     = useState<'setup' | 'audience' | 'content' | 'schedule' | 'review'>('setup')
  const [campaign, setCampaign] = useState<Partial<Campaign>>({
    type:         'EMAIL',
    audienceType: 'ALL',
    status:       'DRAFT',
  })

  return (
    <DashboardLayout>
      {/* Step indicator */}
      <StepBar
        steps={['Тохируулга', 'Үзэгчид', 'Контент', 'Хуваарь', 'Шалгах']}
        current={step}
      />

      {step === 'setup' && (
        <CampaignSetupStep
          value={campaign}
          onChange={setCampaign}
          onNext={() => setStep('audience')}
        />
      )}

      {step === 'audience' && (
        <CampaignAudienceStep
          entityId={entityId}
          value={campaign}
          onChange={setCampaign}
          onNext={() => setStep('content')}
          onBack={() => setStep('setup')}
        />
      )}

      {step === 'content' && (
        <CampaignContentStep
          type={campaign.type!}
          value={campaign}
          onChange={setCampaign}
          onNext={() => setStep('schedule')}
          onBack={() => setStep('audience')}
        />
      )}

      {step === 'schedule' && (
        <CampaignScheduleStep
          value={campaign}
          onChange={setCampaign}
          onNext={() => setStep('review')}
          onBack={() => setStep('content')}
        />
      )}

      {step === 'review' && (
        <CampaignReviewStep
          campaign={campaign}
          onSend={handleSend}
          onSchedule={handleSchedule}
          onBack={() => setStep('schedule')}
        />
      )}
    </DashboardLayout>
  )
}

// Step 1: Setup
function CampaignSetupStep({ value, onChange, onNext }) {
  return (
    <FormCard title="Кампанийн үндсэн тохируулга">
      <FormField label="Кампанийн нэр (дотоод)">
        <input value={value.name || ''} onChange={e => onChange(f => ({ ...f, name: e.target.value }))}
          placeholder="жш: Зулсарын хямдрал 2026 – SMS" />
      </FormField>

      <FormField label="Сувгийн төрөл">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {[
            { type: 'SMS',           label: 'SMS',           desc: '95%+ нээлтийн хувь · 50₮/мессеж' },
            { type: 'EMAIL',         label: 'Имэйл',         desc: 'HTML загвар · 20₮/имэйл' },
            { type: 'PUSH',          label: 'Push',          desc: 'Апп суулгасан хэрэглэгч · 10₮/push' },
            { type: 'MULTI_CHANNEL', label: 'Олон суваг',    desc: 'SMS + Имэйл + Push нэгэн зэрэг' },
          ].map(opt => (
            <ChannelCard
              key={opt.type}
              {...opt}
              selected={value.type === opt.type}
              onClick={() => onChange(f => ({ ...f, type: opt.type }))}
            />
          ))}
        </div>
      </FormField>

      <Button variant="primary" onClick={onNext} disabled={!value.name || !value.type}>
        Үргэлжлэх →
      </Button>
    </FormCard>
  )
}

// Step 2: Audience
function CampaignAudienceStep({ entityId, value, onChange, onNext, onBack }) {
  const [estimatedCount, setEstimatedCount] = useState(0)

  const updateAudience = async (audienceType: AudienceType, segmentId?: string) => {
    onChange(f => ({ ...f, audienceType, segmentId }))
    // Estimate audience size
    const count = await fetch(`/api/campaigns/estimate-audience?entityId=${entityId}&type=${audienceType}&segmentId=${segmentId || ''}`).then(r => r.json())
    setEstimatedCount(count.total)
  }

  return (
    <FormCard title="Хэн рүү илгээх вэ?">
      <AudienceTypeSelector
        value={value.audienceType!}
        onChange={(type, segId) => updateAudience(type, segId)}
        entityId={entityId}
        options={[
          { value: 'ALL',            label: 'Бүх хэрэглэгч',    desc: 'Бүртгэлтэй бүх хэрэглэгч', count: null },
          { value: 'SEGMENT',        label: 'Сегмент',           desc: 'Өөрийн үүсгэсэн сегмент', count: null },
          { value: 'CART_ABANDONERS',label: 'Сагс орхисон',      desc: 'Сүүлийн 7 хоногт сагс орхисон', count: null },
          { value: 'WISHLIST',       label: 'Хүслийн жагсаалт', desc: 'Хадгалсан бараатай хэрэглэгч', count: null },
          { value: 'INACTIVE',       label: 'Идэвхгүй',          desc: '30+ хоног нэвтрээгүй', count: null },
        ]}
      />

      {value.audienceType === 'SEGMENT' && (
        <SegmentSelector entityId={entityId} value={value.segmentId}
          onChange={segId => updateAudience('SEGMENT', segId)} />
      )}

      {/* Estimated reach */}
      <div style={{ marginTop: '16px', padding: '14px', background: 'var(--esl-bg-elevated)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <UsersIcon size={18} className="text-[#3B82F6]" />
        <div>
          <p style={{ fontSize: '11px', color: '#A0A0A0', margin: 0 }}>Тооцоолсон хүрэлцэх тоо</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>{estimatedCount.toLocaleString()} хэрэглэгч</p>
        </div>
        <CostEstimate type={value.type!} count={estimatedCount} />
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={estimatedCount === 0} />
    </FormCard>
  )
}

// Step 3: Content
function CampaignContentStep({ type, value, onChange, onNext, onBack }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '16px', alignItems: 'start' }}>
      <FormCard title="Контент бичих">

        {(type === 'SMS' || type === 'MULTI_CHANNEL') && (
          <FormField label={`SMS текст (${value.smsText?.length || 0}/160)`}>
            <textarea
              value={value.smsText || ''}
              maxLength={160}
              rows={4}
              onChange={e => onChange(f => ({ ...f, smsText: e.target.value }))}
              placeholder="Сайн байна уу {{name}}? Eseller.mn-д {{discount}}% хямдрал эхэллээ! {{url}}"
              style={{ width: '100%', resize: 'vertical' }}
            />
            <PersonalizationTokens onInsert={token => onChange(f => ({ ...f, smsText: (f.smsText || '') + token }))} />
          </FormField>
        )}

        {(type === 'EMAIL' || type === 'MULTI_CHANNEL') && (
          <>
            <FormField label="Имэйлийн гарчиг">
              <input value={value.subject || ''}
                onChange={e => onChange(f => ({ ...f, subject: e.target.value }))}
                placeholder="{{name}}, таны сагсанд бараа хүлээж байна 🛒" />
            </FormField>
            <FormField label="Preview текст">
              <input value={value.previewText || ''}
                onChange={e => onChange(f => ({ ...f, previewText: e.target.value }))}
                placeholder="Одоо захиалбал 10% купон авна..." />
            </FormField>
            <FormField label="Имэйлийн загвар">
              <TemplateSelector
                value={value.emailJson}
                onChange={json => onChange(f => ({ ...f, emailJson: json }))}
                type={type}
              />
            </FormField>
          </>
        )}

        {(type === 'PUSH' || type === 'MULTI_CHANNEL') && (
          <>
            <FormField label="Push гарчиг (max 50 тэмдэгт)">
              <input value={value.pushTitle || ''}
                maxLength={50}
                onChange={e => onChange(f => ({ ...f, pushTitle: e.target.value }))}
                placeholder="Шинэ хямдрал!" />
            </FormField>
            <FormField label="Push текст (max 100 тэмдэгт)">
              <input value={value.pushBody || ''}
                maxLength={100}
                onChange={e => onChange(f => ({ ...f, pushBody: e.target.value }))}
                placeholder="{{name}}, таны хүссэн бараа хямдарлаа" />
            </FormField>
          </>
        )}

      </FormCard>

      {/* Live preview */}
      <div style={{ position: 'sticky', top: '20px' }}>
        <MessagePreview type={type} campaign={value} />
      </div>
    </div>
  )
}
```

---

## 6. PERSONALIZATION TOKENS COMPONENT

```tsx
// components/campaigns/PersonalizationTokens.tsx

const TOKENS = [
  { token: '{{name}}',     label: 'Нэр',           example: 'Болд' },
  { token: '{{amount}}',   label: 'Дүн',            example: '49,900₮' },
  { token: '{{discount}}', label: 'Хямдрал %',      example: '20' },
  { token: '{{product}}',  label: 'Барааны нэр',    example: 'iPhone 15' },
  { token: '{{url}}',      label: 'Линк',            example: 'eseller.mn' },
  { token: '{{code}}',     label: 'Купон код',       example: 'SAVE20' },
  { token: '{{days}}',     label: 'Хоног',           example: '3' },
]

export function PersonalizationTokens({ onInsert }) {
  return (
    <div style={{ marginTop: '8px' }}>
      <p style={{ fontSize: '11px', color: '#A0A0A0', marginBottom: '6px' }}>Персонализаци оруулах:</p>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {TOKENS.map(t => (
          <button key={t.token} onClick={() => onInsert(t.token)}
            style={{
              padding: '3px 8px', borderRadius: '99px', fontSize: '11px', cursor: 'pointer',
              background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
              border: '1px solid rgba(59,130,246,0.3)',
            }}
            title={`Жишээ: ${t.example}`}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## 7. AUTOMATION FLOWS — /dashboard/[entityId]/automations

### Pre-built automation templates

```typescript
// lib/marketing/automation/templates.ts

export const AUTOMATION_TEMPLATES = [

  {
    id:      'cart_abandoned',
    name:    'Сагс орхисон хэрэглэгч',
    trigger: 'CART_ABANDONED',
    icon:    'ShoppingCart',
    color:   '#E8242C',
    steps: [
      {
        order:        1,
        type:         'WAIT',
        delayMinutes: 60,
        config:       {},
      },
      {
        order:  2,
        type:   'SEND_PUSH',
        config: {
          title: 'Сагсаа мартсан уу? 🛒',
          body:  '{{name}}, таны сагсанд бараа хүлээж байна',
          url:   '/cart',
        },
      },
      {
        order:        3,
        type:         'WAIT',
        delayMinutes: 23 * 60,  // 23 hours
        config:       {},
      },
      {
        order:    4,
        type:     'CONDITION_BRANCH',
        config:   { condition: 'order_placed', ifTrue: 'stop', ifFalse: 'continue' },
      },
      {
        order:  5,
        type:   'SEND_EMAIL',
        config: {
          subject:      '{{name}}, сагсаа мартсан уу?',
          templateId:   'cart_abandoned',
          couponCode:   '{{auto_coupon_5pct}}',
          couponExpiry: 48,  // hours
        },
      },
      {
        order:        6,
        type:         'WAIT',
        delayMinutes: 72 * 60,
        config:       {},
      },
      {
        order:    7,
        type:     'CONDITION_BRANCH',
        config:   { condition: 'order_placed', ifTrue: 'stop', ifFalse: 'continue' },
      },
      {
        order:  8,
        type:   'SEND_SMS',
        config: {
          text: '{{name}}, сүүлийн боломж! Сагсандаа {{product}} байна. Одоо захиалбал 10% хямдарна: {{url}}/cart',
        },
      },
    ],
  },

  {
    id:      'welcome_series',
    name:    'Шинэ хэрэглэгч onboarding',
    trigger: 'USER_REGISTERED',
    icon:    'UserPlus',
    color:   '#22C55E',
    steps: [
      {
        order:  1,
        type:   'SEND_EMAIL',
        config: { subject: 'Eseller-т тавтай морил, {{name}}! 🎉', templateId: 'welcome' },
      },
      {
        order:        2,
        type:         'WAIT',
        delayMinutes: 3 * 24 * 60,
        config:       {},
      },
      {
        order:  3,
        type:   'SEND_PUSH',
        config: { title: 'Ойр дэлгүүрүүд', body: 'Таны байршилд ойрхон дэлгүүрүүдийг оллоо', url: '/stores/nearby' },
      },
      {
        order:        4,
        type:         'WAIT',
        delayMinutes: 7 * 24 * 60,
        config:       {},
      },
      {
        order:    5,
        type:     'CONDITION_BRANCH',
        config:   { condition: 'has_made_purchase', ifTrue: 'stop', ifFalse: 'continue' },
      },
      {
        order:  6,
        type:   'SEND_SMS',
        config: { text: '{{name}}, Eseller-т эхний захиалгандаа 10,000₮ хямдрал авна уу: {{url}}/promo/first10k' },
      },
    ],
  },

  {
    id:      'wishlist_price_drop',
    name:    'Хүслийн жагсаалт хямдарсан',
    trigger: 'WISHLIST_PRICE_DROP',
    icon:    'Heart',
    color:   '#E8242C',
    steps: [
      {
        order:  1,
        type:   'SEND_PUSH',
        config: { title: '{{product}} хямдарлаа! 🎯', body: 'Хүссэн бараа тань {{discount}}% хямдарсан', url: '{{product_url}}' },
      },
      {
        order:        2,
        type:         'WAIT',
        delayMinutes: 2 * 60,
        config:       {},
      },
      {
        order:  3,
        type:   'SEND_EMAIL',
        config: { subject: '{{product}} {{discount}}% хямдарлаа!', templateId: 'price_drop' },
      },
    ],
  },

  {
    id:      'reorder_reminder',
    name:    'Давтан захиалгын сануулагч',
    trigger: 'ORDER_DELIVERED',
    icon:    'RefreshCw',
    color:   '#3B82F6',
    steps: [
      {
        order:        1,
        type:         'WAIT',
        delayMinutes: 14 * 24 * 60,  // 14 days
        config:       {},
      },
      {
        order:  2,
        type:   'SEND_PUSH',
        config: { title: 'Дахин захиалах цаг болсон уу?', body: '{{product}} хоосорч байж магадгүй', url: '{{product_url}}' },
      },
      {
        order:        3,
        type:         'WAIT',
        delayMinutes: 7 * 24 * 60,
        config:       {},
      },
      {
        order:    4,
        type:     'CONDITION_BRANCH',
        config:   { condition: 'reordered', ifTrue: 'stop', ifFalse: 'continue' },
      },
      {
        order:  5,
        type:   'SEND_SMS',
        config: { text: '{{name}}, {{product}} дуссан уу? Дахин захиалах: {{url}}' },
      },
    ],
  },

  {
    id:      'win_back',
    name:    'Идэвхгүй хэрэглэгч буцаах',
    trigger: 'USER_INACTIVE',
    triggerConfig: { inactiveDays: 30 },
    icon:    'Zap',
    color:   '#F59E0B',
    steps: [
      {
        order:  1,
        type:   'SEND_EMAIL',
        config: { subject: '{{name}}, та яах вэ? 30 хоног болжээ', templateId: 'win_back' },
      },
      {
        order:        2,
        type:         'WAIT',
        delayMinutes: 7 * 24 * 60,
        config:       {},
      },
      {
        order:    3,
        type:     'CONDITION_BRANCH',
        config:   { condition: 'has_visited', ifTrue: 'stop', ifFalse: 'continue' },
      },
      {
        order:  4,
        type:   'SEND_SMS',
        config: { text: '{{name}}, танд 15,000₮ купон байна! Eseller дээр хэрэглэнэ үү: {{url}}/coupon' },
      },
    ],
  },
]
```

### Automation worker — BullMQ

```typescript
// lib/marketing/automation/AutomationWorker.ts
import { Queue, Worker, Job } from 'bullmq'

const automationQueue = new Queue('automation-steps', {
  connection: { url: process.env.REDIS_URL },
})

// Enqueue next step
export async function enqueueNextStep(
  flowId:  string,
  runId:   string,
  userId:  string,
  stepOrder: number,
  delayMs: number,
  metadata: Record<string, any>
) {
  await automationQueue.add(
    `step-${runId}-${stepOrder}`,
    { flowId, runId, userId, stepOrder, metadata },
    { delay: delayMs, jobId: `auto-${runId}-${stepOrder}` }
  )
}

// Worker processes each step
const worker = new Worker('automation-steps', async (job: Job) => {
  const { flowId, runId, userId, stepOrder, metadata } = job.data

  // Get flow + step
  const flow = await db.automationFlow.findUnique({
    where: { id: flowId },
    include: { steps: { orderBy: { order: 'asc' } } },
  })
  if (!flow?.isActive) return

  const step = flow.steps.find(s => s.order === stepOrder)
  if (!step) return

  // Check run still active
  const run = await db.autoRun.findUnique({ where: { id: runId } })
  if (run?.status !== 'running') return

  // Get user info for personalization
  const user = await db.user.findUnique({
    where:  { id: userId },
    select: { name: true, phone: true, email: true },
  })

  const vars = {
    name:    user?.name || 'Хэрэглэгч',
    ...metadata,
  }

  // Execute step
  switch (step.type) {
    case 'SEND_SMS':
      if (user?.phone) {
        const text = smsService.renderTemplate(step.config.text, vars)
        await smsService.send(user.phone, text)
      }
      break

    case 'SEND_EMAIL':
      if (user?.email) {
        const html = await renderEmailTemplate(step.config.templateId, vars)
        await emailService.send(user.email, smsService.renderTemplate(step.config.subject, vars), html)
      }
      break

    case 'SEND_PUSH':
      await pushService.sendToUser(userId, {
        title: smsService.renderTemplate(step.config.title, vars),
        body:  smsService.renderTemplate(step.config.body, vars),
        url:   step.config.url,
      })
      break

    case 'CONDITION_BRANCH': {
      const conditionMet = await evaluateCondition(step.config.condition, userId, metadata)
      if (conditionMet && step.config.ifTrue === 'stop') {
        await db.autoRun.update({ where: { id: runId }, data: { status: 'completed' } })
        return
      }
      break
    }
  }

  // Update run progress
  await db.autoRun.update({ where: { id: runId }, data: { currentStep: stepOrder } })

  // Enqueue next step
  const nextStep = flow.steps.find(s => s.order === stepOrder + 1)
  if (nextStep) {
    await enqueueNextStep(
      flowId, runId, userId, nextStep.order,
      nextStep.delayMinutes * 60 * 1000,
      metadata
    )
  } else {
    await db.autoRun.update({ where: { id: runId }, data: { status: 'completed', completedAt: new Date() } })
  }
}, { connection: { url: process.env.REDIS_URL }, concurrency: 20 })
```

### Trigger hooks — called from business logic

```typescript
// lib/marketing/automation/triggers.ts

export async function triggerAutomation(
  trigger:  AutoTrigger,
  userId:   string,
  entityId: string | null,
  metadata: Record<string, any> = {}
) {
  const flows = await db.automationFlow.findMany({
    where: {
      trigger,
      isActive: true,
      OR: [{ entityId: null }, { entityId }],
    },
    include: { steps: { orderBy: { order: 'asc' }, take: 1 } },
  })

  for (const flow of flows) {
    // Check if already running for this user
    const existing = await db.autoRun.findFirst({
      where: { flowId: flow.id, userId, status: 'running' },
    })
    if (existing) continue

    const run = await db.autoRun.create({
      data: { flowId: flow.id, userId, metadata }
    })

    const firstStep = flow.steps[0]
    if (firstStep) {
      await enqueueNextStep(
        flow.id, run.id, userId, firstStep.order,
        firstStep.delayMinutes * 60 * 1000,
        metadata
      )
    }
  }
}

// ─── Call from order service:
// await triggerAutomation('CART_ABANDONED', userId, null, { cartItems, totalAmount })

// ─── Call from user registration:
// await triggerAutomation('USER_REGISTERED', userId, null, { name: user.name })

// ─── Call from payment service:
// await triggerAutomation('ORDER_PLACED', order.buyerId, order.sellerId, { orderId: order.id })

// ─── Call from product price update:
// if (newPrice < oldPrice) {
//   const wishlisters = await getUsersWhoWishlisted(productId)
//   for (const userId of wishlisters) {
//     await triggerAutomation('WISHLIST_PRICE_DROP', userId, null, {
//       product:     product.name,
//       product_url: `${APP_URL}/product/${product.slug}`,
//       discount:    Math.round((1 - newPrice / oldPrice) * 100),
//     })
//   }
// }
```

---

## 8. CAMPAIGN ANALYTICS — /dashboard/[entityId]/campaigns/[id]/analytics

```tsx
// Real-time stats for sent campaigns
export async function CampaignAnalyticsPage({ params }) {
  const campaign = await getCampaignWithStats(params.id)

  const openRate    = campaign.delivered  > 0 ? (campaign.opened   / campaign.delivered  * 100).toFixed(1) : '0'
  const clickRate   = campaign.opened     > 0 ? (campaign.clicked  / campaign.opened     * 100).toFixed(1) : '0'
  const convertRate = campaign.clicked    > 0 ? (campaign.converted / campaign.clicked   * 100).toFixed(1) : '0'
  const roi         = campaign.actualCost > 0 ? ((campaign.revenue - campaign.actualCost) / campaign.actualCost * 100).toFixed(0) : '0'

  return (
    <DashboardLayout>
      {/* Funnel stats */}
      <FunnelStats stats={[
        { label: 'Илгээгдсэн',   value: campaign.totalSent,  color: '#3B82F6' },
        { label: 'Хүргэгдсэн',   value: campaign.delivered,  color: '#22C55E', pct: ((campaign.delivered / campaign.totalSent) * 100).toFixed(0) },
        { label: 'Нээсэн',        value: campaign.opened,     color: '#F59E0B', pct: openRate },
        { label: 'Дарсан',        value: campaign.clicked,    color: '#E8242C', pct: clickRate },
        { label: 'Захиалга хийсэн', value: campaign.converted, color: '#7F77DD', pct: convertRate },
      ]} />

      {/* Revenue impact */}
      <RevenueImpactCard
        revenue={campaign.revenue}
        cost={campaign.actualCost}
        roi={roi}
      />

      {/* Daily performance chart */}
      <DailyPerformanceChart campaignId={campaign.id} />

      {/* Individual send log */}
      <SendLogTable campaignId={campaign.id} />
    </DashboardLayout>
  )
}
```

---

## 9. API ROUTES

```typescript
// app/api/campaigns/route.ts — CRUD
// app/api/campaigns/[id]/send/route.ts — Trigger send
// app/api/campaigns/[id]/stats/route.ts — Get stats
// app/api/campaigns/estimate-audience/route.ts — Count recipients
// app/api/automations/route.ts — CRUD flows
// app/api/automations/[id]/toggle/route.ts — Enable/disable

// POST /api/campaigns/[id]/send
export async function POST(req, { params }) {
  requireEntityAccess(req, params.id)
  const campaign = await db.campaign.findUnique({ where: { id: params.id } })

  // Build recipient list
  const recipients = await buildRecipientList(campaign.entityId, campaign.audienceType, campaign.segmentId)

  // Update status + count
  await db.campaign.update({
    where: { id: params.id },
    data:  { status: 'SENDING', audienceCount: recipients.length, sentAt: new Date() },
  })

  // Enqueue in BullMQ (don't block response)
  await campaignQueue.add('send-campaign', { campaignId: params.id, recipients })

  return Response.json({ status: 'queued', recipientCount: recipients.length })
}

// POST /api/webhooks/resend — Track email events
export async function POST(req) {
  const event = await req.json()
  // event.type: email.sent | email.delivered | email.opened | email.clicked | email.bounced
  const campaignId = event.data.tags?.find(t => t.name === 'campaignId')?.value

  if (campaignId) {
    const updateMap = {
      'email.delivered': { delivered: { increment: 1 } },
      'email.opened':    { opened: { increment: 1 } },
      'email.clicked':   { clicked: { increment: 1 } },
      'email.bounced':   { bounced: { increment: 1 } },
    }
    const update = updateMap[event.type]
    if (update) {
      await db.campaign.update({ where: { id: campaignId }, data: update })
      await db.campaignEvent.create({
        data: { campaignId, type: event.type.replace('email.', ''), occurredAt: new Date() }
      })
    }
  }
  return new Response('OK')
}

// POST /api/unsubscribe
export async function POST(req) {
  const { email, phone, channel } = await req.json()
  await db.marketingOptOut.upsert({
    where:  email ? { email_channel: { email, channel } } : { phone_channel: { phone, channel } },
    create: { email, phone, channel },
    update: { optedOutAt: new Date() },
  })
  return Response.json({ success: true })
}
```

---

## 10. IMPLEMENTATION ORDER

```
Week 1 — Core send:
  [ ] Prisma migration: Campaign, CampaignSend, MarketingOptOut
  [ ] SMSService (Unitel + MobiCom fallback)
  [ ] EmailService (Resend + React Email)
  [ ] Campaign CRUD API
  [ ] Basic campaign builder (setup + content + schedule steps)
  [ ] BullMQ campaign send queue

Week 2 — Audience + Analytics:
  [ ] Segment builder (filter conditions)
  [ ] Audience estimator API
  [ ] CampaignAnalyticsPage (funnel stats + chart)
  [ ] Resend webhook handler (open/click tracking)
  [ ] Unsubscribe page + API

Week 3 — Automation:
  [ ] AutomationFlow CRUD
  [ ] Automation template library (5 pre-built flows)
  [ ] BullMQ automation worker
  [ ] Trigger hooks in: order, cart, user, product services
  [ ] Automation analytics (run success rate)

Week 4 — Advanced:
  [ ] A/B test framework
  [ ] Push notification integration (Expo Server SDK)
  [ ] Multi-channel campaign (SMS + Email + Push)
  [ ] Personalization token preview
  [ ] Campaign ROI dashboard
```
