import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/store/commissions — list all commissions for a store's sellers
export async function GET(req: NextRequest) {
  try {
    const shopId = req.nextUrl.searchParams.get('shopId');
    if (!shopId) return NextResponse.json({ commissions: [] });

    const commissions = await prisma.sellerCommission.findMany({
      where: { shopId },
      include: { seller: { select: { displayName: true, username: true, commissionRate: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ commissions });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST /api/store/commissions — pay a commission
export async function POST(req: NextRequest) {
  try {
    const { commissionId, action } = await req.json();

    if (action === 'pay') {
      await prisma.sellerCommission.update({
        where: { id: commissionId },
        data: { status: 'paid', paidAt: new Date() },
      });
      return NextResponse.json({ success: true, message: 'Төлбөр амжилттай' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
