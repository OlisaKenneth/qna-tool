import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { targetType, targetId, value } = await request.json(); // value: 1 (up), -1 (down)
    if (!['post', 'reply'].includes(targetType) || ![1, -1].includes(value)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const userId = session.user.id;
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        ...(targetType === 'post' ? { postId: targetId } : { replyId: targetId }),
      },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote
        await prisma.vote.delete({ where: { id: existingVote.id } });
        return NextResponse.json({ action: 'removed', newScore: 0 });
      } else {
        // Update vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        return NextResponse.json({ action: 'updated', newScore: value });
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          value,
          userId,
          ...(targetType === 'post' ? { postId: targetId } : { replyId: targetId }),
        },
      });
      return NextResponse.json({ action: 'created', newScore: value });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  }
}
