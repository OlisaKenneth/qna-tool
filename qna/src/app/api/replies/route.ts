import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/replies?postId=xxx (public) – fetch all replies for a post
// GET /api/replies?limit=100 (admin only) – fetch all replies for admin dashboard
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  const limit = searchParams.get('limit');

  // If postId is provided, return replies for that post (public)
  if (postId) {
    const replies = await prisma.reply.findMany({
      where: { postId },
      include: {
        author: { select: { name: true } },
        votes: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(replies);
  }

  // Otherwise, require admin (for admin dashboard)
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const take = limit ? parseInt(limit) : 100;
  const replies = await prisma.reply.findMany({
    take,
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(replies);
}

// POST /api/replies – create a new reply (requires auth)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content, postId, parentId, screenshot } = await request.json();
    if (!content || !postId) {
      return NextResponse.json({ error: 'Missing content or postId' }, { status: 400 });
    }

    const reply = await prisma.reply.create({
      data: {
        content: content.trim(),
        postId,
        parentId: parentId || null,
        authorId: session.user.id,
        screenshot: screenshot || null,
      },
      include: {
        author: { select: { name: true } },
      },
    });
    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}
