import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const docNum = req.nextUrl.searchParams.get('documentNumber');
  if (docNum) {
    const client = await prisma.client.findMany({ where: { documentNumber: docNum } });
    return NextResponse.json(client);
  }
  const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const client = await prisma.client.create({ data: { documentNumber: body.documentNumber, fullName: body.fullName, email: body.email, phone: body.phone, status: body.status } });
    return NextResponse.json(client, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Documento ya registrado' }, { status: 400 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const client = await prisma.client.update({ where: { id: body.id }, data: { documentNumber: body.documentNumber, fullName: body.fullName, email: body.email, phone: body.phone, status: body.status } });
  return NextResponse.json(client);
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  await prisma.client.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
