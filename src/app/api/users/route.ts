import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, documentNumber: true, fullName: true, email: true, role: true, status: true } });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const hash = await bcrypt.hash(body.password, 10);
  try {
    const user = await prisma.user.create({ data: { documentNumber: body.documentNumber, fullName: body.fullName, email: body.email, password: hash, role: body.role, status: body.status } });
    return NextResponse.json(user, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Documento o correo ya registrado' }, { status: 400 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data: Record<string, unknown> = { documentNumber: body.documentNumber, fullName: body.fullName, email: body.email, role: body.role, status: body.status };
  if (body.password) data.password = await bcrypt.hash(body.password, 10);
  try {
    const user = await prisma.user.update({ where: { id: body.id }, data });
    return NextResponse.json(user);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  await prisma.user.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
