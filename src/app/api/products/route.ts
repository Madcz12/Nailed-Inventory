import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { id: 'asc' } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          code: body.code,
          name: body.name,
          description: body.description || '',
          categoryId: body.categoryId,
          status: body.status,
          bottleSize: body.bottleSize ? Number(body.bottleSize) : 0,
          unitQuantity: body.unitQuantity ? Number(body.unitQuantity) : 1,
          salePrice: body.salePrice ? Number(body.salePrice) : 0,
          stock: body.initialStock ? Number(body.initialStock) : 0,
        },
      });

      // If initial stock is provided, create an inventory adjustment
      if (body.initialStock && Number(body.initialStock) > 0) {
        await tx.inventoryAdjustment.create({
          data: {
            productId: product.id,
            type: 'ENTRY',
            quantity: Number(body.initialStock),
            reason: 'Registro inicial de producto',
            date: new Date(),
          },
        });
      }

      return product;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Código ya registrado' }, { status: 400 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const product = await prisma.product.update({
    where: { id: body.id },
    data: {
      code: body.code,
      name: body.name,
      description: body.description || '',
      categoryId: body.categoryId,
      status: body.status,
      bottleSize: body.bottleSize ? Number(body.bottleSize) : 0,
      unitQuantity: body.unitQuantity ? Number(body.unitQuantity) : 1,
      salePrice: body.salePrice ? Number(body.salePrice) : 0,
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  await prisma.product.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}
