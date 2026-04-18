import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// GET /api/affiliate/commissions — list commissions for the authenticated seller
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const seller = await prisma.sellerProfile.findUnique({ where: { userId: auth.id } });
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
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { phone, amount } = await req.json();
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Дүн буруу' }, { status: 400 });
    }
    if (!phone || !String(phone).trim()) {
      return NextResponse.json({ error: 'Утасны дугаар шаардлагатай' }, { status: 400 });
    }

    // Verify the authenticated user actually has enough pending commission to pay out
    const seller = await prisma.sellerProfile.findUnique({ where: { userId: auth.id } });
    if (!seller) return NextResponse.json({ error: 'Худалдаачийн профайл олдсонгүй' }, { status: 404 });

    const pendingCommissions = await prisma.sellerCommission.findMany({
      where: { sellerProfileId: seller.id, status: 'pending' },
    });
    const pendingTotal = pendingCommissions.reduce((s, c) => s + c.commissionAmount, 0);

    if (amount > pendingTotal) {
      return NextResponse.json({ error: 'Хүлээгдэж буй комиссоос илүү дүн хүссэн' }, { status: 400 });
    }

    // TODO: create a PayoutRequest record here rather than a no-op response
    return NextResponse.json({ success: true, message: 'Хүсэлт илгээгдлээ. 24 цагийн дотор шилжүүлнэ.' });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
