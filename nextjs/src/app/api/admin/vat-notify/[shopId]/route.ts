import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const { shopId } = await params;

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, name: true, userId: true },
    });

    if (!shop) {
      return NextResponse.json({ error: 'Дэлгүүр олдсонгүй' }, { status: 404 });
    }

    // Log the notification
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'vat.notify',
        after: { shopId, shopName: shop.name },
      },
    });

    return NextResponse.json({ success: true, message: 'НӨАТ мэдэгдэл илгээсэн' });
  } catch (error) {
    console.error('[vat-notify]:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
