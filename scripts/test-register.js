const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/users/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(res.statusCode, data));
});
req.write(JSON.stringify({
  name: 'Test',
  lastName: 'User',
  docType: 'CC',
  docNumber: '9999999',
  email: 'test4@correo.com',
  password: 'password123',
  isActive: true,
  roleIds: [2]
}));
req.end();
