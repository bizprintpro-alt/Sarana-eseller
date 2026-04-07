import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // In production, decode JWT to get userId
    // For now, fetch all seller profiles that have a matching user with a shop
    const shops = await prisma.shop.findMany({
      where: { isBlocked: false },
      select: {
        id: true,
        name: true,
        slug: true,
        userId: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    const stores = shops.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
    }))

    return NextResponse.json({ stores })
  } catch {
    return NextResponse.json({ stores: [] })
  }
}
