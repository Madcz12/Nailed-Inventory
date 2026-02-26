import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  console.log('Testing Prisma Singleton...');
  try {
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    return NextResponse.json({ 
      message: 'Connected', 
      userCount, 
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      env: process.env.NODE_ENV
    });
  } catch (e: any) {
    console.error('Prisma Diagnostic Error:', e);
    return NextResponse.json({ 
      error: e.message,
      code: e.code,
      meta: e.meta,
      stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
    }, { status: 500 });
  }
}
