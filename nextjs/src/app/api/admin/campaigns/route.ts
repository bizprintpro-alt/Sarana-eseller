import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { recordRevenue } from '@/lib/revenue';

const UNIT_PRICES: Record<string, number> = { sms: 50, email: 20, push: 10 };

// GET /api/admin/campaigns
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const campaigns = await prisma.marketingCampaign.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  return NextResponse.json(campaigns);
}

// POST /api/admin/campaigns — create + optionally send
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const unitPrice = UNIT_PRICES[body.type] || 10;
  const recipientCount = body.recipientCount || 0;
  const totalCost = recipientCount * unitPrice;

  const campaign = await prisma.marketingCampaign.create({
    data: {
      type: body.type,
      title: body.title,
      body: body.body,
      targetSegment: body.targetSegment || {},
      recipientCount,
      totalCost,
      status: body.sendNow ? 'sent' : (body.scheduledAt ? 'scheduled' : 'draft'),
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      sentAt: body.sendNow ? new Date() : null,
      sentCount: body.sendNow ? recipientCount : 0,
    },
  });

  if (body.sendNow && totalCost > 0) {
    await recordRevenue(body.type as 'sms' | 'email' | 'push', totalCost, { campaignId: campaign.id });
  }

  return NextResponse.json(campaign, { status: 201 });
}
