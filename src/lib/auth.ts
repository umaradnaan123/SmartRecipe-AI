import { NextRequest } from 'next/server';
import prisma from './db';

export async function getCurrentUser(req: NextRequest) {
  try {
    // Automatically authenticate as a default guest user to remove login credentials requirement
    let user = await prisma.user.findFirst({
      where: { email: 'guest@visionai.local' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'guest@visionai.local',
          password: 'guest_bypass_password',
          fullName: 'Guest User',
          role: 'user',
        },
      });
    }

    return user;
  } catch (dbErr) {
    console.warn("Auth database lookup failed, returning fallback mock guest user details:", dbErr);
    return {
      id: 9999,
      email: 'guest@visionai.local',
      fullName: 'Guest User',
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
