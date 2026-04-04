import { prisma } from '@/lib/prisma';

export type EntityType = 'agent' | 'company' | 'auto_dealer' | 'service';

// Entity profile-г slug-аар DB-с авах
export async function getEntityBySlug(entityType: EntityType, slug: string) {
  try {
    switch (entityType) {
      case 'agent':
        return await prisma.agent.findUnique({ where: { slug } });
      case 'company':
        return await prisma.company.findUnique({ where: { slug } });
      case 'auto_dealer':
        return await prisma.autoDealer.findUnique({ where: { slug } });
      case 'service':
        return await prisma.serviceProvider.findUnique({ where: { slug } });
      default:
        return null;
    }
  } catch {
    return null;
  }
}

// Entity-д холбоотой FeedItem-ууд авах
export async function getEntityFeedItems(entityType: EntityType, entityId: string) {
  try {
    const where: Record<string, unknown> = {
      entityType,
      status: 'active',
    };

    // Entity type-д тохирсон relation field
    switch (entityType) {
      case 'agent': where.agentId = entityId; break;
      case 'company': where.companyId = entityId; break;
      case 'auto_dealer': where.autoDealerId = entityId; break;
      case 'service': where.serviceProviderId = entityId; break;
    }

    return await prisma.feedItem.findMany({
      where,
      orderBy: [{ tier: 'asc' }, { createdAt: 'desc' }],
      take: 30,
    });
  } catch {
    return [];
  }
}
