import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE() {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Order matters due to foreign key constraints
      const adjustments = await tx.inventoryAdjustment.deleteMany({});
      const purchaseItems = await tx.purchaseItem.deleteMany({});
      const saleItems = await tx.saleItem.deleteMany({});
      const purchases = await tx.purchase.deleteMany({});
      const sales = await tx.sale.deleteMany({});
      const products = await tx.product.deleteMany({});

      return {
        adjustments: adjustments.count,
        purchaseItems: purchaseItems.count,
        saleItems: saleItems.count,
        purchases: purchases.count,
        sales: sales.count,
        products: products.count,
      };
    });

    return NextResponse.json({
      message: 'Inventario limpiado con éxito',
      details: result
    });
  } catch (error: unknown) {
    console.error('Clear Inventory Error:', error);
    return NextResponse.json({ 
      error: 'Error al limpiar el inventario', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}
