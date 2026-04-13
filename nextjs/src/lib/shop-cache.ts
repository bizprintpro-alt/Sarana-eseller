/**
 * Shop Config Cache Layer — Upstash Redis
 * Edge-compatible. Falls back to direct DB on Redis failure.
 */

import { Redis } from '@upstash/redis';
import { prisma } from './prisma';

const redis = new Redis({
  url: process.env.UPSTASH_KV_REST_API_URL!,
  token: process.env.UPSTASH_KV_REST_API_TOKEN!,
});

const CACHE_TTL = 3600; // 1 цаг
const NULL_TTL = 300;   // 5 минут (олдохгүй бол)

export interface ShopConfig {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  plan: string;
  isActive: boolean;
  phone: string | null;
  address: string | null;
  ownerId: string;
}

/** Get shop config by subdomain slug — cached */
export async function getShopConfig(slug: string): Promise<ShopConfig | null> {
  const key = `shop:${slug}`;

  // 1. Redis cache
  try {
    const cached = await redis.get<ShopConfig>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch {
    // Redis unavailable — fall through to DB
  }

  // 2. DB lookup
  const enterprise = await prisma.enterpriseShop.findFirst({
    where: {
      OR: [{ subdomain: slug }, { shop: { slug } }],
      isActive: true,
    },
    include: {
      shop: {
        select: {
          id: true, name: true, slug: true, phone: true,
          address: true, userId: true, logo: true,
        },
      },
    },
  });

  if (!enterprise) {
    try { await redis.set(key, null, { ex: NULL_TTL }); } catch {}
    return null;
  }

  const config: ShopConfig = {
    id: enterprise.id,
    shopId: enterprise.shopId,
    name: enterprise.shop.name,
    slug: enterprise.subdomain,
    primaryColor: enterprise.primaryColor,
    accentColor: enterprise.accentColor,
    logoUrl: enterprise.logoUrl || enterprise.shop.logo,
    faviconUrl: enterprise.faviconUrl,
    plan: enterprise.plan,
    isActive: enterprise.isActive,
    phone: enterprise.shop.phone,
    address: enterprise.shop.address,
    ownerId: enterprise.shop.userId,
  };

  // 3. Cache
  try { await redis.set(key, config, { ex: CACHE_TTL }); } catch {}
  return config;
}

/** Get shop config by custom domain — cached */
export async function getShopByDomain(domain: string): Promise<ShopConfig | null> {
  const key = `domain:${domain}`;

  try {
    const cached = await redis.get<ShopConfig>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch {}

  const enterprise = await prisma.enterpriseShop.findFirst({
    where: { customDomain: domain, isActive: true },
    include: {
      shop: {
        select: {
          id: true, name: true, slug: true, phone: true,
          address: true, userId: true, logo: true,
        },
      },
    },
  });

  if (!enterprise) {
    try { await redis.set(key, null, { ex: NULL_TTL }); } catch {}
    return null;
  }

  const config: ShopConfig = {
    id: enterprise.id,
    shopId: enterprise.shopId,
    name: enterprise.shop.name,
    slug: enterprise.subdomain,
    primaryColor: enterprise.primaryColor,
    accentColor: enterprise.accentColor,
    logoUrl: enterprise.logoUrl || enterprise.shop.logo,
    faviconUrl: enterprise.faviconUrl,
    plan: enterprise.plan,
    isActive: enterprise.isActive,
    phone: enterprise.shop.phone,
    address: enterprise.shop.address,
    ownerId: enterprise.shop.userId,
  };

  try { await redis.set(key, config, { ex: CACHE_TTL }); } catch {}
  return config;
}

/** Invalidate cache when shop config changes */
export async function invalidateShopCache(slug: string): Promise<void> {
  try { await redis.del(`shop:${slug}`); } catch {}
}

export async function invalidateDomainCache(domain: string): Promise<void> {
  try { await redis.del(`domain:${domain}`); } catch {}
}
