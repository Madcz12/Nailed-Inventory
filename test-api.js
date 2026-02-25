
async function testLogin() {
  const url = 'http://localhost:3000/api/auth/login';
  const body = JSON.stringify({
    email: 'test123@mail.com',
    password: 'password123' // I don't know the password, but this should return 401 JSON if wrong
  });

  console.log(`Testing POST ${url}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    console.log('Status:', res.status);
    console.log('Headers:', JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
    const text = await res.text();
    console.log('Body start:', text.substring(0, 100));
    try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
    } catch (e) {
        console.log('Failed to parse JSON');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testLogin();
