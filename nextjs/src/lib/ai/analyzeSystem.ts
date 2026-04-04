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

  const [patterns, totalShops, totalOrders, totalUsers, ordersToday] = await Promise.all([
    prisma.userBehaviorPattern.findMany({
      where: { lastSeen: { gte: weekAgo } },
      orderBy: { frequency: 'desc' },
      take: 20,
    }),
    prisma.shop.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { createdAt: { gte: dayAgo } } }),
  ]);

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
      errorRate: 0,
      avgResponseTime: 0,
    },
  };
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

  const systemPrompt = `Та eseller.mn Монголын онлайн худалдааны платформын байнгын хөгжүүлэгч.
Таны үүрэг:
1. Системийн алдаа, дутагдлыг олох
2. Хэрэглэгчийн зан үйлийн хэв маягаас дүгнэлт гаргах
3. Сайжруулалтын санал тодорхой болгох
4. Хэрэгжүүлэх ажлын жагсаалт гаргах

Хариултыг JSON форматаар өг:
{"insights": [{"type": "BUG|PERFORMANCE|UX_ISSUE|SECURITY|DATA_QUALITY|FEATURE_REQUEST|OPTIMIZATION|SYSTEM_HEALTH", "priority": "CRITICAL|HIGH|MEDIUM|LOW", "title": "string", "description": "string", "suggestion": "string", "impact": "string", "effort": "string", "tasks": [{"title": "string", "description": "string"}]}]}`;

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
          content: `Доорх системийн мэдээллийг шинжилж, алдаа, дутагдал, сайжруулалтын саналыг гарга:

## Хэрэглэгчийн давтамжтай үйлдлүүд:
${JSON.stringify(snapshot.userPatterns, null, 2)}

## Системийн метрик:
${JSON.stringify(snapshot.metrics, null, 2)}`,
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
