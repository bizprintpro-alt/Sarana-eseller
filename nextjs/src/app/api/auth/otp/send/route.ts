import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkBucket } from '@/lib/rate-limit';

function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const digits = raw.replace(/\D+/g, '');
  // Mongolian mobile numbers are 8 digits. Accept 8-12 digits to allow country code.
  if (digits.length < 8 || digits.length > 12) return null;
  return digits;
}

export async function POST(req: NextRequest) {
  const { phone: rawPhone } = await req.json().catch(() => ({}));
  const phone = normalizePhone(rawPhone);
  if (!phone) return NextResponse.json({ error: 'Утасны дугаар буруу байна' }, { status: 400 });

  // Per-phone cooldown: 1 OTP per 60 seconds
  const cooldown = checkBucket(`otp:send:phone:${phone}:cooldown`, 1, 60_000);
  if (cooldown.limited) {
    return NextResponse.json(
      { error: `Та ${cooldown.retryAfter} секундын дараа дахин оролдоно уу` },
      { status: 429, headers: { 'Retry-After': String(cooldown.retryAfter) } },
    );
  }
  // Per-phone hourly cap: 5 sends per hour
  const hourly = checkBucket(`otp:send:phone:${phone}:hour`, 5, 3600_000);
  if (hourly.limited) {
    return NextResponse.json(
      { error: 'Нэг цагт 5 удаа OTP авах боломжтой' },
      { status: 429, headers: { 'Retry-After': String(hourly.retryAfter) } },
    );
  }
  // Per-IP cap to blunt distributed abuse
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
  const ipBucket = checkBucket(`otp:send:ip:${ip}`, 20, 3600_000);
  if (ipBucket.limited) {
    return NextResponse.json(
      { error: 'Хэт олон хүсэлт. Түр хүлээнэ үү.' },
      { status: 429, headers: { 'Retry-After': String(ipBucket.retryAfter) } },
    );
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

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

  // Reset verify-attempt counter whenever a new code is issued
  (globalThis as any).__otpAttempts?.delete?.(phone);

  // TODO: SMS илгээх (Unitel/Mobicom API)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) console.log(`OTP [${phone}]: ${code}`);

  return NextResponse.json({
    success: true,
    message: 'OTP илгээгдлээ',
    ...(isDev && { code }),
  });
}
