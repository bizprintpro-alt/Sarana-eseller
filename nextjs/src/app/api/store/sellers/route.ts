import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/store/sellers — list seller requests for a store
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status') || 'all';

    const where: Record<string, unknown> = {};
    if (status === 'pending') where.isApproved = false;
    else if (status === 'approved') where.isApproved = true;

    const sellerProducts = await prisma.sellerProduct.findMany({
      where,
      include: {
        seller: true,
        product: { select: { name: true, price: true, emoji: true, images: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sellerProducts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 });
  }
}

// POST /api/store/sellers — approve or reject
export async function POST(req: NextRequest) {
  try {
    const { sellerProductId, action, reason } = await req.json();

    if (!sellerProductId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (action === 'approve') {
      await prisma.sellerProduct.update({
        where: { id: sellerProductId },
        data: { isApproved: true, approvedAt: new Date() },
      });
      return NextResponse.json({ success: true, message: 'Зөвшөөрөгдлөө' });
    }

    if (action === 'reject') {
      await prisma.sellerProduct.delete({
        where: { id: sellerProductId },
      });
      return NextResponse.json({ success: true, message: 'Татгалзлаа', reason });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
