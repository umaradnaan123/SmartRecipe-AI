import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return NextResponse.json(
        { detail: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Find token in DB
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refresh_token },
      include: { user: true }
    });

    if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
      return NextResponse.json(
        { detail: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    const { user } = dbToken;

    if (!user || !user.isActive) {
      return NextResponse.json(
        { detail: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const new_access_token = await signAccessToken({ sub: user.id, role: user.role });
    const new_refresh_token = await signRefreshToken({ sub: user.id });

    // Revoke old token and save new token
    await prisma.refreshToken.update({
      where: { id: dbToken.id },
      data: { revoked: true }
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: new_refresh_token,
        userId: user.id,
        expiresAt,
      },
    });

    return NextResponse.json({
      access_token: new_access_token,
      refresh_token: new_refresh_token,
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
    console.error('Refresh token API error:', error);
    return NextResponse.json(
      { detail: 'Internal server error during token refresh' },
      { status: 500 }
    );
  }
}
