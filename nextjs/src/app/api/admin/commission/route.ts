import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

const COMMISSION_KEYS = [
  'commission_rate', 'affiliate_rate',
  'seller_free_commission', 'seller_standard_commission',
  'seller_ultimate_commission', 'seller_ai_pro_commission',
];

export async function GET(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const configs = await prisma.platformConfig.findMany({ where: { key: { in: COMMISSION_KEYS } } });
    const get = (key: string, def: string) => configs.find(c => c.key === key)?.value || def;
    return NextResponse.json({
      platformRate: parseFloat(get('commission_rate', '5')),
      affiliateRate: parseFloat(get('affiliate_rate', '10')),
      planRates: {
        free: parseFloat(get('seller_free_commission', '5')),
        standard: parseFloat(get('seller_standard_commission', '4')),
        ultimate: parseFloat(get('seller_ultimate_commission', '3')),
        ai_pro: parseFloat(get('seller_ai_pro_commission', '2')),
      },
    });
  } catch (error) {
    console.error('[commission]:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const body = await req.json();
    const updates: Array<{ key: string; value: string }> = [];
    if (body.platformRate !== undefined) updates.push({ key: 'commission_rate', value: String(body.platformRate) });
    if (body.affiliateRate !== undefined) updates.push({ key: 'affiliate_rate', value: String(body.affiliateRate) });
    if (body.planRates) {
      if (body.planRates.free !== undefined) updates.push({ key: 'seller_free_commission', value: String(body.planRates.free) });
      if (body.planRates.standard !== undefined) updates.push({ key: 'seller_standard_commission', value: String(body.planRates.standard) });
      if (body.planRates.ultimate !== undefined) updates.push({ key: 'seller_ultimate_commission', value: String(body.planRates.ultimate) });
      if (body.planRates.ai_pro !== undefined) updates.push({ key: 'seller_ai_pro_commission', value: String(body.planRates.ai_pro) });
    }
    for (const u of updates) {
      await prisma.platformConfig.upsert({ where: { key: u.key }, update: { value: u.value }, create: { key: u.key, value: u.value, updatedAt: new Date() } });
    }
    await prisma.adminLog.create({ data: { adminId: admin.id, action: 'commission.update', after: body } });
    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error('[commission]:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
