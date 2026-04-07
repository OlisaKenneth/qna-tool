import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const posts = await prisma.post.findMany({
    take: limit,
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(posts);
}
