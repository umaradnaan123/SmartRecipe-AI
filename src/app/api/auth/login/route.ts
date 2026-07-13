import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let email = '';
    let password = '';

    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      email = formData.get('username') as string;
      password = formData.get('password') as string;
    } else {
      const body = await req.json();
      email = body.email || body.username;
      password = body.password;
    }

    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Incorrect email or password' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { detail: 'Incorrect email or password' },
        { status: 400 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { detail: 'User is inactive' },
        { status: 400 }
      );
    }

    // Generate tokens
    const access_token = await signAccessToken({ sub: user.id, role: user.role });
    const refresh_token = await signRefreshToken({ sub: user.id });

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refresh_token,
        userId: user.id,
        expiresAt,
      },
    });

    // Delete old expired/revoked refresh tokens
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true }
        ]
      }
    });

    return NextResponse.json({
      access_token,
      refresh_token,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
        is_active: user.isActive,
      },
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { detail: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
