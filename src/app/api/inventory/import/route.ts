import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Datos de importación inválidos' }, { status: 400 });
    }

    // 1. Get all existing categories and products for efficient lookup
    const existingCategories = await prisma.category.findMany();
    const categoryMap = new Map(existingCategories.map(c => [c.description.toLowerCase(), c.id]));
    
    // We only need to check codes that are in the import list
    const importCodes = items.map(i => String(i.code || '').trim()).filter(Boolean);
    const existingProducts = await prisma.product.findMany({
      where: { code: { in: importCodes } }
    });
    const productMap = new Map(existingProducts.map(p => [p.code, p]));

    const result = await prisma.$transaction(async (tx) => {
      const summaries = { created: 0, updated: 0, skipped: 0 };
      
      for (const item of items) {
        // 1. Manage Category
        let categoryId: number;
        const categoryName = (item.category || 'General').trim();
        const catKey = categoryName.toLowerCase();
        
        if (categoryMap.has(catKey)) {
          categoryId = categoryMap.get(catKey)!;
        } else {
          const newCat = await tx.category.create({ data: { description: categoryName } });
          categoryId = newCat.id;
          categoryMap.set(catKey, categoryId);
        }

        // 2. Manage Product
        const productCode = String(item.code || '').trim();
        let product = productMap.get(productCode);

        if (!product) {
          // Create new product
          product = await tx.product.create({
            data: {
              code: productCode,
              name: item.name,
              description: item.description || '',
              categoryId: categoryId,
              bottleSize: Number(item.bottleSize) || 0,
              unitQuantity: Number(item.unitQuantity) || 1,
              salePrice: Number(item.salePrice) || 0,
              stock: Number(item.stock) || 0,
            },
          });
          summaries.created++;
          productMap.set(productCode, product); // Add to map for subsequent items if duplicated

          // Create adjustment for initial stock if present
          if (item.stock && Number(item.stock) > 0) {
            await tx.inventoryAdjustment.create({
              data: {
                productId: product.id,
                type: 'ENTRY',
                quantity: Number(item.stock),
                reason: 'Carga masiva desde Excel',
                date: new Date(),
              },
            });
          }
        } else {
          summaries.skipped++;
        }
      }

      return summaries;
    }, {
      timeout: 30000 // 30 seconds
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: 'Error durante la importación', details: error.message }, { status: 500 });
  }
}
