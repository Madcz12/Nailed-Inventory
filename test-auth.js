
// Removed verify/require of node-fetch, assuming Node 18+ (Next.js 16 requires node 18+)
const BASE_URL = 'http://localhost:3000/api/auth';

async function testAuth() {
  console.log('Starting Auth Test...');
  const uniqueId = Date.now();
  const user = {
    fullName: 'Test User',
    documentNumber: `12345${uniqueId}`,
    email: `test${uniqueId}@example.com`,
    password: 'password123',
    confirmPassword: 'password123'
  };

  console.log(`--- Testing Registration for ${user.email} ---`);
  try {
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    
    const regText = await regRes.text();
    console.log('Register Status:', regRes.status);
    console.log('Register Body:', regText);

    if (regRes.status !== 201) throw new Error(`Registration failed: ${regText}`);
  } catch (e) {
    console.error('Registration Error:', e);
    return;
  }

  console.log('\n--- Testing Login ---');
  try {
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password })
    });
    
    const loginText = await loginRes.text();
    console.log('Login Status:', loginRes.status);
    console.log('Login Body:', loginText);
    
    // Check for Set-Cookie header
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Set-Cookie Header:', cookies ? 'Present' : 'Missing');
    if(cookies) console.log('Cookie content:', cookies);

    if (loginRes.status !== 200) throw new Error(`Login failed: ${loginText}`);
  } catch (e) {
    console.error('Login Error:', e);
    return;
  }

  console.log('\n--- Auth Tests Completed Successfully ---');
}

testAuth();
