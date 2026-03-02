
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning inventory and transaction data...');
  
  try {
    // Order matters due to foreign key constraints
    await prisma.inventoryAdjustment.deleteMany({});
    console.log('✓ Inventory adjustments deleted');
    
    await prisma.purchaseItem.deleteMany({});
    console.log('✓ Purchase items deleted');
    
    await prisma.saleItem.deleteMany({});
    console.log('✓ Sale items deleted');
    
    await prisma.purchase.deleteMany({});
    console.log('✓ Purchases deleted');
    
    await prisma.sale.deleteMany({});
    console.log('✓ Sales deleted');
    
    await prisma.product.deleteMany({});
    console.log('✓ Products deleted');
    
    // We keep Categories, Clients, and Suppliers as they are usually master data,
    // but clearing products handles the bulk of the "inventory".
    
    console.log('\nInventory cleared successfully! Ready for demo re-import.');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

main()
  .catch(e => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
