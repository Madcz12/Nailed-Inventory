import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const adjustments = await prisma.inventoryAdjustment.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(adjustments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, type, quantity, reason } = body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create adjustment record
      const adjustment = await tx.inventoryAdjustment.create({
        data: {
          productId,
          type,
          quantity,
          reason,
          date: new Date(),
        },
      });

      // Update product stock
      // ENTRY increments, EXIT decrements
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            [type === 'ENTRY' ? 'increment' : 'decrement']: quantity,
          },
        },
      });

      return adjustment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
