import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const docNum = req.nextUrl.searchParams.get('documentNumber');
  if (docNum) {
    const purchase = await prisma.purchase.findUnique({
      where: { documentNumber: docNum },
      include: {
        supplier: { select: { documentNumber: true, companyName: true } },
        user: { select: { fullName: true } },
        items: { include: { product: { select: { code: true, name: true } } } },
      },
    });
    if (!purchase) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(purchase);
  }
  const purchases = await prisma.purchase.findMany({
    include: { supplier: true, user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(purchases);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          date: new Date(body.date),
          documentType: body.documentType,
          documentNumber: body.documentNumber,
          supplierId: body.supplierId,
          userId: body.userId,
          items: {
            create: body.items.map((i: { productId: number; purchasePrice: number; salePrice: number; quantity: number }) => ({
              productId: i.productId,
              purchasePrice: i.purchasePrice,
              salePrice: i.salePrice,
              quantity: i.quantity,
            })),
          },
        },
      });

      // Update product stock and sale price atomically within the transaction
      for (const item of body.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            salePrice: item.salePrice,
          },
        });
      }

      return purchase;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Número de documento ya existe' }, { status: 400 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
