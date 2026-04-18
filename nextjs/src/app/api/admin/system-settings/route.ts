import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminDB } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  const auth = await requireAdminDB(req);
  if (auth instanceof NextResponse) return auth;

  let settings = await prisma.systemSettings.findFirst({
    where: { key: 'main' },
  })

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: { key: 'main' },
    })
  }

  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminDB(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json()

  const settings = await prisma.systemSettings.upsert({
    where: { key: 'main' },
    update: {
      platformFee: body.platformFee,
      storeMinCommission: body.storeMinCommission,
      storeMaxCommission: body.storeMaxCommission,
      listingMinCommission: body.listingMinCommission,
      listingMaxCommission: body.listingMaxCommission,
      partnerPlatformFee: body.partnerPlatformFee,
      partnerAgentMin: body.partnerAgentMin,
      partnerAgentMax: body.partnerAgentMax,
      vatThreshold: body.vatThreshold,
      vatWarningThreshold: body.vatWarningThreshold,
      vatRate: body.vatRate,
      cityTaxRate: body.cityTaxRate,
      incomeTaxRate: body.incomeTaxRate,
    },
    create: {
      key: 'main',
      ...body,
    },
  })

  return NextResponse.json(settings)
}
