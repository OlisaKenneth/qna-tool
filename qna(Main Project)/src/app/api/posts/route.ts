import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/posts?channelId=xxx (list posts in a channel)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  if (!channelId) {
    return NextResponse.json({ error: 'channelId required' }, { status: 400 });
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { channelId },
      include: {
        author: { select: { name: true } },
        votes: true,
        _count: { select: { replies: true } },   // <-- ADD THIS LINE
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.post.count({ where: { channelId } }),
  ]);

  // Calculate net vote score for each post
  const postsWithScore = posts.map(post => ({
    ...post,
    netScore: post.votes.reduce((sum, v) => sum + v.value, 0),
  }));

  return NextResponse.json({ posts: postsWithScore, total, page, pageSize });
}

// POST /api/posts - create a new post (requires auth)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content, channelId, screenshot } = await request.json();
    if (!title || !content || !channelId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        channelId,
        authorId: session.user.id,
        screenshot: screenshot || null,
      },
      include: {
        author: { select: { name: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
