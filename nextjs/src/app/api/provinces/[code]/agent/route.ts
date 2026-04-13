import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

// POST /api/provinces/[code]/agent — apply to become a province agent
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { code } = await ctx.params;

  try {
    const province = await prisma.province.findUnique({ where: { code } });
    if (!province) return errorJson('Аймаг олдсонгүй', 404);
    if (!province.isActive) return errorJson('Энэ аймагт хүргэлт идэвхгүй байна', 400);

    const { phone, address } = await req.json() as { phone?: string; address?: string };
    if (!phone || !address) return errorJson('Утас болон хаяг шаардлагатай', 400);

    // Check if user already applied for this province
    const existing = await prisma.provinceAgent.findFirst({
      where: { provinceId: province.id, userId: auth.id },
    });
    if (existing) return errorJson('Та энэ аймагт аль хэдийн бүртгэлтэй байна', 409);

    const agent = await prisma.provinceAgent.create({
      data: {
        provinceId: province.id,
        userId: auth.id,
        phone,
        address,
      },
      include: {
        province: { select: { name: true, code: true } },
      },
    });

    return json(agent, 201);
  } catch (err) {
    return errorJson('Төлөөлөгч бүртгэхэд алдаа гарлаа', 500);
  }
}
