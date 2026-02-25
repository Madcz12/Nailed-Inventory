import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const docNum = req.nextUrl.searchParams.get('documentNumber');
  if (docNum) {
    const supplier = await prisma.supplier.findMany({ where: { documentNumber: docNum } });
    return NextResponse.json(supplier);
  }
  const suppliers = await prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(suppliers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const supplier = await prisma.supplier.create({ data: { documentNumber: body.documentNumber, companyName: body.companyName, email: body.email, phone: body.phone, status: body.status } });
    return NextResponse.json(supplier, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Documento ya registrado' }, { status: 400 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const supplier = await prisma.supplier.update({ where: { id: body.id }, data: { documentNumber: body.documentNumber, companyName: body.companyName, email: body.email, phone: body.phone, status: body.status } });
  return NextResponse.json(supplier);
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  await prisma.supplier.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
