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

    const updateMap: Record<string, Record<string, { increment: number }>> = {
      'email.delivered': { delivered: { increment: 1 } },
      'email.opened':    { opened: { increment: 1 } },
      'email.clicked':   { clicked: { increment: 1 } },
      'email.bounced':   { bounced: { increment: 1 } },
    };

    const update = updateMap[type];
    if (update) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: update,
      });

      await prisma.campaignEvent.create({
        data: {
          campaignId,
          userId: data?.userId || null,
          type: type.replace('email.', ''),
          occurredAt: new Date(),
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
