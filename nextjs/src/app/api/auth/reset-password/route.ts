import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ok, fail } from '@/lib/api-envelope';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) return fail('Token болон нууц үг шаардлагатай', 400);
    if (password.length < 6) return fail('Нууц үг хамгийн бага 6 тэмдэгт', 400);

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken) return fail('Буруу эсвэл хүчингүй линк', 400);
    if (resetToken.usedAt) return fail('Энэ линк аль хэдийн ашиглагдсан', 400);
    if (new Date() > resetToken.expiresAt) return fail('Линкийн хугацаа дууссан', 400);

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    return ok({ message: 'Нууц үг амжилттай шинэчлэгдлээ!' });
  } catch {
    return fail('Алдаа гарлаа', 500);
  }
}
