import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json();

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { promotion: true },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Купон код олдсонгүй' }, { status: 404 });
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Купон дууссан' }, { status: 400 });
    }
    if (new Date() > coupon.expiresAt) {
      return NextResponse.json({ error: 'Купон хугацаа дууссан' }, { status: 400 });
    }

    const promo = coupon.promotion;
    if (!promo.isActive || new Date() > promo.endAt) {
      return NextResponse.json({ error: 'Хямдрал дууссан' }, { status: 400 });
    }
    if (promo.minOrderAmount && cartTotal < promo.minOrderAmount) {
      return NextResponse.json({
        error: `Захиалгын доод хэмжээ ${promo.minOrderAmount.toLocaleString()}₮`,
      }, { status: 400 });
    }

    let discount = promo.discountType === 'PERCENTAGE'
      ? cartTotal * (promo.discountValue / 100)
      : promo.discountValue;

    if (promo.maxDiscountAmount) {
      discount = Math.min(discount, promo.maxDiscountAmount);
    }

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount),
      code: coupon.code,
      message: `${promo.title}: ${promo.discountType === 'PERCENTAGE' ? promo.discountValue + '%' : promo.discountValue.toLocaleString() + '₮'} хямдарлаа!`,
    });
  } catch {
    return NextResponse.json({ error: 'Купон шалгахад алдаа гарлаа' }, { status: 500 });
  }
}
