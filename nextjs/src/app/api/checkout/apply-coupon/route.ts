import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json();

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Купон код олдсонгүй' }, { status: 404 });
    }
    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Купон идэвхгүй байна' }, { status: 400 });
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Купон дууссан' }, { status: 400 });
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ error: 'Купон хугацаа дууссан' }, { status: 400 });
    }
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return NextResponse.json({
        error: `Захиалгын доод хэмжээ ${coupon.minOrderAmount.toLocaleString()}₮`,
      }, { status: 400 });
    }

    // Хямдрал тооцоолох
    let discount = coupon.discountType === 'PERCENT'
      ? cartTotal * (coupon.discountValue / 100)
      : coupon.discountValue;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount),
      code: coupon.code,
      message: `${coupon.title || 'Купон'}: ${
        coupon.discountType === 'PERCENT'
          ? coupon.discountValue + '%'
          : coupon.discountValue.toLocaleString() + '₮'
      } хямдарлаа!`,
    });
  } catch {
    return NextResponse.json({ error: 'Купон шалгахад алдаа гарлаа' }, { status: 500 });
  }
}
