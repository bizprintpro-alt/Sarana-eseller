import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'eseller-jwt-secret-key-change-in-production-2026';

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Бүх талбарыг бөглөнө үү' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Энэ имэйл бүртгэлтэй байна' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || undefined,
        password: hashed,
        role: 'buyer',
        username,
      },
    });

    const token = jwt.sign(
      { id: user.id, userId: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' },
    );

    return NextResponse.json({
      token,
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Бүртгэл үүсгэхэд алдаа гарлаа' }, { status: 500 });
  }
}
