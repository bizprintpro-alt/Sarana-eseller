import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireSeller } from '@/lib/api-auth';
import dns from 'dns/promises';

type Ctx = { params: Promise<{ shopId: string }> };

// POST /api/shop/[shopId]/domain/verify — verify domain DNS
export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  const { shopId } = await ctx.params;

  const shop = await prisma.shop.findFirst({ where: { id: shopId, userId: auth.id } });
  if (!shop) return errorJson('Дэлгүүр олдсонгүй эсвэл эрх хүрэхгүй', 403);

  const domainRecord = await prisma.shopDomain.findUnique({ where: { shopId } });
  if (!domainRecord) return errorJson('Домайн бүртгэлгүй байна', 404);

  if (domainRecord.verified) {
    return json({ verified: true, domain: domainRecord.domain, message: 'Аль хэдийн баталгаажсан' });
  }

  // Verify by checking CNAME or A record
  try {
    const records: string[] = await dns.resolveCname(domainRecord.domain).catch(() => [] as string[]);
    const aRecords: string[] = await dns.resolve4(domainRecord.domain).catch(() => [] as string[]);

    const expectedIp = process.env.VERCEL_IP || '76.76.21.21';

    const cnameMatch = records.some((r) => r.toLowerCase().includes('eseller') || r.toLowerCase().includes('vercel'));
    const aMatch = aRecords.includes(expectedIp);

    if (cnameMatch || aMatch) {
      await prisma.shopDomain.update({
        where: { shopId },
        data: { verified: true },
      });

      return json({
        verified: true,
        domain: domainRecord.domain,
        message: 'Домайн амжилттай баталгаажлаа!',
      });
    }

    return json({
      verified: false,
      domain: domainRecord.domain,
      message: `DNS бүртгэл олдсонгүй. CNAME: ${domainRecord.domain} → cname.eseller.mn тохируулна уу.`,
      instructions: {
        type: 'CNAME',
        name: domainRecord.domain,
        value: 'cname.eseller.mn',
      },
    });
  } catch {
    return json({
      verified: false,
      domain: domainRecord.domain,
      message: 'DNS шалгахад алдаа гарлаа. Домайн нэрээ дахин шалгана уу.',
    });
  }
}
