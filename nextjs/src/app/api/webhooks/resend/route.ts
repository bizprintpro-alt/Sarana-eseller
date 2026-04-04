import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/webhooks/resend — handle Resend email events
export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    const campaignId = data?.tags?.campaignId;
    if (!campaignId) return NextResponse.json({ received: true });

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ received: true });

    const stats = (campaign.stats as Record<string, number>) || {};
    const eventMap: Record<string, string> = {
      'email.delivered': 'delivered',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.bounced': 'bounced',
    };

    const field = eventMap[type];
    if (field) {
      stats[field] = (stats[field] || 0) + 1;
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { stats },
      });
    }

    return NextResponse.json({ received: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
