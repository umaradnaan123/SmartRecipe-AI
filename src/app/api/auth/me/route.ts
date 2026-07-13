import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ detail: 'Could not validate credentials' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      is_active: user.isActive,
    });
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ detail: 'Could not validate credentials' }, { status: 401 });
    }

    const { email, full_name, password } = await req.json();

    const data: any = {};
    if (email && email !== user.email) {
      // Check if email already in use
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ detail: 'Email already in use' }, { status: 400 });
      }
      data.email = email;
    }

    if (full_name !== undefined) {
      data.fullName = full_name;
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      full_name: updated.fullName,
      role: updated.role,
      is_active: updated.isActive,
    });
  } catch (error) {
    console.error('PUT /api/auth/me error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
