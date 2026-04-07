import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // Return current seller profile + pending application
  try {
    const sellers = await prisma.sellerProfile.findMany({
      take: 1,
      orderBy: { createdAt: 'desc' },
      include: {
        influencerApps: {
          where: { status: 'PENDING' },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (sellers.length === 0) {
      return NextResponse.json({ sellerType: 'REGULAR' })
    }

    const seller = sellers[0]
    return NextResponse.json({
      sellerType: seller.sellerType,
      followers: seller.followers,
      influencerVerified: seller.influencerVerified,
      pendingApp: seller.influencerApps[0] || null,
    })
  } catch {
    return NextResponse.json({ sellerType: 'REGULAR' })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    // Find seller profile (simplified — in production, use auth token)
    const sellers = await prisma.sellerProfile.findMany({
      take: 1,
      orderBy: { createdAt: 'desc' },
    })

    if (sellers.length === 0) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const seller = sellers[0]

    // Check for existing pending application
    const existing = await prisma.influencerApplication.findFirst({
      where: { sellerId: seller.id, status: 'PENDING' },
    })

    if (existing) {
      return NextResponse.json({ error: 'pending' }, { status: 400 })
    }

    // Create application
    const app = await prisma.influencerApplication.create({
      data: {
        sellerId: seller.id,
        targetTier: body.targetTier || 'MICRO',
        instagram: body.instagram || null,
        tiktok: body.tiktok || null,
        facebook: body.facebook || null,
        youtube: body.youtube || null,
        followers: body.followers || 0,
        screenshot: body.screenshot || null,
        note: body.note || null,
      },
    })

    // Update seller's applied timestamp + social links
    await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: {
        influencerAppliedAt: new Date(),
        followers: body.followers || seller.followers,
        socialLinks: {
          instagram: body.instagram || undefined,
          tiktok: body.tiktok || undefined,
          facebook: body.facebook || undefined,
          youtube: body.youtube || undefined,
        },
      },
    })

    return NextResponse.json({ success: true, id: app.id }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
