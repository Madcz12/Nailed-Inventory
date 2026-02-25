import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const startDate = req.nextUrl.searchParams.get('startDate');
  const endDate = req.nextUrl.searchParams.get('endDate');
  const supplierId = req.nextUrl.searchParams.get('supplierId');

  // Build filter for purchases
  const purchaseWhere: Record<string, unknown> = {};
  if (startDate || endDate) {
    purchaseWhere.date = {};
    if (startDate) (purchaseWhere.date as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (purchaseWhere.date as Record<string, unknown>).lte = new Date(endDate + 'T23:59:59');
  }
  if (supplierId) purchaseWhere.supplierId = Number(supplierId);

  // Fetch purchases
  const purchases = await prisma.purchase.findMany({
    where: purchaseWhere,
    include: {
      supplier: true,
      user: true,
      items: { include: { product: { include: { category: true } } } },
    },
    orderBy: { date: 'desc' },
  });

  // Build filter for sales
  const saleWhere: Record<string, unknown> = {};
  if (startDate || endDate) {
    saleWhere.date = {};
    if (startDate) (saleWhere.date as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (saleWhere.date as Record<string, unknown>).lte = new Date(endDate + 'T23:59:59');
  }

  const sales = await prisma.sale.findMany({
    where: saleWhere,
    include: {
      client: true,
      user: true,
      items: { include: { product: { include: { category: true } } } },
    },
    orderBy: { date: 'desc' },
  });

  // Flatten into report rows
  const rows: Record<string, unknown>[] = [];
  let idCounter = 1;

  for (const p of purchases) {
    const totalAmount = p.items.reduce((a, i) => a + i.purchasePrice * i.quantity, 0);
    for (const item of p.items) {
      rows.push({
        id: idCounter++,
        date: p.date,
        documentType: p.documentType,
        documentNumber: p.documentNumber,
        totalAmount,
        userName: p.user.fullName,
        clientDocument: '-',
        clientName: p.supplier.companyName,
        productCode: item.product.code,
        productName: item.product.name,
        category: item.product.category?.description || '-',
        salePrice: item.salePrice,
        quantity: item.quantity,
        subtotal: item.purchasePrice * item.quantity,
      });
    }
  }

  for (const s of sales) {
    const totalAmount = s.items.reduce((a, i) => a + i.price * i.quantity, 0);
    for (const item of s.items) {
      rows.push({
        id: idCounter++,
        date: s.date,
        documentType: s.documentType,
        documentNumber: s.documentNumber,
        totalAmount,
        userName: s.user.fullName,
        clientDocument: s.client.documentNumber,
        clientName: s.client.fullName,
        productCode: item.product.code,
        productName: item.product.name,
        category: item.product.category?.description || '-',
        salePrice: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      });
    }
  }

  return NextResponse.json(rows);
}
