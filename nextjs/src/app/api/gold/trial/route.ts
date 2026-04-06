import { NextRequest, NextResponse } from 'next/server';
import { goldService } from '@/lib/loyalty/GoldService';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const membership = await goldService.startTrial(userId);
    return NextResponse.json({ membership, message: '30 хоногийн үнэгүй туршилт эхэллээ!' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
