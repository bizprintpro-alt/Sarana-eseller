/**
 * НӨАТ хяналт — жилийн борлуулалтын босго шалгах
 */

import { prisma } from '@/lib/prisma'
import { SYSTEM_RULES } from '@/lib/rules/systemRules'

export async function checkVatThreshold(entityId: string, entityType: string) {
  const yearStart = new Date(new Date().getFullYear(), 0, 1)

  const result = await prisma.order.aggregate({
    where: {
      shopId: entityId,
      status: 'confirmed',
      createdAt: { gte: yearStart },
    },
    _sum: { total: true },
  })

  const annual = result._sum.total || 0

  if (annual >= SYSTEM_RULES.VAT.REGISTRATION_THRESHOLD) {
    return {
      status: 'exceeded' as const,
      annual,
      threshold: SYSTEM_RULES.VAT.REGISTRATION_THRESHOLD,
      entityId,
      entityType,
    }
  }

  if (annual >= SYSTEM_RULES.VAT.WARNING_THRESHOLD) {
    return {
      status: 'warning' as const,
      annual,
      threshold: SYSTEM_RULES.VAT.WARNING_THRESHOLD,
      entityId,
      entityType,
    }
  }

  return {
    status: 'ok' as const,
    annual,
    entityId,
    entityType,
  }
}

export async function getVatMonitorData() {
  const shops = await prisma.shop.findMany({
    where: { isBlocked: false },
    select: {
      id: true,
      name: true,
      industry: true,
    },
  })

  const yearStart = new Date(new Date().getFullYear(), 0, 1)

  const results = await Promise.all(
    shops.map(async (shop) => {
      const agg = await prisma.order.aggregate({
        where: {
          shopId: shop.id,
          status: 'confirmed',
          createdAt: { gte: yearStart },
        },
        _sum: { total: true },
      })
      const annual = agg._sum.total || 0
      let vatStatus: 'ok' | 'warning' | 'exceeded' = 'ok'
      if (annual >= SYSTEM_RULES.VAT.REGISTRATION_THRESHOLD) vatStatus = 'exceeded'
      else if (annual >= SYSTEM_RULES.VAT.WARNING_THRESHOLD) vatStatus = 'warning'

      return {
        shopId: shop.id,
        shopName: shop.name,
        shopType: shop.industry,
        annualSales: annual,
        vatStatus,
        progress: Math.min(100, Math.round((annual / SYSTEM_RULES.VAT.REGISTRATION_THRESHOLD) * 100)),
      }
    })
  )

  return results.sort((a, b) => b.annualSales - a.annualSales)
}
