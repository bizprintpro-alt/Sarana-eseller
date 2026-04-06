import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createInvoice, isDemoMode, createDemoInvoice } from '@/lib/payment/qpay';
import { generateQRCode } from '@/lib/share/generateShareContent';

export async function POST(req: NextRequest) {
  try {
    const { items, totalAmount, deliveryAddress, deliveryMethod, sellerProfileId, userId } = await req.json();

    if (!items?.length || !totalAmount) {
      return NextResponse.json({ error: 'Cart items and amount required' }, { status: 400 });
    }

    // Create pending order
    const order = await prisma.order.create({
      data: {
        userId: userId || undefined,
        items: items,
        total: totalAmount,
        status: 'pending',
        deliveryAddress: deliveryAddress || undefined,
        paymentMethod: 'qpay',
        sellerProfileId: sellerProfileId || undefined,
      },
    });

    // Create QPay invoice
    const invoiceParams = {
      orderId: order.id,
      amount: totalAmount,
      description: `eseller.mn захиалга #${order.orderNumber || order.id.slice(-6)}`,
    };

    let invoice;
    let qrDataUrl = '';

    if (isDemoMode()) {
      // Demo mode — no real QPay credentials
      invoice = createDemoInvoice(invoiceParams);
      qrDataUrl = await generateQRCode(`https://eseller.mn/orders/${order.id}`);
    } else {
      // Real QPay
      invoice = await createInvoice(invoiceParams);
      qrDataUrl = invoice.qr_image
        ? `data:image/png;base64,${invoice.qr_image}`
        : await generateQRCode(invoice.qr_text);
    }

    // Save invoice ID to order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: invoice.invoice_id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber || order.id.slice(-6),
      invoiceId: invoice.invoice_id,
      qrText: invoice.qr_text,
      qrImage: invoice.qr_image || '',
      qrDataUrl,
      deepLinks: invoice.urls || [],
      amount: totalAmount,
      isDemoMode: isDemoMode(),
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
