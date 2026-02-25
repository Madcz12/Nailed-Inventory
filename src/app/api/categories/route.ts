import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cat = await prisma.category.create({ data: { description: body.description, status: body.status } });
  return NextResponse.json(cat, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const cat = await prisma.category.update({ where: { id: body.id }, data: { description: body.description, status: body.status } });
  return NextResponse.json(cat);
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  await prisma.category.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
