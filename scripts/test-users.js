const http = require('http');

async function login() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.write(JSON.stringify({ email: 'admin@correo.com', password: 'password123' }));
    req.end();
  });
}

async function testPostUsers(token) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.write(JSON.stringify({
      name: 'Test',
      lastName: 'User',
      docType: 'CC',
      docNumber: '9999999',
      email: 'test@correo.com',
      password: 'password123',
      isActive: true,
      roleIds: [2]
    }));
    req.end();
  });
}

login().then(async res => {
  if (res.access_token) {
    console.log('Login OK');
    const result = await testPostUsers(res.access_token);
    console.log('POST /users ->', result.status);
    console.log(result.data);
  } else {
    console.log('Login failed', res);
  }
});
