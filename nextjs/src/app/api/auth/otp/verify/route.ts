import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/api-auth';
import { ok, fail } from '@/lib/api-envelope';

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();
  if (!phone || !code) return fail('Утас, OTP оруулна уу', 400);

  const user = await prisma.user.findFirst({
    where: { OR: [{ phone }, { email: `${phone}@otp.eseller.mn` }] },
  });

  if (!user) return fail('Хэрэглэгч олдсонгүй', 404);

  if (user.otpCode !== code) return fail('OTP буруу байна', 400);

  if (user.otpExpires && new Date() > user.otpExpires) {
    return fail('OTP хугацаа дууссан', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: null, otpExpires: null },
  });

  const token = signToken({ id: user.id, role: user.role });

  return ok({
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
