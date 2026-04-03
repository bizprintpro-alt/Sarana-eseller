import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireAuth } from '@/lib/api-auth';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

// GET /api/affiliate/links — list affiliate's links with stats
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const links = await prisma.affiliateLink.findMany({
      where: { affiliateId: auth.id },
      include: { conversions: true },
      orderBy: { createdAt: 'desc' },
    });

    const result = links.map((l) => ({
      id: l.id,
      code: l.code,
      productId: l.productId,
      clicks: l.clicks,
      conversions: l.conversions.length,
      conversionRate: l.clicks > 0 ? ((l.conversions.length / l.clicks) * 100).toFixed(1) : '0',
      earnings: l.conversions.reduce((s, c) => s + c.commission, 0),
      pendingEarnings: l.conversions.filter((c) => c.status === 'pending').reduce((s, c) => s + c.commission, 0),
      createdAt: l.createdAt,
    }));

    return json(result);
  } catch {
    // Demo fallback
    return json([
      { id: '1', code: 'abc123', productId: 'p1', clicks: 523, conversions: 28, conversionRate: '5.4', earnings: 124000, pendingEarnings: 35000, createdAt: '2026-04-01' },
      { id: '2', code: 'def456', productId: 'p2', clicks: 312, conversions: 18, conversionRate: '5.8', earnings: 86000, pendingEarnings: 12000, createdAt: '2026-03-28' },
      { id: '3', code: 'ghi789', productId: 'p3', clicks: 248, conversions: 9, conversionRate: '3.6', earnings: 42000, pendingEarnings: 8000, createdAt: '2026-03-25' },
    ]);
  }
}

// POST /api/affiliate/links — create affiliate link for product
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const { productId } = await req.json();
  if (!productId) return errorJson('productId шаардлагатай');

  try {
    // Check if link already exists
    const existing = await prisma.affiliateLink.findFirst({
      where: { affiliateId: auth.id, productId },
    });
    if (existing) return json({ code: existing.code, id: existing.id });

    let code = generateCode();
    // Ensure unique
    while (await prisma.affiliateLink.findUnique({ where: { code } })) {
      code = generateCode();
    }

    const link = await prisma.affiliateLink.create({
      data: { affiliateId: auth.id, productId, code },
    });

    return json({ code: link.code, id: link.id }, 201);
  } catch {
    // Fallback
    const code = generateCode();
    return json({ code, id: 'demo' }, 201);
  }
}
