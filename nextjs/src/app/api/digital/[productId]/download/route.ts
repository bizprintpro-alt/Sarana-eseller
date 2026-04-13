import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, errorJson, json } from '@/lib/api-auth';

// GET /api/digital/[productId]/download — download a digital product
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ productId: string }> }
) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { productId } = await ctx.params;

  try {
    // 1. Find the digital product
    const digital = await prisma.digitalProduct.findUnique({
      where: { productId },
      include: { product: { select: { name: true } } },
    });

    if (!digital) {
      return errorJson('Дижитал бараа олдсонгүй', 404);
    }

    // 2. Verify user has purchased this product (order with status delivered or confirmed)
    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: { in: ['delivered', 'confirmed'] },
      },
    });

    // Check if the order contains this productId in its items (items is Json[])
    const items = (order?.items || []) as Record<string, unknown>[];
    const hasPurchased = items.some((item) =>
      item.productId === productId || item.product === productId || item.id === productId
    );

    if (!order || !hasPurchased) {
      return errorJson('Та энэ бүтээгдэхүүнийг худалдаж аваагүй байна', 403);
    }

    // 3. Find or create download record
    let download = await prisma.digitalDownload.findFirst({
      where: {
        digitalProductId: digital.id,
        userId: user.id,
      },
    });

    if (download) {
      // Check download limit
      if (download.downloadCount >= digital.maxDownloads) {
        return errorJson(
          `Татах хязгаар хэтэрсэн (${digital.maxDownloads} удаа)`,
          403
        );
      }

      // Increment download count
      download = await prisma.digitalDownload.update({
        where: { id: download.id },
        data: {
          downloadCount: { increment: 1 },
          downloadedAt: new Date(),
        },
      });
    } else {
      // Create new download record
      download = await prisma.digitalDownload.create({
        data: {
          digitalProductId: digital.id,
          userId: user.id,
          orderId: order.id,
          downloadCount: 1,
          downloadedAt: new Date(),
        },
      });
    }

    return json({
      url: digital.fileUrl,
      downloadsRemaining: digital.maxDownloads - download.downloadCount,
      fileName: digital.product.name,
      fileType: digital.fileType,
      fileSize: digital.fileSize,
    });
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}
