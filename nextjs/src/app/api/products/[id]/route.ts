import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/[id] — product detail for mobile/web
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            shop: { select: { id: true, name: true, slug: true, logo: true } },
          },
        },
        // DropshipProduct is 1:1 via productId. When present the mobile +
        // web UIs render "imported from abroad" badges and longer ETAs.
        dropship: {
          select: {
            supplierName: true,
            supplierCurrency: true,
            supplierStock: true,
            supplierShipping: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Бараа олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      description: product.description,
      images: product.images,
      stock: product.stock,
      category: product.category,
      emoji: product.emoji,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isActive: product.isActive,
      shop: product.user?.shop || null,
      seller: product.user ? { id: product.user.id, name: product.user.name, avatar: product.user.avatar } : null,
      // Null for non-dropship products; populated flat object otherwise so
      // clients can `if (product.dropship) {...}` without a null check on
      // each field.
      dropship: product.dropship
        ? {
            supplierName: product.dropship.supplierName,
            supplierCurrency: product.dropship.supplierCurrency,
            supplierStock: product.dropship.supplierStock,
            supplierShipping: product.dropship.supplierShipping,
            // Standard AliExpress/CJ international air-freight window.
            // Stored per-product in `supplierData` for now; hardcoding here
            // until the import pipeline captures per-supplier estimates.
            estimatedShippingDaysMin: 15,
            estimatedShippingDaysMax: 30,
          }
        : null,
    });
  } catch (err) {
    console.error('Product detail error:', err);
    return NextResponse.json({ error: 'Бараа ачаалахад алдаа' }, { status: 500 });
  }
}
