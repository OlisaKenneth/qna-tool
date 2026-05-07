import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const channels = await prisma.channel.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(channels);
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Channel name required' }, { status: 400 });
    }
    const channel = await prisma.channel.create({ data: { name: name.trim() } });
    return NextResponse.json(channel, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Channel name exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}
