const http = require('http');

http.get('http://localhost:3000/clientes', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Clientes:', JSON.parse(data).length);
  });
});

http.get('http://localhost:3000/users', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Users:', JSON.parse(data).length);
  });
});
