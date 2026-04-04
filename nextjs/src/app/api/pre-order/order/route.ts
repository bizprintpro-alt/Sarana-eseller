import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/pre-order/order — place a pre-order (advance payment)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, buyerId, quantity, notes } = body;

    if (!productId || !buyerId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await prisma.preOrderProduct.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (product.status !== 'OPEN') return NextResponse.json({ error: 'Pre-order is closed' }, { status: 400 });
    if (quantity < product.minOrderQty) return NextResponse.json({ error: `Minimum order: ${product.minOrderQty}` }, { status: 400 });
    if (product.maxOrderQty && quantity > product.maxOrderQty) return NextResponse.json({ error: `Maximum order: ${product.maxOrderQty}` }, { status: 400 });

    const unitPrice = product.priceFinal || product.priceEstimate;
    const advanceAmount = Math.ceil(unitPrice * quantity * product.advancePct / 100);
    const remainingAmount = unitPrice * quantity - advanceAmount;

    const item = await prisma.preOrderItem.create({
      data: {
        productId,
        buyerId,
        quantity,
        unitPrice,
        advanceAmount,
        remainingAmount,
        status: 'PENDING',
        notes,
      },
    });

    // Update product order count
    await prisma.preOrderProduct.update({
      where: { id: productId },
      data: {
        currentOrders: { increment: 1 },
        // Auto close if target reached
        ...(product.targetOrders && product.currentOrders + 1 >= product.targetOrders
          ? { status: 'BATCH_FULL' }
          : {}
        ),
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
