import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ detail: 'Could not validate credentials' }, { status: 401 });
    }

    const history = await prisma.detectionHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const items = history.map((item) => ({
      id: item.id,
      detected_object: item.detectedObject,
      image_url: `/uploads/${item.imagePath}`,
      created_at: item.createdAt,
    }));

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('History API error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
