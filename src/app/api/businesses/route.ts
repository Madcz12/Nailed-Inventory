import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const businesses = await prisma.business.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(businesses);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const rif = formData.get('rif') as string;
  const address = formData.get('address') as string;
  const logoFile = formData.get('logo') as File | null;

  let logoUrl: string | null = null;
  if (logoFile) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const bytes = await logoFile.arrayBuffer();
    const fileName = `${Date.now()}-${logoFile.name}`;
    await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));
    logoUrl = `/uploads/${fileName}`;
  }

  try {
    const biz = await prisma.business.create({ data: { name, rif, address, logoUrl } });
    return NextResponse.json(biz, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'RIF ya registrado' }, { status: 400 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const formData = await req.formData();
  const id = Number(formData.get('id'));
  const name = formData.get('name') as string;
  const rif = formData.get('rif') as string;
  const address = formData.get('address') as string;
  const logoFile = formData.get('logo') as File | null;

  const data: Record<string, unknown> = { name, rif, address };

  if (logoFile) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const bytes = await logoFile.arrayBuffer();
    const fileName = `${Date.now()}-${logoFile.name}`;
    await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));
    data.logoUrl = `/uploads/${fileName}`;
  }

  const biz = await prisma.business.update({ where: { id }, data });
  return NextResponse.json(biz);
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  await prisma.business.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
