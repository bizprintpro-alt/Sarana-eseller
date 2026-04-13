import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson } from '@/lib/api-auth';

// GET /api/provinces — list all 21 provinces with delivery info
export async function GET(_req: NextRequest) {
  try {
    const provinces = await prisma.province.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        deliveryDays: true,
        fee: true,
        isFree: true,
        isActive: true,
        _count: { select: { agents: true } },
      },
    });

    return json(provinces);
  } catch (err) {
    return errorJson('Аймгуудыг ачааллахад алдаа гарлаа', 500);
  }
}
