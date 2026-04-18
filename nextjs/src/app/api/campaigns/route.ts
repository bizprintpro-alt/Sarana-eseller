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

    const where: Record<string, unknown> = {};
    if (entityId) where.entityId = entityId;
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
    console.error('[campaigns GET]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}

// POST /api/campaigns — create campaign
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entityId, createdById, name, type, subject, smsText, emailHtml, pushTitle, pushBody, audienceType, scheduledAt } = body;

    if (!name || !type) return errorJson('name, type required');

    // Generate refId: CMP-YYMM-NNNN
    const now = new Date();
    const prefix = `CMP-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastCampaign = await prisma.campaign.findFirst({
      where: { refId: { startsWith: prefix } },
      orderBy: { refId: 'desc' },
    });
    const seq = lastCampaign ? Number(lastCampaign.refId.split('-')[2]) + 1 : 1;
    const refId = `${prefix}-${String(seq).padStart(4, '0')}`;

    const campaign = await prisma.campaign.create({
      data: {
        refId,
        entityId: entityId || null,
        createdById: createdById || 'system',
        name,
        type,
        subject: subject || null,
        smsText: smsText || null,
        emailHtml: emailHtml || null,
        pushTitle: pushTitle || null,
        pushBody: pushBody || null,
        audienceType: audienceType || 'ALL',
        status: 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    return json(campaign, 201);
  } catch (e: unknown) {
    console.error('[campaigns POST]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}
