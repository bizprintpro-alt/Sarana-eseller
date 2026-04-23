import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireAuth } from '@/lib/api-auth';

// POST /api/entities/register
// Auto-upsert (update if exists) for the given entity type per user —
// prevents P2002 on Shop.userId @unique when seller auto-Shop already exists.
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const body = await req.json();
  const { entityType, name, slug, phone, email, description, regNumber, licenseNumber, address, district, website, socialFb } = body;

  if (!entityType || !name || !slug) return errorJson('entityType, name, slug шаардлагатай');

  try {
    // Slug uniqueness check (excluding current user's own entity)
    const slugExistsInShops = await prisma.shop.findFirst({
      where: { slug, NOT: { userId: auth.id } },
      select: { id: true },
    });
    if (slugExistsInShops) return errorJson('Энэ slug аль хэдийн өөр хэрэглэгчид бүртгэлтэй');

    let entity;

    switch (entityType) {
      case 'store':
      case 'order_store':
      case 'digital':
      case 'pre_order': {
        // All use Shop model — upsert by userId (one shop per user)
        const industryMap: Record<string, string> = {
          store: 'general',
          order_store: 'order',
          digital: 'digital',
          pre_order: 'preorder',
        };
        entity = await prisma.shop.upsert({
          where: { userId: auth.id },
          create: {
            userId: auth.id, name, slug, phone, address, district,
            industry: industryMap[entityType] || 'general',
            locationStatus: 'pending',
          },
          update: {
            name, slug, phone: phone || undefined, address: address || undefined,
            district: district || undefined, industry: industryMap[entityType] || 'general',
          },
        });
        break;
      }
      case 'agent':
      case 'real_estate': {
        // Upsert agent by userId
        const existing = await prisma.agent.findFirst({ where: { userId: auth.id } });
        entity = existing
          ? await prisma.agent.update({
              where: { id: existing.id },
              data: { name, slug, phone, address, district, bio: description, licenseNumber },
            })
          : await prisma.agent.create({
              data: { userId: auth.id, name, slug, phone, address, district, bio: description, licenseNumber, isVerified: false },
            });
        break;
      }
      case 'company':
      case 'construction': {
        const existing = await prisma.company.findFirst({ where: { userId: auth.id } });
        entity = existing
          ? await prisma.company.update({
              where: { id: existing.id },
              data: { name, slug, phone, address, district, description, licenseNumber: regNumber },
            })
          : await prisma.company.create({
              data: { userId: auth.id, name, slug, phone, address, district, description, licenseNumber: regNumber, isVerified: false },
            });
        break;
      }
      case 'auto_dealer': {
        const existing = await prisma.autoDealer.findFirst({ where: { userId: auth.id } });
        entity = existing
          ? await prisma.autoDealer.update({
              where: { id: existing.id },
              data: { name, slug, phone, address, district, description },
            })
          : await prisma.autoDealer.create({
              data: { userId: auth.id, name, slug, phone, address, district, description, isVerified: false },
            });
        break;
      }
      case 'service': {
        const existing = await prisma.serviceProvider.findFirst({ where: { userId: auth.id } });
        entity = existing
          ? await prisma.serviceProvider.update({
              where: { id: existing.id },
              data: { name, slug, phone, address, district, description },
            })
          : await prisma.serviceProvider.create({
              data: { userId: auth.id, name, slug, phone, address, district, description, isVerified: false },
            });
        break;
      }
      default:
        return errorJson('Буруу entityType: ' + entityType);
    }

    // Update user role + entityType
    await prisma.user.update({
      where: { id: auth.id },
      data: { role: 'seller', entityType },
    });

    // Create/update SellerProfile for affiliate commission system
    const username = slug || `seller-${auth.id.slice(-8)}`;
    await prisma.sellerProfile.upsert({
      where: { userId: auth.id },
      create: {
        userId: auth.id,
        username,
        displayName: name,
        commissionRate: 10,
      },
      update: { displayName: name },
    });

    return json({ entity, message: 'Амжилттай бүртгэгдлээ' }, 201);
  } catch (err: any) {
    if (err.code === 'P2002') {
      const target = err.meta?.target || 'field';
      return errorJson(`Давхардсан утга: ${target}. Өөр нэр/slug ашиглана уу`);
    }
    console.error('Entity register error:', err);
    return errorJson('Бүртгэл амжилтгүй: ' + (err.message || 'Unknown error'));
  }
}
