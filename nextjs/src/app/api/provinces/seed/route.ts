import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireAdmin } from '@/lib/api-auth';

const PROVINCES = [
  { name: 'Архангай', code: 'AKH', deliveryDays: 7, fee: 15000 },
  { name: 'Баян-Өлгий', code: 'BOL', deliveryDays: 10, fee: 20000 },
  { name: 'Баянхонгор', code: 'BKH', deliveryDays: 7, fee: 15000 },
  { name: 'Булган', code: 'BUL', deliveryDays: 5, fee: 12000 },
  { name: 'Говь-Алтай', code: 'GOA', deliveryDays: 10, fee: 20000 },
  { name: 'Говьсүмбэр', code: 'GOS', deliveryDays: 5, fee: 10000 },
  { name: 'Дархан-Уул', code: 'DAR', deliveryDays: 3, fee: 8000 },
  { name: 'Дорноговь', code: 'DGO', deliveryDays: 7, fee: 15000 },
  { name: 'Дорнод', code: 'DOR', deliveryDays: 10, fee: 18000 },
  { name: 'Дундговь', code: 'DUN', deliveryDays: 7, fee: 15000 },
  { name: 'Завхан', code: 'ZAV', deliveryDays: 10, fee: 20000 },
  { name: 'Орхон', code: 'ORK', deliveryDays: 3, fee: 8000 },
  { name: 'Өвөрхангай', code: 'OVR', deliveryDays: 7, fee: 15000 },
  { name: 'Өмнөговь', code: 'OMN', deliveryDays: 7, fee: 15000 },
  { name: 'Сүхбаатар', code: 'SUK', deliveryDays: 7, fee: 15000 },
  { name: 'Сэлэнгэ', code: 'SEL', deliveryDays: 5, fee: 10000 },
  { name: 'Төв', code: 'TOV', deliveryDays: 3, fee: 8000 },
  { name: 'Увс', code: 'UVS', deliveryDays: 10, fee: 20000 },
  { name: 'Ховд', code: 'KHO', deliveryDays: 10, fee: 20000 },
  { name: 'Хөвсгөл', code: 'KHV', deliveryDays: 10, fee: 18000 },
  { name: 'Хэнтий', code: 'KHE', deliveryDays: 7, fee: 15000 },
] as const;

// POST /api/provinces/seed — seed all 21 Mongolian provinces (admin only)
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    let created = 0;
    let skipped = 0;

    for (const p of PROVINCES) {
      const exists = await prisma.province.findUnique({ where: { code: p.code } });
      if (exists) {
        skipped++;
        continue;
      }
      await prisma.province.create({ data: p });
      created++;
    }

    return json({ created, skipped, total: PROVINCES.length });
  } catch (err) {
    return errorJson('Аймгуудыг үүсгэхэд алдаа гарлаа', 500);
  }
}
