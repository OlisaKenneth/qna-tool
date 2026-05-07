import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'substring';
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  try {
    let results: any = [];
    let total = 0;

    switch (type) {
      case 'substring': {
        // Search across post titles, post content, reply content
        const posts = await prisma.post.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          },
          include: {
            author: { select: { name: true } },
            votes: true,
            _count: { select: { replies: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        });
        const replies = await prisma.reply.findMany({
          where: {
            content: { contains: q, mode: 'insensitive' },
          },
          include: {
            author: { select: { name: true } },
            votes: true,
            post: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        });
        // Combine and deduplicate? We'll just return both sections
        const postsWithScore = posts.map(p => ({
          type: 'post',
          id: p.id,
          title: p.title,
          content: p.content,
          author: p.author.name,
          createdAt: p.createdAt,
          netScore: p.votes.reduce((s, v) => s + v.value, 0),
          replyCount: p._count.replies,
        }));
        const repliesWithScore = replies.map(r => ({
          type: 'reply',
          id: r.id,
          content: r.content,
          author: r.author.name,
          createdAt: r.createdAt,
          netScore: r.votes.reduce((s, v) => s + v.value, 0),
          postId: r.post.id,
          postTitle: r.post.title,
        }));
        results = [...postsWithScore, ...repliesWithScore];
        total = results.length; // simplified
        break;
      }

      case 'byAuthor': {
        if (!q) {
          return NextResponse.json({ error: 'Author name required' }, { status: 400 });
        }
        const posts = await prisma.post.findMany({
          where: {
            author: { name: { contains: q, mode: 'insensitive' } },
          },
          include: {
            author: { select: { name: true } },
            votes: true,
            _count: { select: { replies: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        });
        const postsWithScore = posts.map(p => ({
          type: 'post',
          id: p.id,
          title: p.title,
          content: p.content,
          author: p.author.name,
          createdAt: p.createdAt,
          netScore: p.votes.reduce((s, v) => s + v.value, 0),
          replyCount: p._count.replies,
        }));
        results = postsWithScore;
        total = await prisma.post.count({
          where: { author: { name: { contains: q, mode: 'insensitive' } } },
        });
        break;
      }

      case 'mostPosts': {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            _count: { select: { posts: true } },
          },
          orderBy: { posts: { _count: 'desc' } },
          skip,
          take: pageSize,
        });
        results = users.map(u => ({
          type: 'user',
          id: u.id,
          name: u.name,
          postCount: u._count.posts,
        }));
        total = await prisma.user.count();
        break;
      }

      case 'leastPosts': {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            _count: { select: { posts: true } },
          },
          orderBy: { posts: { _count: 'asc' } },
          skip,
          take: pageSize,
        });
        results = users.map(u => ({
          type: 'user',
          id: u.id,
          name: u.name,
          postCount: u._count.posts,
        }));
        total = await prisma.user.count();
        break;
      }

      case 'highestRanked': {
        // Get posts and replies, combine, sort by net score
        const posts = await prisma.post.findMany({
          include: {
            author: { select: { name: true } },
            votes: true,
          },
          orderBy: { createdAt: 'desc' }, // we'll sort later
        });
        const replies = await prisma.reply.findMany({
          include: {
            author: { select: { name: true } },
            votes: true,
            post: { select: { id: true, title: true } },
          },
        });
        const combined = [
          ...posts.map(p => ({
            type: 'post',
            id: p.id,
            title: p.title,
            content: p.content,
            author: p.author.name,
            createdAt: p.createdAt,
            netScore: p.votes.reduce((s, v) => s + v.value, 0),
          })),
          ...replies.map(r => ({
            type: 'reply',
            id: r.id,
            content: r.content,
            author: r.author.name,
            createdAt: r.createdAt,
            netScore: r.votes.reduce((s, v) => s + v.value, 0),
            postTitle: r.post.title,
          })),
        ];
        combined.sort((a, b) => b.netScore - a.netScore);
        const start = skip;
        const end = start + pageSize;
        results = combined.slice(start, end);
        total = combined.length;
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    return NextResponse.json({
      results,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
