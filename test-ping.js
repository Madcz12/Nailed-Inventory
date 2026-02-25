
async function testPing() {
  const url = 'http://localhost:3000/api/ping';
  console.log(`Testing GET ${url}`);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testPing();
