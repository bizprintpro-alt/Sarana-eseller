import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, json, errorJson } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = requireAdmin(req);
  if (user instanceof Response) return user;

  try {
    const [orders, users, shops, products] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.shop.count(),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { orderNumber: true, status: true, total: true, createdAt: true },
    });

    // Call Claude API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return errorJson('ANTHROPIC_API_KEY тохируулаагүй', 500);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Eseller.mn платформын статистик шинжлэл хий. Монгол хэлээр хариул.

Статистик:
- Нийт захиалга: ${orders}
- Хэрэглэгчид: ${users}
- Дэлгүүрүүд: ${shops}
- Идэвхтэй бараа: ${products}
- Сүүлийн захиалгууд: ${JSON.stringify(recentOrders)}

Дараах зүйлсийг шинжил:
1. Борлуулалтын чиг хандлага
2. Системийн сайжруулах зүйлс
3. Маркетингийн санал
4. Эрсдэлийн анхааруулга`,
        }],
      }),
    });

    const data = await response.json();
    const analysis = data.content?.[0]?.text || 'Шинжилгээ хийж чадсангүй';

    // Save to DB
    await prisma.aiInsight.create({
      data: {
        type: 'system_analysis',
        title: 'Системийн шинжилгээ',
        summary: analysis.slice(0, 200),
        details: analysis,
        priority: 'medium',
        status: 'active',
        metadata: { orders, users, shops, products },
      },
    });

    return json({ analysis, stats: { orders, users, shops, products } });
  } catch (e) {
    return errorJson('Шинжилгээ амжилтгүй: ' + (e as Error).message, 500);
  }
}
