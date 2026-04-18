import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson, getShopForUser } from '@/lib/api-auth';
import { placeCJOrder } from '@/lib/aliexpress';

// POST /api/dropship/fulfill — fulfill a dropship order
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { orderId } = await req.json();
  if (!orderId) return errorJson('orderId шаардлагатай');

  // Get order
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return errorJson('Захиалга олдсонгүй', 404);

  // Check order has dropship items — batch fetch instead of per-item lookup
  const items = order.items as any[];
  const productIds = Array.from(new Set(items.map((i) => i.productId || i.id).filter(Boolean)));
  const dropshipProducts = productIds.length
    ? await prisma.dropshipProduct.findMany({ where: { productId: { in: productIds } } })
    : [];
  const dropshipByProductId = new Map(dropshipProducts.map((d) => [d.productId, d]));
  const dropshipItems = items
    .map((item) => {
      const dropship = dropshipByProductId.get(item.productId || item.id);
      return dropship ? { item, dropship } : null;
    })
    .filter((x): x is { item: any; dropship: (typeof dropshipProducts)[number] } => x !== null);

  if (dropshipItems.length === 0) return errorJson('Энэ захиалгад dropship бараа байхгүй');

  // Check if already fulfilled
  const existing = await prisma.dropshipOrder.findUnique({ where: { orderId } });
  if (existing) return errorJson('Аль хэдийн нийлүүлэгчид илгээсэн');

  // Parse delivery address
  const delivery = order.delivery as any;
  const address = {
    name: delivery?.address?.building || 'Customer',
    phone: delivery?.phone || '',
    country: 'MN',
    province: delivery?.address?.district || 'Ulaanbaatar',
    city: 'Ulaanbaatar',
    address: order.deliveryAddress || delivery?.address?.street || '',
    zip: '14200',
  };

  // Place order with supplier
  const result = await placeCJOrder({
    supplierSku: dropshipItems[0].dropship.supplierSku || dropshipItems[0].dropship.supplierId,
    quantity: dropshipItems[0].item.quantity || 1,
    address,
    orderNumber: `ESL-${order.id.slice(-8)}`,
  });

  // Record dropship order
  const dsOrder = await prisma.dropshipOrder.create({
    data: {
      orderId,
      supplierOrderId: result.orderId,
      status: result.success ? 'ORDERED' : 'FAILED',
      trackingNumber: result.trackingNumber,
    },
  });

  return json({
    message: result.success ? 'Нийлүүлэгчид захиалга илгээгдлээ' : 'Нийлүүлэгчид илгээхэд алдаа',
    dropshipOrder: dsOrder,
  });
}
