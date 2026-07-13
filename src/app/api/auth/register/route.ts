import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Email and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { detail: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCount = await prisma.user.count();
    const assignedRole = userCount === 0 ? 'admin' : role || 'user';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: full_name,
        role: assignedRole,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
        is_active: user.isActive,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { detail: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
