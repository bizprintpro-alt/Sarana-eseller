import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ok, fail } from '@/lib/api-envelope';

const JWT_SECRET = process.env.JWT_SECRET || 'eseller-jwt-secret-key-change-in-production-2026';

export async function POST(req: NextRequest) {
  try {
    const { email, phone, password } = await req.json();

    if ((!email && !phone) || !password) {
      return fail('Имэйл/утас болон нууц үг оруулна уу', 400);
    }

    // Login by email OR phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email: email.toLowerCase() }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (!user) {
      return fail('Хэрэглэгч олдсонгүй', 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return fail('Имэйл эсвэл нууц үг буруу', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const res = ok({
      token,
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        store: user.store,
      },
    });

    // Mirror the token into an httpOnly cookie so Edge middleware can enforce
    // role-based access on /dashboard/* routes. Client code still reads the
    // token from localStorage for the Authorization header — the cookie is
    // middleware-only.
    res.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return res;
  } catch (e: unknown) {
    console.error('LOGIN ERROR:', (e as Error).message);
    return fail('Нэвтрэхэд алдаа гарлаа', 500);
  }
}
