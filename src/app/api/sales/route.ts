import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const docNum = req.nextUrl.searchParams.get('documentNumber');
  if (docNum) {
    const sale = await prisma.sale.findUnique({
      where: { documentNumber: docNum },
      include: {
        client: { select: { documentNumber: true, fullName: true } },
        user: { select: { fullName: true } },
        items: { include: { product: { select: { code: true, name: true } } } },
      },
    });
    if (!sale) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(sale);
  }
  const sales = await prisma.sale.findMany({
    include: { client: true, user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check stock availability
      for (const item of body.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product?.name || 'producto'}`);
        }
      }

      const sale = await tx.sale.create({
        data: {
          date: new Date(body.date),
          documentType: body.documentType,
          documentNumber: body.documentNumber,
          clientId: body.clientId,
          userId: body.userId,
          items: {
            create: body.items.map((i: { productId: number; price: number; quantity: number }) => ({
              productId: i.productId,
              price: i.price,
              quantity: i.quantity,
            })),
          },
        },
      });

      // Decrement stock
      for (const item of body.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return sale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error';
    if (msg.includes('Stock insuficiente')) return NextResponse.json({ error: msg }, { status: 400 });
    if (msg.includes('Unique')) return NextResponse.json({ error: 'Número de documento ya existe' }, { status: 400 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
