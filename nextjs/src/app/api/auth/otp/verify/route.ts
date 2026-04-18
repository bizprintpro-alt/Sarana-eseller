import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/api-auth';
import { checkBucket, resetBucket } from '@/lib/rate-limit';

const MAX_ATTEMPTS = 5;

function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const digits = raw.replace(/\D+/g, '');
  if (digits.length < 8 || digits.length > 12) return null;
  return digits;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const phone = normalizePhone(body.phone);
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  if (!phone || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Утас, OTP оруулна уу' }, { status: 400 });
  }

  // Per-phone verify attempt cap — prevents 1M-code brute-force
  const attemptKey = `otp:verify:phone:${phone}`;
  const bucket = checkBucket(attemptKey, MAX_ATTEMPTS, 10 * 60_000);
  if (bucket.limited) {
    return NextResponse.json(
      { error: 'Хэт олон буруу оролдлого. Шинэ OTP аваад дахин оролдоно уу.' },
      { status: 429, headers: { 'Retry-After': String(bucket.retryAfter) } },
    );
  }
  // Per-IP cap to blunt distributed brute-force
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
  const ipBucket = checkBucket(`otp:verify:ip:${ip}`, 30, 10 * 60_000);
  if (ipBucket.limited) {
    return NextResponse.json(
      { error: 'Хэт олон хүсэлт. Түр хүлээнэ үү.' },
      { status: 429, headers: { 'Retry-After': String(ipBucket.retryAfter) } },
    );
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ phone }, { email: `${phone}@otp.eseller.mn` }] },
  });

  if (!user) return NextResponse.json({ error: 'Хэрэглэгч олдсонгүй' }, { status: 404 });

  // Expired OTP is treated same as wrong — don't leak info
  const expired = user.otpExpires && new Date() > user.otpExpires;
  if (!user.otpCode || expired || user.otpCode !== code) {
    // On attempt cap reached, invalidate the OTP so attacker must request new one
    if (bucket.count >= MAX_ATTEMPTS) {
      await prisma.user.update({ where: { id: user.id }, data: { otpCode: null, otpExpires: null } });
    }
    return NextResponse.json({ error: 'OTP буруу эсвэл хугацаа дууссан' }, { status: 400 });
  }

  // Single-use — clear immediately so a replayed request fails
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: null, otpExpires: null },
  });

  resetBucket(attemptKey);

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
