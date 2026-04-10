import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const lowStock = await prisma.product.findMany({
      where: { isActive: true, stock: { lte: 5, gt: 0 } },
      select: { id: true, name: true, stock: true, userId: true },
    });

    const outOfStock = await prisma.product.findMany({
      where: { isActive: true, stock: 0 },
      select: { id: true, name: true, userId: true },
    });

    return NextResponse.json({
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      details: { lowStock: lowStock.slice(0, 20), outOfStock: outOfStock.slice(0, 20) },
    });
  } catch {
    return NextResponse.json({ error: 'Inventory check алдаа' }, { status: 500 });
  }
}
