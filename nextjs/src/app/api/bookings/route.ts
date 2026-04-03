import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireSeller, getShopForUser, getAuthUser } from '@/lib/api-auth';

// GET /api/bookings?shopId=...&status=...&date=...
export async function GET(req: NextRequest) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  const sp = req.nextUrl.searchParams;
  const shopId = sp.get('shopId') || (await getShopForUser(auth.id));
  if (!shopId) return errorJson('shopId шаардлагатай');

  const where: Record<string, unknown> = { shopId };
  const status = sp.get('status');
  if (status && status !== 'all') where.status = status;
  const date = sp.get('date');
  if (date) {
    const start = new Date(date + 'T00:00:00Z');
    const end = new Date(date + 'T23:59:59Z');
    where.scheduledAt = { gte: start, lte: end };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: { service: { select: { name: true, duration: true, category: true } } },
    orderBy: { scheduledAt: 'asc' },
  });

  return json(bookings);
}

// POST /api/bookings — create booking (public, customer facing)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { serviceId, shopId, customerName, customerPhone, scheduledAt, notes } = body;

  if (!serviceId || !shopId || !customerName || !customerPhone || !scheduledAt) {
    return errorJson('serviceId, shopId, customerName, customerPhone, scheduledAt шаардлагатай');
  }

  // Verify service exists and is active
  const service = await prisma.service.findFirst({
    where: { id: serviceId, shopId, isActive: true },
  });
  if (!service) return errorJson('Үйлчилгээ олдсонгүй эсвэл идэвхгүй', 404);

  // Check for scheduling conflicts
  const scheduledDate = new Date(scheduledAt);
  const endDate = new Date(scheduledDate.getTime() + (service.duration || 60) * 60000);

  const conflict = await prisma.booking.findFirst({
    where: {
      shopId,
      status: { in: ['pending', 'confirmed', 'in_progress'] },
      scheduledAt: { gte: scheduledDate, lt: endDate },
    },
  });

  if (conflict) return errorJson('Энэ цагт аль хэдийн захиалга байна', 409);

  // Get customer id if logged in
  const user = getAuthUser(req);

  const booking = await prisma.booking.create({
    data: {
      serviceId,
      shopId,
      customerId: user?.id || null,
      customerName,
      customerPhone,
      scheduledAt: scheduledDate,
      duration: service.duration,
      total: service.price,
      notes: notes || null,
      status: 'pending',
    },
    include: { service: { select: { name: true } } },
  });

  return json(booking, 201);
}
