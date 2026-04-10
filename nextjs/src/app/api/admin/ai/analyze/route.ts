import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, json, errorJson } from '@/lib/api-auth';

// POST /api/admin/ai/analyze — run full system analysis
export async function POST(req: NextRequest) {
  const user = requireAdmin(req);
  if (user instanceof Response) return user;

  try {
    // Gather all system stats
    const [orders, users, shops, products, sellers, pendingOrders, deliveredOrders] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.shop.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.sellerProfile.count().catch(() => 0),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'delivered' } }),
    ]);

    const [recentOrders, lowStock, categories] = await Promise.all([
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { orderNumber: true, status: true, total: true, createdAt: true } }),
      prisma.product.findMany({ where: { stock: { lt: 5 }, isActive: true }, take: 10, select: { name: true, stock: true } }),
      prisma.category.count({ where: { isApproved: true } }),
    ]);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return errorJson('ANTHROPIC_API_KEY тохируулаагүй', 500);

    const prompt = `Та Eseller.mn платформын мастер шинжилэгч AI. Бүрэн тайлан гарга.

СТАТИСТИК:
- Хэрэглэгч: ${users} | Дэлгүүр: ${shops} | Бараа: ${products} | Борлуулагч: ${sellers}
- Захиалга: ${orders} (хүлээгдэж: ${pendingOrders}, хүргэгдсэн: ${deliveredOrders})
- Ангилал: ${categories} | Бага нөөц: ${lowStock.length} бараа
- Сүүлийн захиалга: ${JSON.stringify(recentOrders)}
- Бага нөөцтэй: ${JSON.stringify(lowStock)}

ДААЛГАВАР:
1. СИСТЕМИЙН ОНОО (0-100) — яагаад тийм оноо авсан
2. ЯАРАЛТАЙ АСУУДЛУУД:
   🔴 ЯАРАЛТАЙ: [асуудал] → [шийдэл]
   🟡 ЧУХАЛ: [асуудал] → [шийдэл]
   🟢 САЙЖРУУЛАЛТ: [асуудал] → [шийдэл]
3. ГҮЙЦЭТГЭЛИЙН ШИНЖИЛГЭЭ
4. ӨСӨЛТИЙН САНАЛ (орлого, хэрэглэгч, маркетинг)
5. ТЭРГҮҮЛЭХ 5 ЗАСВАР (дараалал + хугацаа)

Монгол хэлээр мэргэжлийн тайлан бич.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] }),
    });

    const data = await response.json();
    const fullText = data.content?.[0]?.text || 'Шинжилгээ хийж чадсангүй';

    // Parse score
    const scoreMatch = fullText.match(/(\d+)\s*\/\s*100|оноо[:\s]*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 70;

    // Parse issues
    const issues: { severity: string; text: string }[] = [];
    for (const line of fullText.split('\n')) {
      if (line.includes('🔴')) issues.push({ severity: 'critical', text: line.replace(/🔴\s*/, '').trim() });
      else if (line.includes('🟡')) issues.push({ severity: 'warning', text: line.replace(/🟡\s*/, '').trim() });
      else if (line.includes('🟢')) issues.push({ severity: 'info', text: line.replace(/🟢\s*/, '').trim() });
    }

    // Save to DB
    const insight = await prisma.aiInsight.create({
      data: {
        type: 'system_analysis',
        title: 'Бүрэн системийн шинжилгээ',
        description: fullText.slice(0, 300),
        suggestion: fullText,
        priority: score >= 80 ? 'low' : score >= 60 ? 'medium' : 'high',
        status: 'active',
        evidence: { score, issues, stats: { users, orders, shops, products, sellers, pendingOrders, deliveredOrders } },
      },
    });

    return json({ id: insight.id, score, issues, fullText, stats: { users, orders, shops, products, sellers, pendingOrders, deliveredOrders } });
  } catch (e) {
    return errorJson('Шинжилгээ амжилтгүй: ' + (e as Error).message, 500);
  }
}

// GET /api/admin/ai/analyze — history
export async function GET(req: NextRequest) {
  const user = requireAdmin(req);
  if (user instanceof Response) return user;

  const history = await prisma.aiInsight.findMany({
    where: { type: 'system_analysis' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, title: true, description: true, suggestion: true, priority: true, evidence: true, createdAt: true },
  });

  return json(history);
}
