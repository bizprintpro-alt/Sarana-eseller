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
}

interface SystemMetrics {
  totalShops: number;
  totalOrders: number;
  totalUsers: number;
  ordersToday: number;
  errorRate: number;
  avgResponseTime: number;
  totalProducts?: number;
  avgProductRating?: number;
  totalReviews?: number;
  recentOrderStatuses?: string[];
  platformConfigs?: string[];
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

  const [patterns, totalShops, totalOrders, totalUsers, ordersToday, recentOrders, products, reviews, configs] = await Promise.all([
    prisma.userBehaviorPattern.findMany({
      where: { lastSeen: { gte: weekAgo } },
      orderBy: { frequency: 'desc' },
      take: 20,
    }),
    prisma.shop.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { status: true, createdAt: true } }),
    prisma.product.aggregate({ _count: true, _avg: { rating: true } }),
    prisma.review.count(),
    prisma.platformConfig.findMany(),
  ]);

  // Cancelled/failed order rate
  const failedOrders = recentOrders.filter(o => o.status === 'cancelled' || o.status === 'failed').length;

  return {
    errorLogs: [],
    userPatterns: patterns.map(p => ({
      pattern: p.pattern,
      frequency: p.frequency,
      userCount: p.userCount,
      lastSeen: p.lastSeen,
    })),
    recentComplaints: [],
    metrics: {
      totalShops,
      totalOrders,
      totalUsers,
      ordersToday,
      errorRate: recentOrders.length > 0 ? Math.round((failedOrders / recentOrders.length) * 100) : 0,
      avgResponseTime: 0,
      // Extended metrics
      totalProducts: products._count || 0,
      avgProductRating: products._avg?.rating || 0,
      totalReviews: reviews,
      recentOrderStatuses: recentOrders.map(o => o.status),
      platformConfigs: configs.map(c => `${c.key}=${c.value}`),
    },
  };
}

// ─── API endpoint-уудыг бодитоор шалгах ────────────────
export async function checkEndpoints(baseUrl: string): Promise<{ endpoint: string; status: number; ok: boolean; error?: string }[]> {
  const endpoints = [
    { url: '/api/products?limit=1', method: 'GET' },
    { url: '/api/shops?limit=1', method: 'GET' },
    { url: '/api/maintenance-status', method: 'GET' },
    { url: '/api/categories', method: 'GET' },
  ];

  const results = [];
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${ep.url}`, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
      });
      results.push({ endpoint: ep.url, status: res.status, ok: res.ok });
    } catch (e) {
      results.push({ endpoint: ep.url, status: 0, ok: false, error: (e as Error).message });
    }
  }
  return results;
}

// ─── Claude API-р шинжилгээ хийх ───────────────────────
export async function analyzeSystemWithClaude(
  snapshot: SystemSnapshot
): Promise<RawInsight[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY тохируулаагүй — шинжилгээ хийх боломжгүй');
    return [];
  }

  const systemPrompt = `Та eseller.mn Монголын e-commerce платформын ахлах хөгжүүлэгч.
Платформ: Next.js 16 + Prisma + MongoDB + Vercel deploy.

Таны үүрэг:
1. Бодит алдаа, дутагдлыг олох (DB state, config, data integrity)
2. Хэрэглэгчийн зан үйлээс асуудал тодорхойлох
3. Яг хаана (файл, API route, DB) ямар засвар хийх вэ гэдгийг тодорхой бичих
4. Хамгийн чухал зүйлийг эхэнд тавих

ЧУХАЛ:
- "suggestion" талбарт ЯГ ЮУ ХИЙХ — файлын нэр, функцийн нэр, API route бичнэ
- Ерөнхий "сайжруулах хэрэгтэй" гэхгүй, тодорхой заавар өгнө
- Хоосон бүтээгдэхүүн, review, захиалга байвал тэрийг тэмдэглэнэ

JSON формат:
{"insights": [{"type": "BUG|PERFORMANCE|UX_ISSUE|SECURITY|DATA_QUALITY|FEATURE_REQUEST|OPTIMIZATION|SYSTEM_HEALTH", "priority": "CRITICAL|HIGH|MEDIUM|LOW", "title": "string", "description": "string", "suggestion": "файл/route/функцийн нэр + яг юу хийх", "impact": "хэрэглэгчид ямар нөлөөтэй", "effort": "хэдэн цагийн ажил", "tasks": [{"title": "string", "description": "тодорхой хийх зүйл"}]}]}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Доорх системийн мэдээллийг шинжилж, бодит алдаа, хэрэглэгч хийж чадахгүй байгаа үйлдлүүдийг ол:

## Системийн метрик:
${JSON.stringify(snapshot.metrics, null, 2)}

## API endpoint шалгалт (алдаатай бол CRITICAL):
${snapshot.errorLogs.length > 0 ? JSON.stringify(snapshot.errorLogs, null, 2) : 'Бүх endpoint ажиллаж байна ✓'}

## Хэрэглэгчийн давтамжтай үйлдлүүд (асуудал байж болно):
${JSON.stringify(snapshot.userPatterns, null, 2)}

## Шалгах зүйлс:
- Захиалга өгөх процесс бүрэн ажиллаж байна уу? (checkout → payment → order)
- Review бичих, унших ажиллаж байна уу?
- Дэлгүүр бүртгэл, бараа нэмэх ажиллаж байна уу?
- Хайлт, фильтр ажиллаж байна уу?
- Хэрэглэгч бүртгүүлэх, нэвтрэх ажиллаж байна уу?
- Chat, мессеж илгээх ажиллаж байна уу?
- Affiliate линк хуваалцах, комисс тооцоолох ажиллаж байна уу?
- Админ тохиргоо хадгалагдаж байна уу?
- Хуудсууд зөв ачааллаж байна уу?

Хэрэглэгч юу хийж чадахгүй байгаа = АЛДАА. Тодорхой файл, API route нэрлэж засварын заавар бич.`,
        }],
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
    // Давтагдал шалгах
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
        tasks: {
          create: (insight.tasks || []).map(t => ({
            title: t.title,
            description: t.description,
          })),
        },
      },
    });
    created++;
  }

  return created;
}
