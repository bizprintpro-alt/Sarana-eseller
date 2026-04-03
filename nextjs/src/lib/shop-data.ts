// ══════════════════════════════════════════════════════════════
// eseller.mn — Shop data fetchers for public profile pages
// ══════════════════════════════════════════════════════════════

import { prisma } from './prisma';
import {
  DEMO_SERVICES, DEMO_BUSINESS_HOURS, DEMO_SERVICE_CATEGORIES,
  type Service, type BusinessHours, type ServiceCategory,
} from './types/service';

export interface ShopProfile {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  address: string | null;
  industry: string | null;
  description?: string;
}

export interface ShopPageData {
  shop: ShopProfile;
  services: Service[];
  hours: BusinessHours[];
  categories: ServiceCategory[];
}

export async function getShopBySlug(slug: string): Promise<ShopPageData | null> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { slug },
      include: {
        services: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
      },
    });

    if (shop) {
      return {
        shop: {
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          logo: shop.logo,
          phone: shop.phone,
          address: shop.address,
          industry: shop.industry,
        },
        services: shop.services.map((s) => ({
          _id: s.id,
          name: s.name,
          description: s.description || undefined,
          category: s.category || undefined,
          duration: s.duration || 60,
          price: s.price,
          emoji: undefined,
          images: s.images,
          isActive: s.isActive,
          maxBookingsPerSlot: 1,
          bufferTime: 10,
        })),
        hours: shop.workingHours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        })),
        categories: [],
      };
    }
  } catch {
    // DB not connected — fall through to demo
  }

  // Demo fallback
  if (slug === 'demo-salon' || slug === 'demo') {
    return {
      shop: {
        id: 'demo',
        name: 'Sarana Beauty Salon',
        slug: 'demo-salon',
        logo: null,
        phone: '9911-2233',
        address: 'Сүхбаатар дүүрэг, 1-р хороо, Энхтайваны өргөн чөлөө 5',
        industry: 'salon',
        description: 'Мэргэжлийн үсчин, гоо сайхан, маникюр, педикюр, арьс арчилгааны үйлчилгээ. 10+ жилийн туршлага.',
      },
      services: DEMO_SERVICES.filter((s) => s.isActive) as Service[],
      hours: DEMO_BUSINESS_HOURS,
      categories: DEMO_SERVICE_CATEGORIES,
    };
  }

  return null;
}

export async function getShopIdByDomain(domain: string): Promise<string | null> {
  try {
    const rec = await prisma.shopDomain.findUnique({
      where: { domain, verified: true },
      include: { shop: { select: { slug: true } } },
    });
    return rec?.shop.slug ?? null;
  } catch {
    return null;
  }
}
