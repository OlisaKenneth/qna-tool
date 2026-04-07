import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });
  return NextResponse.json(users);
}
