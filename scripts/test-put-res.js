const http = require('http');
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/reservas/1',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  }
};
const req = http.request(options, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});
req.write(JSON.stringify({ status: 'cancelled' }));
req.end();
