import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const existing = await prisma.sellerProduct.findFirst({
    where: {
      productId: body.productId,
      sellerProfileId: body.sellerStoreId,
    },
  })

  if (existing) {
    return NextResponse.json({ error: 'Already requested' }, { status: 409 })
  }

  const sellerProduct = await prisma.sellerProduct.create({
    data: {
      productId: body.productId,
      sellerProfileId: body.sellerStoreId,
      isApproved: false,
    },
  })

  return NextResponse.json(sellerProduct, { status: 201 })
}
