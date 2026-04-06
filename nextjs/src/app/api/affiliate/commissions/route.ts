import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/affiliate/commissions — list commissions for a seller
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ commissions: [] });

    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!seller) return NextResponse.json({ commissions: [] });

    const commissions = await prisma.sellerCommission.findMany({
      where: { sellerProfileId: seller.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalEarned = commissions.filter(c => c.status !== 'cancelled').reduce((s, c) => s + c.commissionAmount, 0);
    const pendingAmount = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.commissionAmount, 0);

    return NextResponse.json({ commissions, totalEarned, pendingAmount });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST /api/affiliate/commissions — payout request
export async function POST(req: NextRequest) {
  try {
    const { userId, phone, amount } = await req.json();
    // In production: create a payout request record, verify balance, etc.
    return NextResponse.json({ success: true, message: 'Хүсэлт илгээгдлээ. 24 цагийн дотор шилжүүлнэ.' });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
