import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/coupons/validate — validate coupon code
export async function POST(req: NextRequest) {
  try {
    const { code, cartAmount, shopId } = await req.json();
    if (!code) return NextResponse.json({ valid: false, error: 'Купон код оруулна уу' });

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon || !coupon.isActive) return NextResponse.json({ valid: false, error: 'Купон олдсонгүй' });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return NextResponse.json({ valid: false, error: 'Купон хугацаа дууссан' });
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return NextResponse.json({ valid: false, error: 'Купон дууссан' });
    if (coupon.startAt && new Date(coupon.startAt) > new Date()) return NextResponse.json({ valid: false, error: 'Купон эхлээгүй байна' });
    if (coupon.minOrderAmount && cartAmount < coupon.minOrderAmount) return NextResponse.json({ valid: false, error: `Хамгийн бага захиалга ${coupon.minOrderAmount.toLocaleString()}₮` });
    if (coupon.shopId && shopId && coupon.shopId !== shopId) return NextResponse.json({ valid: false, error: 'Энэ купон тухайн дэлгүүрт хамааралгүй' });

    const discount = coupon.discountType === 'PERCENT'
      ? Math.min(cartAmount * coupon.discountValue / 100, coupon.maxDiscount || Infinity)
      : Math.min(coupon.discountValue, cartAmount);

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount),
      finalAmount: Math.round(cartAmount - discount),
      coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, title: coupon.title },
    });
  } catch (e) {
    console.error('[coupons/validate]', e);
    return NextResponse.json({ valid: false, error: 'Серверийн алдаа' });
  }
}
