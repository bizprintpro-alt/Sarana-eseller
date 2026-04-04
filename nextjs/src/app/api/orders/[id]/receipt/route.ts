import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createReceipt, calculateTax } from '@/lib/ebarimt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    // Check for existing receipt
    const existing = await prisma.taxReceipt.findFirst({
      where: { orderId },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Захиалга олдсонгүй' },
        { status: 404 }
      );
    }

    // Build items from order
    const orderData = order as any;
    const items = (orderData.items || []).map((item: any) => ({
      name: item.name || item.title || 'Бараа',
      qty: item.qty || item.quantity || 1,
      unitPrice: item.price || 0,
      totalPrice: (item.price || 0) * (item.qty || item.quantity || 1),
    }));

    const totalAmount = items.reduce((s: number, i: any) => s + i.totalPrice, 0) || orderData.total || 0;

    // If no items, create a single-line receipt
    if (items.length === 0) {
      items.push({
        name: 'Захиалга',
        qty: 1,
        unitPrice: totalAmount,
        totalPrice: totalAmount,
      });
    }

    // Create еБаримт receipt
    const receipt = await createReceipt(orderId, orderData.buyerTIN || null, items);
    const tax = calculateTax(totalAmount);

    // Save to DB
    const saved = await prisma.taxReceipt.create({
      data: {
        orderId,
        billId: receipt.billId,
        qrData: receipt.qrData,
        lottery: receipt.lottery,
        amount: totalAmount,
        vatAmount: tax.vat,
        cityTax: tax.cityTax,
        buyerTIN: receipt.buyerTIN,
        items: items as any,
        status: 'SUCCESS',
      },
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    console.error('еБаримт алдаа:', error);
    return NextResponse.json(
      { error: 'Баримт үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
