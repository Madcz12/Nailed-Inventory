import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        purchaseItems: true,
        saleItems: true,
        inventoryAdjustments: true,
      },
      orderBy: { id: 'asc' },
    });

    const inventory = products.map((p: any) => {
      const purchaseQuantity = p.purchaseItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
      const saleQuantity = p.saleItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
      
      const adjustmentEntries = (p.inventoryAdjustments || [])
        .filter((a: any) => a.type === 'ENTRY')
        .reduce((acc: number, a: any) => acc + a.quantity, 0);
        
      const adjustmentExits = (p.inventoryAdjustments || [])
        .filter((a: any) => a.type === 'EXIT')
        .reduce((acc: number, a: any) => acc + a.quantity, 0);

      const entries = purchaseQuantity + adjustmentEntries;
      const exits = saleQuantity + adjustmentExits;
      const stock = entries - exits;

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        category: p.category?.description || 'Sin categoría',
        bottleSize: p.bottleSize,
        salePrice: p.salePrice || 0,
        entries,
        exits,
        stock,
      };
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Inventory API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
