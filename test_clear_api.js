async function testClearInventory() {
  const BASE_URL = 'http://localhost:3000'; // Assuming local dev server
  
  console.log('Testing Clear Inventory API...');
  
  try {
    // 1. Check current inventory
    const getRes = await fetch(`${BASE_URL}/api/inventory`);
    if (!getRes.ok) throw new Error(`GET failed: ${getRes.status}`);
    const items = await getRes.json();
    console.log(`Current items: ${items.length}`);
    
    if (items.length === 0) {
      console.log('Warning: Inventory is already empty. Import something first for a better test.');
    }
    
    // 2. Clear inventory
    console.log('Clearing inventory...');
    const delRes = await fetch(`${BASE_URL}/api/inventory/clear`, { method: 'DELETE' });
    if (!delRes.ok) {
        const errData = await delRes.json();
        throw new Error(`DELETE failed: ${delRes.status} - ${JSON.stringify(errData)}`);
    }
    const delData = await delRes.json();
    console.log('Response:', delData);
    
    // 3. Verify it's empty
    const verifyRes = await fetch(`${BASE_URL}/api/inventory`);
    if (!verifyRes.ok) throw new Error(`Verify GET failed: ${verifyRes.status}`);
    const itemsAfter = await verifyRes.json();
    console.log(`Items after clearing: ${itemsAfter.length}`);
    
    if (itemsAfter.length === 0) {
      console.log('SUCCESS: Inventory cleared.');
    } else {
      console.log('FAILURE: Inventory not empty.');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.log('\nNOTE: Make sure the dev server is running at http://localhost:3000');
  }
}

testClearInventory();
