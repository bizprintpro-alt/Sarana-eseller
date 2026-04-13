import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();
  if (!phone || !code) return NextResponse.json({ error: 'Утас, OTP оруулна уу' }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: { OR: [{ phone }, { email: `${phone}@otp.eseller.mn` }] },
  });

  if (!user) return NextResponse.json({ error: 'Хэрэглэгч олдсонгүй' }, { status: 404 });

  if (user.otpCode !== code) return NextResponse.json({ error: 'OTP буруу байна' }, { status: 400 });

  if (user.otpExpires && new Date() > user.otpExpires) {
    return NextResponse.json({ error: 'OTP хугацаа дууссан' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: null, otpExpires: null },
  });

  const token = signToken({ id: user.id, role: user.role });

  return NextResponse.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
}
