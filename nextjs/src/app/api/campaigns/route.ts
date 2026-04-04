import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson } from '@/lib/api-auth';

// GET /api/campaigns?entityId=&type=&status=&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const entityId = sp.get('entityId');
    const type = sp.get('type');
    const status = sp.get('status');
    const page = Math.max(1, Number(sp.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit') || 20)));

    if (!entityId) return errorJson('entityId required');

    const where: Record<string, unknown> = { entityId };
    if (type) where.type = type;
    if (status) where.status = status;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return json({ campaigns, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}

// POST /api/campaigns — create campaign
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entityId, name, type, subject, content, recipients, scheduledAt } = body;

    if (!entityId || !name || !type) return errorJson('entityId, name, type required');

    // Generate refId: CMP-YYMM-NNNN
    const now = new Date();
    const prefix = `CMP-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastCampaign = await prisma.campaign.findFirst({
      where: { refId: { startsWith: prefix } },
      orderBy: { refId: 'desc' },
    });
    const seq = lastCampaign
      ? Number(lastCampaign.refId.split('-')[2]) + 1
      : 1;
    const refId = `${prefix}-${String(seq).padStart(4, '0')}`;

    const campaign = await prisma.campaign.create({
      data: {
        refId,
        entityId,
        name,
        type,
        subject: subject || null,
        content: content || null,
        recipients: recipients || [],
        status: 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 },
      },
    });

    return json(campaign, 201);
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}
