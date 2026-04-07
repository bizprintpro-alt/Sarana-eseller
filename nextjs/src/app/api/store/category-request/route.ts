import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const request = await prisma.categoryRequest.create({
    data: {
      name: body.name,
      parentId: body.parentId || null,
      parentName: body.parentName || null,
      reason: body.reason,
      requestedBy: body.requestedBy,
      shopName: body.shopName,
    },
  })

  return NextResponse.json(request, { status: 201 })
}

export async function GET() {
  const requests = await prisma.categoryRequest.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ requests })
}
