import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Гадаад дэлгүүр API key-р нэвтэрч бараа илгээнэ
export async function POST(req: NextRequest) {
  const apiKey =
    req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')

  if (!apiKey) {
    return NextResponse.json({ error: 'API key шаардлагатай' }, { status: 401 })
  }

  const integration = await prisma.storeIntegration.findUnique({
    where: { apiKey },
    include: { shop: true },
  })

  if (!integration || !integration.isActive) {
    return NextResponse.json({ error: 'API key буруу' }, { status: 401 })
  }

  const body = await req.json()
  const products = Array.isArray(body) ? body : [body]

  const results = []
  for (const p of products.slice(0, 100)) {
    if (!p.name) {
      results.push({ error: 'name шаардлагатай' })
      continue
    }

    try {
      const product = await prisma.product.create({
        data: {
          name: p.name,
          description: p.description || '',
          price: Math.round(parseFloat(p.price) || 0),
          salePrice: p.salePrice ? Math.round(parseFloat(p.salePrice)) : null,
          images: p.images || (p.image ? [p.image] : []),
          stock: parseInt(p.stock) || 0,
          userId: integration.shop.userId,
          isActive: true,
        },
      })

      await prisma.importedUrl.create({
        data: {
          integrationId: integration.id,
          url: p.url || p.externalId || p.name,
          sourceType: p.source || 'api',
          productId: product.id,
          status: 'success',
          rawData: p as any,
        },
      })

      results.push({ id: product.id, name: product.name, status: 'success' })
    } catch (e: any) {
      results.push({ name: p.name, error: e.message })
    }
  }

  await prisma.storeIntegration.update({
    where: { id: integration.id },
    data: { totalImported: { increment: results.filter((r: any) => !r.error).length } },
  })

  return NextResponse.json({ results, total: results.length })
}
