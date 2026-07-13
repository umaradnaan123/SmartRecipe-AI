import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { AIService } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ detail: 'Could not validate credentials' }, { status: 401 });
    }

    // Resolve params (in newer Next.js it can be a Promise, we handle both)
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    const record = await prisma.detectionHistory.findFirst({
      where: { id, userId: user.id },
    });

    if (!record) {
      return NextResponse.json({ detail: 'Detection history item not found' }, { status: 404 });
    }

    const resourceLinks = AIService.generateResourceLinks(record.detectedObject);

    return NextResponse.json({
      id: record.id,
      detected_object: record.detectedObject,
      ai_insights: record.aiInsights,
      resource_links: resourceLinks,
      image_url: record.imagePath.startsWith('data:') ? record.imagePath : `/uploads/${record.imagePath}`,
      created_at: record.createdAt,
    });
  } catch (error: any) {
    console.error('Get history detail error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ detail: 'Could not validate credentials' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    const record = await prisma.detectionHistory.findFirst({
      where: { id, userId: user.id },
    });

    if (!record) {
      return NextResponse.json({ detail: 'Detection history item not found' }, { status: 404 });
    }

    // Attempt to delete file from disk if it is not a base64 data URI
    try {
      if (!record.imagePath.startsWith('data:')) {
        const filePath = path.join(process.cwd(), 'public', 'uploads', record.imagePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (e) {
      console.error('Error removing file:', e);
    }

    await prisma.detectionHistory.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Delete history item error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
