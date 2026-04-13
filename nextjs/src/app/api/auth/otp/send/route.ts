import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: 'Утасны дугаар оруулна уу' }, { status: 400 });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  // User байвал OTP хадгалах, байхгүй бол шинэ user үүсгэх
  await prisma.user.upsert({
    where: { email: `${phone}@otp.eseller.mn` },
    create: {
      phone,
      name: 'Хэрэглэгч',
      email: `${phone}@otp.eseller.mn`,
      password: '',
      otpCode: code,
      otpExpires: expires,
    },
    update: { otpCode: code, otpExpires: expires },
  });

  // TODO: SMS илгээх (Unitel/Mobicom API)
  console.log(`OTP [${phone}]: ${code}`);

  const isDev = process.env.NODE_ENV === 'development';

  return NextResponse.json({
    success: true,
    message: 'OTP илгээгдлээ',
    ...(isDev && { code }),
  });
}
