import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) return NextResponse.json({ error: 'Token болон нууц үг шаардлагатай' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Нууц үг хамгийн бага 6 тэмдэгт' }, { status: 400 });

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken) return NextResponse.json({ error: 'Буруу эсвэл хүчингүй линк' }, { status: 400 });
    if (resetToken.usedAt) return NextResponse.json({ error: 'Энэ линк аль хэдийн ашиглагдсан' }, { status: 400 });
    if (new Date() > resetToken.expiresAt) return NextResponse.json({ error: 'Линкийн хугацаа дууссан' }, { status: 400 });

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

    return NextResponse.json({ message: 'Нууц үг амжилттай шинэчлэгдлээ!' });
  } catch {
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
