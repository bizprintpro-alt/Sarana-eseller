import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

// POST /api/campaigns/[id]/send — queue campaign for sending
export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return errorJson('Campaign not found', 404);
    if (campaign.status === 'SENDING' || campaign.status === 'SENT') {
      return errorJson('Campaign already sent or sending', 400);
    }

    const recipientCount = campaign.audienceCount || 0;

    await prisma.campaign.update({
      where: { id },
      data: {
        status: 'SENDING',
        sentAt: new Date(),
        totalSent: recipientCount,
      },
    });

    return json({ status: 'queued', recipientCount });
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}
