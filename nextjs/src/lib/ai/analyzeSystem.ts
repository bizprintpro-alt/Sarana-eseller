// ══════════════════════════════════════════════════════════════
// Claude AI — Системийн шинжилгээний engine
// Anthropic API ашиглан системийг шинжилж insight гаргана
// ══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/prisma';

interface SystemSnapshot {
  errorLogs:        Record<string, unknown>[];
  userPatterns:     Record<string, unknown>[];
  recentComplaints: Record<string, unknown>[];
  metrics:          SystemMetrics;
  flowResults?:     FlowTestResult[];
}

interface SystemMetrics {
  totalShops: number;
  totalOrders: number;
  totalUsers: number;
  ordersToday: number;
  errorRate: number;
  totalProducts: number;
  avgProductRating: number;
  totalReviews: number;
  recentOrderStatuses: string[];
  platformConfigs: string[];
  totalConversations: number;
  totalAffiliateLinks: number;
  totalBookings: number;
}

interface FlowTestResult {
  flow: string;
  step: string;
  endpoint: string;
  status: number;
  ok: boolean;
  error?: string;
  responseTime: number;
}

interface RawInsight {
  type: string;
  priority: string;
  title: string;
  description: string;
  evidence?: Record<string, unknown>;
  suggestion?: string;
  impact?: string;
  effort?: string;
  tasks?: Array<{ title: string; description: string }>;
}

// ─── System snapshot цуглуулах ───────────────────────────
export async function collectSystemSnapshot(): Promise<SystemSnapshot> {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    patterns, totalShops, totalOrders, totalUsers, ordersToday,
    recentOrders, products, reviews, configs,
    totalConversations, totalAffiliateLinks, totalBookings,
  ] = await Promise.all([
    prisma.userBehaviorPattern.findMany({ where: { lastSeen: { gte: weekAgo } }, orderBy: { frequency: 'desc' }, take: 20 }),
    prisma.shop.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { status: true, createdAt: true } }),
    prisma.product.aggregate({ _count: true, _avg: { rating: true } }),
    prisma.review.count(),
    prisma.platformConfig.findMany(),
    prisma.conversation.count().catch(() => 0),
    prisma.affiliateLink.count().catch(() => 0),
    prisma.booking.count().catch(() => 0),
  ]);

  const failedOrders = recentOrders.filter(o => o.status === 'cancelled' || o.status === 'failed').length;

  return {
    errorLogs: [],
    userPatterns: patterns.map(p => ({ pattern: p.pattern, frequency: p.frequency, userCount: p.userCount, lastSeen: p.lastSeen })),
    recentComplaints: [],
    metrics: {
      totalShops,
      totalOrders,
      totalUsers,
      ordersToday,
      errorRate: recentOrders.length > 0 ? Math.round((failedOrders / recentOrders.length) * 100) : 0,
      totalProducts: products._count || 0,
      avgProductRating: products._avg?.rating || 0,
      totalReviews: reviews,
      recentOrderStatuses: recentOrders.map(o => o.status),
      platformConfigs: configs.map(c => `${c.key}=${c.value}`),
      totalConversations,
      totalAffiliateLinks,
      totalBookings,
    },
  };
}

// ─── Хэрэглэгчийн flow бүрийг бодитоор шалгах ──────────
export async function testUserFlows(baseUrl: string): Promise<FlowTestResult[]> {
  const results: FlowTestResult[] = [];

  const flows: { flow: string; steps: { step: string; url: string; method?: string }[] }[] = [
    {
      flow: 'Дэлгүүр үзэх',
      steps: [
        { step: 'Нүүр хуудас', url: '/' },
        { step: 'Дэлгүүр', url: '/store' },
        { step: 'Marketplace API', url: '/api/marketplace' },
        { step: 'Бараа жагсаалт', url: '/api/products?limit=1' },
        { step: 'Дэлгүүрүүд', url: '/api/stores' },
      ],
    },
    {
      flow: 'Бүртгэл & Нэвтрэлт',
      steps: [
        { step: 'Login хуудас', url: '/login' },
        { step: 'Login API', url: '/api/auth/login', method: 'OPTIONS' },
      ],
    },
    {
      flow: 'Checkout & Төлбөр',
      steps: [
        { step: 'Checkout хуудас', url: '/checkout' },
        { step: 'Maintenance status', url: '/api/maintenance-status' },
      ],
    },
    {
      flow: 'Review систем',
      steps: [
        { step: 'Reviews API', url: '/api/reviews?productId=test' },
      ],
    },
    {
      flow: 'Chat систем',
      steps: [
        { step: 'Chat conversations', url: '/api/chat/conversations' },
      ],
    },
    {
      flow: 'Affiliate систем',
      steps: [
        { step: 'Affiliate earnings', url: '/api/affiliate/earnings' },
      ],
    },
    {
      flow: 'Хайлт',
      steps: [
        { step: 'Search suggest', url: '/api/search/suggest?q=test' },
      ],
    },
    {
      flow: 'Feed',
      steps: [
        { step: 'Feed API', url: '/api/feed' },
        { step: 'Feed хуудас', url: '/feed' },
      ],
    },
    {
      flow: 'Админ',
      steps: [
        { step: 'Site settings', url: '/api/admin/site-settings' },
        { step: 'Config', url: '/api/admin/config' },
      ],
    },
  ];

  for (const flow of flows) {
    for (const step of flow.steps) {
      const start = Date.now();
      try {
        const res = await fetch(`${baseUrl}${step.url}`, {
          method: step.method || 'GET',
          headers: { 'Content-Type': 'application/json' },
          redirect: 'follow',
        });
        results.push({
          flow: flow.flow,
          step: step.step,
          endpoint: step.url,
          status: res.status,
          ok: res.ok || res.status === 401, // 401 = auth needed, not broken
          responseTime: Date.now() - start,
        });
      } catch (e) {
        results.push({
          flow: flow.flow,
          step: step.step,
          endpoint: step.url,
          status: 0,
          ok: false,
          error: (e as Error).message,
          responseTime: Date.now() - start,
        });
      }
    }
  }
  return results;
}

// ─── Claude API-р шинжилгээ хийх ───────────────────────
export async function analyzeSystemWithClaude(snapshot: SystemSnapshot): Promise<RawInsight[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY тохируулаагүй');
    return [];
  }

  const failedFlows = (snapshot.flowResults || []).filter(f => !f.ok);
  const slowFlows = (snapshot.flowResults || []).filter(f => f.responseTime > 3000);

  const systemPrompt = `Та eseller.mn Монголын e-commerce платформын ахлах хөгжүүлэгч.
Платформ: Next.js 16 + Prisma + MongoDB + Vercel.

Таны үүрэг:
1. Бодит API endpoint алдаа илрүүлэх (500, 404, timeout)
2. Хэрэглэгчийн flow тасарсан цэгийг олох
3. DB өгөгдлийн асуудал (хоосон, зөрүүтэй)
4. Аюулгүй байдлын сул тал
5. Гүйцэтгэлийн удаашрал

ЗААВАЛ:
- "suggestion" талбарт ЯГ файл нэр, API route, функц нэр бич
- "tasks" талбарт хөгжүүлэгчид copy-paste хийхээр тодорхой бич
- Ерөнхий зөвлөгөө бус, ТОДОРХОЙ засвар

JSON: {"insights": [{"type": "BUG|PERFORMANCE|UX_ISSUE|SECURITY|DATA_QUALITY|FEATURE_REQUEST|OPTIMIZATION|SYSTEM_HEALTH", "priority": "CRITICAL|HIGH|MEDIUM|LOW", "title": "string", "description": "string", "suggestion": "яг файл + route + юу хийх", "impact": "хэрэглэгчид ямар нөлөөтэй", "effort": "цагаар", "tasks": [{"title": "string", "description": "тодорхой заавар"}]}]}`;

  const content = `## Системийн метрик:
${JSON.stringify(snapshot.metrics, null, 2)}

## API & Flow шалгалт (${failedFlows.length} алдаа, ${slowFlows.length} удаан):
${(snapshot.flowResults || []).map(f => `${f.ok ? '✅' : '❌'} [${f.flow}] ${f.step}: ${f.endpoint} → ${f.status} (${f.responseTime}ms)${f.error ? ' ERROR: ' + f.error : ''}`).join('\n')}

## Хэрэглэгчийн зан үйл:
${JSON.stringify(snapshot.userPatterns, null, 2)}

## Шалгах flow-ууд:
1. Buyer: Нэвтрэх → Дэлгүүр → Сагс → Checkout → QPay → Захиалга → Track
2. Seller: Бүртгэл → Дэлгүүр нээх → Бараа нэмэх → Захиалга удирдах → Analytics
3. Affiliate: Бүртгэл → Бараа сонгох → Линк хуваалцах → Комисс → Татан авах
4. Chat: Худалдан авагч ↔ Худалдагч мессеж
5. Review: Захиалга хүргэгдсэн → Үнэлгээ бичих → Харагдах

Хэрэглэгч юу хийж ЧАДАХГҮЙ байна = CRITICAL алдаа.
Буруу ажиллаж байна = HIGH алдаа.
Удаан, UX муу = MEDIUM.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return parsed.insights || [];
  } catch (e) {
    console.error('Claude шинжилгээ алдаа:', e);
    return [];
  }
}

// ─── Insight-уудыг DB-д хадгалах ───────────────────────
export async function saveInsights(insights: RawInsight[]): Promise<number> {
  let created = 0;
  for (const insight of insights) {
    const exists = await prisma.aiInsight.findFirst({
      where: { title: insight.title, status: { not: 'DONE' } },
    });
    if (exists) continue;

    await prisma.aiInsight.create({
      data: {
        type: insight.type,
        priority: insight.priority,
        title: insight.title,
        description: insight.description,
        suggestion: insight.suggestion || null,
        impact: insight.impact || null,
        effort: insight.effort || null,
        evidence: (insight.evidence as Record<string, string>) || null,
        tasks: { create: (insight.tasks || []).map(t => ({ title: t.title, description: t.description })) },
      },
    });
    created++;
  }
  return created;
}

// ─── Git commit-ээс тайлан үүсгэх ─────────────────────
export async function generateWorkReport(commits: string[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || commits.length === 0) return '';

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: `Доорх git commit-уудаас хийгдсэн ажлын товч Монгол тайлан бич. Категори: Шинэ функц, Алдаа засвар, Сайжруулалт, Тохиргоо. Тайланг markdown format-аар бич.\n\nCommits:\n${commits.join('\n')}` }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || '';
  } catch { return ''; }
}
