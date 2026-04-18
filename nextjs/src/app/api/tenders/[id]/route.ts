import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireAdmin } from '@/lib/api-auth';

// GET /api/tenders/[id] — tender detail with bids
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;

    const tender = await prisma.governmentTender.findUnique({
      where: { id },
      include: {
        bids: {
          include: {
            shop: { select: { id: true, name: true, logo: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!tender) return errorJson('Тендер олдсонгүй', 404);

    return json(tender);
  } catch (e: unknown) {
    console.error('[tenders/[id] GET]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}

// PUT /api/tenders/[id] — update tender status (admin only)
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { status } = body;

    if (!status || !['CLOSED', 'AWARDED'].includes(status)) {
      return errorJson('status нь CLOSED эсвэл AWARDED байх ёстой');
    }

    const tender = await prisma.governmentTender.findUnique({ where: { id } });
    if (!tender) return errorJson('Тендер олдсонгүй', 404);

    const updated = await prisma.governmentTender.update({
      where: { id },
      data: { status },
    });

    return json(updated);
  } catch (e: unknown) {
    console.error('[tenders/[id] PUT]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}
