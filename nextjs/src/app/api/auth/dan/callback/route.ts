import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exchangeCode, getUserInfo } from '@/lib/dan';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const error = request.nextUrl.searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=dan_${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=dan_no_code', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCode(code);

    // Get user info from ДАН
    const danUser = await getUserInfo(tokens.access_token);

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: danUser.phone },
          ...(danUser.email ? [{ email: danUser.email }] : []),
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `${danUser.last_name} ${danUser.first_name}`,
          phone: danUser.phone,
          email: danUser.email || undefined,
          provider: 'dan',
          providerId: danUser.register_number,
        } as any,
      });
    }

    // In production, create a session/JWT here
    // For now, redirect with userId
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('userId', user.id);

    const response = NextResponse.redirect(dashboardUrl);

    // Set a basic auth cookie (replace with proper JWT in production)
    response.cookies.set('dan_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('ДАН callback алдаа:', error);
    return NextResponse.redirect(
      new URL('/login?error=dan_failed', request.url)
    );
  }
}
