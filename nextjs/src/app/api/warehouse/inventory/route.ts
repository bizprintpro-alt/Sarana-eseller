import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, json, errorJson } from '@/lib/api-auth';

// GET /api/warehouse/inventory — list inventory with low stock alerts
export async function GET(req: NextRequest) {
  const user = requireAdmin(req);
  if (user instanceof Response) return user;

  const warehouseId = req.nextUrl.searchParams.get('warehouseId');

  const items = await prisma.inventoryItem.findMany({
    where: warehouseId ? { warehouseId } : {},
    include: { warehouse: { select: { name: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  const lowStock = items.filter(i => i.available <= i.minStock);
  const warehouses = await prisma.warehouse.findMany({ where: { isActive: true }, select: { id: true, name: true, address: true } });

  return json({ items, lowStock: lowStock.length, warehouses, totalItems: items.length });
}

// POST /api/warehouse/inventory — add/update stock
export async function POST(req: NextRequest) {
  const user = requireAdmin(req);
  if (user instanceof Response) return user;

  const { warehouseId, productId, quantity, type = 'IN', note, shopId } = await req.json();
  if (!warehouseId || !productId || !quantity) return errorJson('warehouseId, productId, quantity шаардлагатай');

  // Upsert inventory
  const existing = await prisma.inventoryItem.findUnique({ where: { warehouseId_productId: { warehouseId, productId } } });

  let item;
  if (existing) {
    const delta = type === 'IN' || type === 'RELEASED' ? quantity : -quantity;
    item = await prisma.inventoryItem.update({
      where: { id: existing.id },
      data: {
        quantity: { increment: type === 'IN' ? quantity : 0 },
        available: { increment: delta },
        reserved: type === 'RESERVED' ? { increment: quantity } : type === 'RELEASED' ? { decrement: quantity } : existing.reserved,
      },
    });
  } else {
    item = await prisma.inventoryItem.create({
      data: { warehouseId, productId, shopId, quantity, available: quantity, reserved: 0 },
    });
  }

  // Log movement
  await prisma.stockMovement.create({ data: { inventoryId: item.id, type, quantity, note, createdBy: user.id } });

  return json(item);
}
