import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET || 'eseller-jwt-secret-key-change-in-production-2026';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://eseller.mn';

    if (error) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_denied`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
    }

    // Verify state (format: "nonce:role")
    const storedState = req.cookies.get('google_oauth_state')?.value;
    const [nonce, selectedRole] = (state || '').split(':');
    if (!nonce || nonce !== storedState) {
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_state`);
    }

    const VALID_ROLES = ['seller', 'affiliate', 'buyer', 'delivery'];
    const role = selectedRole && VALID_ROLES.includes(selectedRole) ? selectedRole : 'buyer';

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=token_failed`);
    }

    const tokens = await tokenRes.json();

    // Get user info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=userinfo_failed`);
    }

    const googleUser = await userInfoRes.json();
    const { email, name, picture } = googleUser;

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_email`);
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user with random password (won't be used for OAuth login)
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: hashedPassword,
          role,
          avatar: picture || null,
          username: email.split('@')[0],
        },
      });
    }

    // Issue JWT (same as login route)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' },
    );

    const userData = {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    // Redirect to login page with token in hash (client-side picks it up)
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.hash = `google_auth=${encodeURIComponent(JSON.stringify({ token, user: userData }))}`;

    const res = NextResponse.redirect(redirectUrl.toString());
    res.cookies.delete('google_oauth_state');
    return res;
  } catch (e: unknown) {
    console.error('GOOGLE CALLBACK ERROR:', (e as Error).message);
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://eseller.mn';
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`);
  }
}
