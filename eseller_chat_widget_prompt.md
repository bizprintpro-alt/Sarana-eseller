# ESELLER.MN — ДЭЛГҮҮРИЙН ЧАТБОТ WIDGET СИСТЕМ
## Claude Code Prompt — Per-store Chat Widget

Дэлгүүр бүр өөрийн өнгө брэнд-тэй чат widget-тэй болно.
Seller онлайн → seller хариу, офлайн → AI автомат хариу.

---

## 1. PRISMA SCHEMA

```prisma
model ChatWidget {
  id            String   @id @default(cuid())
  entityId      String   @unique
  
  // Тохиргоо
  primaryColor  String   @default("#E8242C")
  welcomeText   String   @default("Сайн байна уу! Яаж тусалж болох вэ?")
  botName       String?  // default: дэлгүүрийн нэр
  
  // Функц
  aiEnabled     Boolean  @default(true)
  quickReplies  Json?    // ["Үнэ хэд вэ?", "Хэзээ хүргэх вэ?", "Захиалах"]
  offlineMsg    String   @default("Одоо offline байна. Бид удахгүй хариулна.")
  
  // Статус
  isActive      Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  entity        Entity   @relation(fields:[entityId], references:[id])
  sessions      ChatSession[]
}

model ChatSession {
  id            String   @id @default(cuid())
  widgetId      String
  userId        String?  // нэвтрээгүй бол null
  visitorId     String   // localStorage-д хадгалсан anonymous ID
  entityId      String
  
  status        SessionStatus @default(OPEN)
  isAiHandling  Boolean  @default(false)  // AI хариулж байна уу
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  widget        ChatWidget @relation(fields:[widgetId], references:[id])
  messages      ChatMessage[]
}

model ChatMessage {
  id            String      @id @default(cuid())
  sessionId     String
  
  role          MessageRole // USER | SELLER | AI | SYSTEM
  content       String      @db.Text
  isRead        Boolean     @default(false)
  
  createdAt     DateTime    @default(now())
  
  session       ChatSession @relation(fields:[sessionId], references:[id])
}

enum SessionStatus { OPEN SELLER_JOINED CLOSED }
enum MessageRole  { USER SELLER AI SYSTEM }
```

---

## 2. AI ХАРИУ ENGINE

```typescript
// lib/chat/aiChatEngine.ts
import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function getAiReply(
  userMessage: string,
  entityId:    string,
  sessionId:   string
): Promise<string> {

  // Дэлгүүрийн мэдээлэл авах
  const entity = await db.entity.findUnique({
    where:   { id: entityId },
    include: {
      products: {
        where:   { isActive: true },
        take:    20,
        select:  { name: true, price: true, description: true }
      },
      locations: { where: { isPrimary: true }, take: 1 },
    }
  })

  // Өмнөх мессежүүд (context)
  const history = await db.chatMessage.findMany({
    where:   { sessionId },
    orderBy: { createdAt: 'asc' },
    take:    10,
  })

  const systemPrompt = `
Та "${entity?.name}" дэлгүүрийн AI туслах.
Зөвхөн энэ дэлгүүрийн мэдээллийг ашиглан хариулна.
Монгол хэлээр богино, найрсаг хариулна.

Дэлгүүрийн бараанууд:
${entity?.products.map(p => `- ${p.name}: ${p.price.toLocaleString()}₮`).join('\n')}

Байршил: ${entity?.locations[0]?.address || 'Улаанбаатар'}
Ажлын цаг: ${entity?.workingHours || '09:00-18:00'}

Дүрэм:
- Мэдэхгүй зүйл: "Seller удахгүй хариулна" гэж хэл
- Захиалах гэвэл: захиалгын холбоосыг өг
- Үнэ асуувал: бодит үнийг хэл
- 2 өгүүлбэрт хариулахыг хичээ
`

  const messages = [
    ...history.map(m => ({
      role:    m.role === 'USER' ? 'user' as const : 'assistant' as const,
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage }
  ]

  const response = await claude.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 300,
    system:     systemPrompt,
    messages,
  })

  return response.content[0].type === 'text'
    ? response.content[0].text
    : 'Уучлаарай, дахин асуух уу?'
}
```

---

## 3. API ROUTES

```typescript
// app/api/chat/widget/[entityId]/route.ts
// GET — widget config авах (public)
export async function GET(req: Request, { params }) {
  const widget = await db.chatWidget.findUnique({
    where: { entityId: params.entityId },
  })
  if (!widget) {
    // Default config буцаах
    return Response.json({
      primaryColor: '#E8242C',
      welcomeText:  'Сайн байна уу!',
      aiEnabled:    true,
      quickReplies: ['Үнэ хэд вэ?', 'Хэзээ хүргэх вэ?', 'Захиалах'],
    })
  }
  return Response.json(widget)
}

// app/api/chat/session/route.ts
// POST — шинэ чат session үүсгэх
export async function POST(req: Request) {
  const { entityId, visitorId, userId } = await req.json()

  // Seller онлайн эсэхийг шалгах
  const sellerOnline = await checkSellerOnline(entityId)

  const widget  = await db.chatWidget.findUnique({ where: { entityId } })
  const session = await db.chatSession.create({
    data: {
      widgetId:    widget!.id,
      entityId,
      visitorId,
      userId,
      isAiHandling: !sellerOnline,
    }
  })

  // Мэндчилгээний мессеж
  await db.chatMessage.create({
    data: {
      sessionId: session.id,
      role:      sellerOnline ? 'SELLER' : 'AI',
      content:   widget?.welcomeText || 'Сайн байна уу!',
    }
  })

  return Response.json({ sessionId: session.id, sellerOnline })
}

// app/api/chat/message/route.ts
// POST — мессеж илгээх + AI хариу авах
export async function POST(req: Request) {
  const { sessionId, content, visitorId } = await req.json()

  const session = await db.chatSession.findUnique({
    where:   { id: sessionId },
    include: { widget: true },
  })
  if (!session) return Response.json({ error: 'Session not found' }, { status: 404 })

  // Хэрэглэгчийн мессеж хадгалах
  await db.chatMessage.create({
    data: { sessionId, role: 'USER', content }
  })

  // Seller онлайн шалгах
  const sellerOnline = await checkSellerOnline(session.entityId)

  if (!sellerOnline && session.widget.aiEnabled) {
    // AI хариу авах
    const aiReply = await getAiReply(content, session.entityId, sessionId)

    const aiMsg = await db.chatMessage.create({
      data: { sessionId, role: 'AI', content: aiReply }
    })
    return Response.json({ reply: aiMsg, isAi: true })
  }

  // Seller-д WebSocket мэдэгдэл
  await notifySellerNewMessage(session.entityId, sessionId, content)

  return Response.json({ queued: true, isAi: false })
}

// Seller онлайн шалгах utility
async function checkSellerOnline(entityId: string): Promise<boolean> {
  const lastSeen = await db.sellerPresence.findFirst({
    where: {
      entityId,
      lastSeenAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } // 5 мин
    }
  })
  return !!lastSeen
}

// app/api/chat/seller/messages/route.ts
// GET — seller-ийн бүх нээлттэй session
export async function GET(req: Request) {
  const session  = await requireAuth(req)
  const entityId = await getActiveEntityId(session.user.id)

  const sessions = await db.chatSession.findMany({
    where:   { entityId, status: { not: 'CLOSED' } },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count:   { select: { messages: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return Response.json(sessions)
}
```

---

## 4. CHAT WIDGET COMPONENT

```tsx
// components/chat/ChatWidget.tsx
'use client'
import { useState, useEffect, useRef } from 'react'

interface WidgetConfig {
  primaryColor: string
  welcomeText:  string
  botName:      string
  aiEnabled:    boolean
  quickReplies: string[]
}

interface Message {
  id:        string
  role:      'USER' | 'SELLER' | 'AI' | 'SYSTEM'
  content:   string
  createdAt: string
}

export function ChatWidget({ entityId, entityName }: {
  entityId:   string
  entityName: string
}) {
  const [open,       setOpen]       = useState(false)
  const [config,     setConfig]     = useState<WidgetConfig | null>(null)
  const [sessionId,  setSessionId]  = useState<string | null>(null)
  const [messages,   setMessages]   = useState<Message[]>([])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [sellerOnline, setSellerOnline] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Visitor ID — anonymous хэрэглэгчийн ID
  const visitorId = typeof window !== 'undefined'
    ? localStorage.getItem('esl_visitor') || (() => {
        const id = Math.random().toString(36).slice(2)
        localStorage.setItem('esl_visitor', id)
        return id
      })()
    : ''

  // Widget config авах
  useEffect(() => {
    fetch(`/api/chat/widget/${entityId}`)
      .then(r => r.json())
      .then(setConfig)
  }, [entityId])

  // Чат нээхэд session үүсгэх
  const openChat = async () => {
    setOpen(true)
    if (sessionId) return

    const res  = await fetch('/api/chat/session', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ entityId, visitorId }),
    })
    const data = await res.json()
    setSessionId(data.sessionId)
    setSellerOnline(data.sellerOnline)

    // Welcome мессеж авах
    const msgs = await fetch(`/api/chat/messages/${data.sessionId}`).then(r => r.json())
    setMessages(msgs)
  }

  // Мессеж илгээх
  const sendMsg = async (text?: string) => {
    const content = text || input.trim()
    if (!content || !sessionId) return
    setInput('')

    const userMsg: Message = {
      id:        Date.now().toString(),
      role:      'USER',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const res  = await fetch('/api/chat/message', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ sessionId, content, visitorId }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.reply) {
      setMessages(prev => [...prev, data.reply])
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!config) return null

  const initials = entityName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const c        = config.primaryColor

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>

      {/* Chat bubble */}
      {open && (
        <div style={{
          position:     'absolute',
          bottom:       60,
          right:        0,
          width:        340,
          background:   'var(--esl-bg-card)',
          border:       '1px solid var(--esl-border)',
          borderRadius: '16px 16px 4px 16px',
          overflow:     'hidden',
          boxShadow:    '0 8px 32px rgba(0,0,0,0.15)',
        }}>

          {/* Header */}
          <div style={{ background: c, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>
                {config.botName || entityName}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: sellerOnline ? '#86EFAC' : 'rgba(255,255,255,0.5)', display: 'inline-block' }}/>
                {sellerOnline ? 'Онлайн · дунджаар 5 мин' : 'AI туслах бэлэн'}
              </p>
            </div>
            <button onClick={() => setOpen(false)} style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              cursor: 'pointer', color: '#fff', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ height: 260, overflowY: 'auto', padding: 12, background: 'var(--esl-bg-section)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: 6, flexDirection: msg.role === 'USER' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                {msg.role !== 'USER' && (
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {msg.role === 'AI' ? 'AI' : initials}
                  </div>
                )}
                <div style={{
                  maxWidth:     '70%',
                  padding:      '8px 10px',
                  borderRadius: msg.role === 'USER' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background:   msg.role === 'USER' ? c : 'var(--esl-bg-card)',
                  color:        msg.role === 'USER' ? '#fff' : 'var(--esl-text-primary)',
                  border:       msg.role !== 'USER' ? '1px solid var(--esl-border)' : 'none',
                  fontSize:     12,
                  lineHeight:   1.55,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>AI</div>
                <div style={{ background: 'var(--esl-bg-card)', border: '1px solid var(--esl-border)', borderRadius: '12px 12px 12px 2px', padding: '8px 12px', display: 'flex', gap: 3 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--esl-text-muted)', display: 'inline-block', animation: `bounce 1.2s infinite ${i*.2}s` }}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick replies */}
          {config.quickReplies?.length > 0 && (
            <div style={{ padding: '6px 10px', display: 'flex', gap: 5, flexWrap: 'wrap', borderTop: '1px solid var(--esl-border)' }}>
              {config.quickReplies.map((qr, i) => (
                <button key={i} onClick={() => sendMsg(qr)} style={{
                  padding:      '3px 10px',
                  borderRadius: 99,
                  fontSize:     11,
                  cursor:       'pointer',
                  border:       `1px solid ${c}`,
                  background:   'none',
                  color:        c,
                  transition:   'all .12s',
                }}>
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '8px 10px', borderTop: '1px solid var(--esl-border)', display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="Мессеж бичих..."
              style={{
                flex:         1,
                border:       '1px solid var(--esl-border)',
                borderRadius: 20,
                padding:      '6px 12px',
                fontSize:     12,
                background:   'var(--esl-bg-section)',
                color:        'var(--esl-text-primary)',
                outline:      'none',
              }}
            />
            <button onClick={() => sendMsg()} style={{
              width:        32,
              height:       32,
              borderRadius: '50%',
              background:   c,
              border:       'none',
              cursor:       'pointer',
              color:        '#fff',
              fontSize:     16,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
            }}>→</button>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button onClick={openChat} style={{
        width:        52,
        height:       52,
        borderRadius: '50%',
        background:   c,
        border:       'none',
        cursor:       'pointer',
        color:        '#fff',
        fontSize:     22,
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        boxShadow:    `0 4px 16px ${c}60`,
      }}>
        {open ? '×' : '💬'}
      </button>
    </div>
  )
}
```

---

## 5. WIDGET CONFIG — SELLER DASHBOARD

```tsx
// app/dashboard/store/chat-settings/page.tsx
// Дэлгүүр эзэн чатаа тохируулах

export default function ChatSettingsPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Чатын тохиргоо" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

        {/* Config form */}
        <div>
          {/* Өнгө */}
          <FormSection title="Брэнд өнгө">
            <ColorPicker name="primaryColor" presets={['#E8242C','#2563EB','#16A34A','#7C3AED','#F59E0B','#0F172A']} />
          </FormSection>

          {/* Мэндчилгээ */}
          <FormSection title="Мэндчилгээний текст">
            <input name="welcomeText" defaultValue="Сайн байна уу! Яаж тусалж болох вэ?" />
          </FormSection>

          {/* AI toggle */}
          <FormSection title="AI автомат хариу">
            <Toggle name="aiEnabled" label="Seller офлайн үед AI хариулна" />
          </FormSection>

          {/* Quick replies */}
          <FormSection title="Хурдан хариу товчнууд">
            <QuickReplyEditor name="quickReplies"
              default={['Үнэ хэд вэ?', 'Хэзээ хүргэх вэ?', 'Захиалах']} />
          </FormSection>

          <SaveButton />
        </div>

        {/* Live preview */}
        <div style={{ position: 'sticky', top: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--esl-text-muted)', marginBottom: 10 }}>Preview</p>
          <ChatWidgetPreview />
        </div>
      </div>
    </DashboardLayout>
  )
}
```

---

## 6. SELLER CHAT INBOX

```tsx
// app/dashboard/store/chat/page.tsx
// Дэлгүүр эзэн хэрэглэгчдийн мессеж харах

export default function SellerChatPage() {
  return (
    <DashboardLayout>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 64px)' }}>

        {/* Session list */}
        <ChatSessionList />

        {/* Active conversation */}
        <ChatConversation />

      </div>
    </DashboardLayout>
  )
}
```

---

## 7. /[slug] STOREFRONT-Д НЭМЭХ

```tsx
// app/[slug]/page.tsx — сүүлд нэмэх
import { ChatWidget } from '@/components/chat/ChatWidget'

export default function StorefrontPage({ entity }) {
  return (
    <div>
      {/* ... storefront content ... */}

      {/* Chat widget — fixed bottom right */}
      {entity.chatWidget?.isActive && (
        <ChatWidget
          entityId={entity.id}
          entityName={entity.name}
        />
      )}
    </div>
  )
}
```

---

## 8. ХЭРЭГЖИЛТИЙН ДАРААЛАЛ

```
1. Prisma migration:
   ChatWidget, ChatSession, ChatMessage, SellerPresence
   npx prisma migrate dev --name add_chat_widget

2. AI engine:
   lib/chat/aiChatEngine.ts
   (Anthropic API key аль хэдийн байна)

3. API routes:
   GET  /api/chat/widget/[entityId]
   POST /api/chat/session
   POST /api/chat/message
   GET  /api/chat/messages/[sessionId]
   GET  /api/chat/seller/messages

4. ChatWidget component:
   components/chat/ChatWidget.tsx

5. /[slug] storefront-д нэмэх

6. Seller dashboard:
   /dashboard/store/chat-settings — тохиргоо
   /dashboard/store/chat — inbox

7. Sidebar-д нэмэх:
   "💬 Чат" цэс → /dashboard/store/chat
   "⚙️ Чатын тохиргоо" → /dashboard/store/chat-settings
```
