import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller, json, errorJson } from '@/lib/api-auth';

// POST /api/store/sellers/[id] — approve or reject seller product
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireSeller(req);
  if (user instanceof Response) return user;

  const { id } = await params;
  const { action } = await req.json(); // 'approve' | 'reject'

  const sp = await prisma.sellerProduct.findUnique({
    where: { id },
    include: { product: { select: { userId: true } } },
  });

  if (!sp) return errorJson('Олдсонгүй', 404);
  if (sp.product.userId !== user.id) return errorJson('Зөвшөөрөлгүй', 403);

  if (action === 'approve') {
    await prisma.sellerProduct.update({
      where: { id },
      data: { isApproved: true, approvedAt: new Date(), approvedById: user.id },
    });
    return json({ message: 'Зөвшөөрөгдлөө' });
  }

  if (action === 'reject') {
    await prisma.sellerProduct.delete({ where: { id } });
    return json({ message: 'Татгалзсан' });
  }

  return errorJson('action: approve | reject шаардлагатай', 400);
}
