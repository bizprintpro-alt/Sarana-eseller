import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller, getShopForUser, errorJson, json } from '@/lib/api-auth';

// Restrict digital product files to trusted CDN hosts — prevents SSRF-like
// redirects and phishing payloads being attached to paid downloads.
const ALLOWED_HOSTS = /^(?:[\w-]+\.)?(?:public\.blob\.vercel-storage\.com|res\.cloudinary\.com)$/i;
const ALLOWED_TYPES = new Set(['pdf', 'zip', 'mp4', 'mp3', 'xlsx', 'xls', 'docx', 'doc', 'png', 'jpg', 'jpeg']);
const MAX_FILE_BYTES = 200 * 1024 * 1024; // 200MB cap on declared size

// POST /api/digital/upload — create a digital product record
export async function POST(req: NextRequest) {
  const user = requireSeller(req);
  if (user instanceof NextResponse) return user;

  try {
    const shopId = await getShopForUser(user.id);
    if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

    const body = await req.json();
    const { productId, fileUrl, fileType, fileSize, maxDownloads } = body;

    if (!productId || !fileUrl || !fileType) {
      return errorJson('productId, fileUrl, fileType шаардлагатай', 400);
    }
    // Validate fileUrl host — only allow uploads stored in our CDNs
    let parsed: URL;
    try { parsed = new URL(fileUrl); } catch { return errorJson('fileUrl буруу байна', 400); }
    if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.test(parsed.hostname)) {
      return errorJson('Зөвхөн зөвшөөрөгдсөн CDN-ийн файл оруулах боломжтой', 400);
    }
    if (!ALLOWED_TYPES.has(String(fileType).toLowerCase())) {
      return errorJson('Дэмжигдээгүй файлын төрөл', 400);
    }
    const declaredSize = Number(fileSize ?? 0);
    if (!Number.isFinite(declaredSize) || declaredSize < 0 || declaredSize > MAX_FILE_BYTES) {
      return errorJson('Файлын хэмжээ буруу байна', 400);
    }
    const dl = Number(maxDownloads ?? 5);
    if (!Number.isFinite(dl) || dl < 1 || dl > 100) {
      return errorJson('maxDownloads 1-100 байх ёстой', 400);
    }

    // Verify product belongs to this seller
    const product = await prisma.product.findFirst({
      where: { id: productId, userId: user.id },
    });

    if (!product) {
      return errorJson('Бүтээгдэхүүн олдсонгүй', 404);
    }

    // Check if digital product already exists for this product
    const existing = await prisma.digitalProduct.findUnique({
      where: { productId },
    });

    if (existing) {
      // Update existing record
      const updated = await prisma.digitalProduct.update({
        where: { productId },
        data: {
          fileUrl,
          fileType,
          fileSize: declaredSize,
          maxDownloads: dl,
        },
      });
      return json(updated);
    }

    // Create new digital product record
    const digital = await prisma.digitalProduct.create({
      data: {
        productId,
        fileUrl,
        fileType,
        fileSize: declaredSize,
        maxDownloads: dl,
      },
    });

    // Mark product as DIGITAL entityType
    await prisma.product.update({
      where: { id: productId },
      data: { entityType: 'DIGITAL' },
    });

    return json(digital, 201);
  } catch (e: unknown) {
    console.error('[digital/upload POST]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}

// GET /api/digital/upload — list seller's digital products
export async function GET(req: NextRequest) {
  const user = requireSeller(req);
  if (user instanceof NextResponse) return user;

  try {
    const products = await prisma.product.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, price: true, images: true, emoji: true },
      orderBy: { name: 'asc' },
    });

    const digitalProducts = await prisma.digitalProduct.findMany({
      where: {
        productId: { in: products.map((p) => p.id) },
      },
      include: {
        product: { select: { id: true, name: true, price: true, emoji: true, images: true } },
        downloads: { select: { id: true } },
      },
    });

    const digitalsWithCount = digitalProducts.map((dp) => {
      const { downloads, ...rest } = dp;
      return { ...rest, totalDownloads: downloads.length };
    });

    return json({ products, digitalProducts: digitalsWithCount });
  } catch (e: unknown) {
    console.error('[digital/upload GET]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}
