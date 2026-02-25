import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  console.log('Testing Prisma Singleton...');
  try {
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    return NextResponse.json({ message: 'Connected', userCount });
  } catch (e: any) {
    console.error('Prisma Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
