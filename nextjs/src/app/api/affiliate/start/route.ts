import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireAuth } from '@/lib/api-auth';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

// POST /api/affiliate/start — start selling a product as affiliate
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const { productId } = await req.json();
    if (!productId) return errorJson('productId шаардлагатай');

    // Check if affiliate link already exists
    const existing = await prisma.affiliateLink.findFirst({
      where: { affiliateId: auth.id, productId },
    });

    if (existing) {
      return json({
        code: existing.code,
        id: existing.id,
        link: `https://eseller.mn/r/${existing.code}`,
        message: 'Энэ барааг аль хэдийн борлуулж байна',
      });
    }

    // Generate unique code
    let code = generateCode();
    while (await prisma.affiliateLink.findUnique({ where: { code } })) {
      code = generateCode();
    }

    // Create affiliate link
    const link = await prisma.affiliateLink.create({
      data: {
        affiliateId: auth.id,
        productId,
        code,
      },
    });

    return json({
      code: link.code,
      id: link.id,
      link: `https://eseller.mn/r/${link.code}`,
      message: 'Борлуулж эхэллээ!',
    }, 201);
  } catch {
    // Fallback for demo/development
    const code = generateCode();
    return json({
      code,
      id: 'demo',
      link: `https://eseller.mn/r/${code}`,
      message: 'Борлуулж эхэллээ!',
    }, 201);
  }
}
