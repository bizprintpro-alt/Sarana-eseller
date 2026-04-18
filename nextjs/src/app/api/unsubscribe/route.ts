import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson } from '@/lib/api-auth';

// POST /api/unsubscribe — opt out of marketing communications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, channel, reason } = body;

    if (!channel) return errorJson('channel required');
    if (!email && !phone) return errorJson('email or phone required');

    const record = await prisma.marketingOptOut.create({
      data: {
        email: email || null,
        phone: phone || null,
        channel,
        reason: reason || null,
      },
    });

    return json(record, 201);
  } catch (e: unknown) {
    console.error('[unsubscribe]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}
