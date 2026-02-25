import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();

    // 1. Get Sales and Purchases per day (last 7 days)
    const sales = await prisma.sale.findMany({
      where: { date: { gte: subDays(startOfDay(today), 6) } },
      include: { items: true },
    });

    const purchases = await prisma.purchase.findMany({
      where: { date: { gte: subDays(startOfDay(today), 6) } },
      include: { items: true },
    });

    const adjustments = await prisma.inventoryAdjustment.findMany({
      where: { date: { gte: subDays(startOfDay(today), 6) } },
    });

    // 2. Aggregate Data by Date
    const dailyData = last7Days.map(dateStr => {
      const daySales = sales.filter(s => format(new Date(s.date), 'yyyy-MM-dd') === dateStr);
      const dayPurchases = purchases.filter(p => format(new Date(p.date), 'yyyy-MM-dd') === dateStr);
      const dayAdjustments = adjustments.filter(a => format(new Date(a.date), 'yyyy-MM-dd') === dateStr);

      const salesAmount = daySales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + (i.price * i.quantity), 0), 0);
      const purchasesAmount = dayPurchases.reduce((acc, p) => acc + p.items.reduce((sum, i) => sum + (i.purchasePrice * i.quantity), 0), 0);
      
      const entriesCount = dayPurchases.reduce((acc, p) => acc + p.items.reduce((sum, i) => sum + i.quantity, 0), 0) + 
                          dayAdjustments.filter(a => a.type === 'ENTRY').reduce((acc, a) => acc + a.quantity, 0);
      
      const exitsCount = daySales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0) + 
                         dayAdjustments.filter(a => a.type === 'EXIT').reduce((acc, a) => acc + a.quantity, 0);

      return {
        date: format(new Date(dateStr + 'T12:00:00'), 'dd/MM'),
        sales: salesAmount,
        purchases: purchasesAmount,
        entries: entriesCount,
        exits: exitsCount,
      };
    });

    // 3. Category Distribution
    const categories = await prisma.category.findMany({
      include: { products: true },
    });

    const categoryStats = categories.map(c => ({
      name: c.description,
      value: c.products.length,
    })).filter(c => c.value > 0);

    // 4. Summary Totals
    const totalClients = await prisma.client.count();
    const totalProducts = await prisma.product.count();
    const totalSales = sales.length;
    const totalStock = await prisma.product.aggregate({ _sum: { stock: true } });

    return NextResponse.json({
      dailyData,
      categoryStats,
      summary: {
        totalClients,
        totalProducts,
        totalSales,
        currentStock: totalStock._sum.stock || 0
      }
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
