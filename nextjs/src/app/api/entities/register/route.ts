import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireAuth } from '@/lib/api-auth';

// POST /api/entities/register
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const body = await req.json();
  const { entityType, name, slug, phone, email, description, regNumber, licenseNumber, address, district, website, socialFb } = body;

  if (!entityType || !name || !slug) return errorJson('entityType, name, slug шаардлагатай');

  try {
    let entity;

    switch (entityType) {
      case 'store':
        entity = await prisma.shop.create({
          data: { userId: auth.id, name, slug, phone, address, district, industry: 'general', locationStatus: 'pending' },
        });
        break;
      case 'agent':
        entity = await prisma.agent.create({
          data: { userId: auth.id, name, slug, phone, address, district, bio: description, licenseNumber, isVerified: false },
        });
        break;
      case 'company':
        entity = await prisma.company.create({
          data: { userId: auth.id, name, slug, phone, address, district, description, licenseNumber: regNumber, isVerified: false },
        });
        break;
      case 'auto_dealer':
        entity = await prisma.autoDealer.create({
          data: { userId: auth.id, name, slug, phone, address, district, description, isVerified: false },
        });
        break;
      case 'service':
        entity = await prisma.serviceProvider.create({
          data: { userId: auth.id, name, slug, phone, address, district, description, isVerified: false },
        });
        break;
      case 'pre_order':
      case 'digital':
        entity = await prisma.shop.create({
          data: { userId: auth.id, name, slug, phone, address, district, industry: entityType, locationStatus: 'pending' },
        });
        break;
      default:
        return errorJson('Буруу entityType');
    }

    // Update user role + entityType
    await prisma.user.update({
      where: { id: auth.id },
      data: { role: ['store', 'pre_order', 'digital'].includes(entityType) ? 'seller' : entityType, entityType },
    });

    // Create SellerProfile for affiliate commission system
    const username = slug || `seller-${auth.id.slice(-8)}`;
    await prisma.sellerProfile.upsert({
      where: { userId: auth.id },
      create: {
        userId: auth.id,
        username,
        displayName: name,
        commissionRate: 10, // default 10%
      },
      update: { displayName: name },
    });

    return json({ entity, message: 'Амжилттай бүртгэгдлээ' }, 201);
  } catch (err: any) {
    if (err.code === 'P2002') return errorJson('Энэ slug аль хэдийн бүртгэлтэй');
    return errorJson('Бүртгэл амжилтгүй: ' + (err.message || 'Unknown error'));
  }
}
