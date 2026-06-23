const https = require('https');

const API = 'https://jcuescore-back.onrender.com';

function request(method, path, body, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(API + path);
    const opts = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    };
    const req = https.request(opts, res => {
      let out = '';
      res.on('data', c => out += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(out) }); }
        catch { resolve({ status: res.statusCode, body: out }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  const loginRes = await request('POST', '/auth/login', {
    email: 'admin@correo.com',
    password: 'admin123'
  });
  
  if (!loginRes.body.token) {
    console.error('Login failed:', loginRes);
    return;
  }
  
  const token = loginRes.body.token;
  console.log('Logged in successfully');

  // get a product to sell
  const prods = await request('GET', '/productos', null, token);
  const prodId = prods.body[0]?.id || 1;

  const body = {
    recursoId: null,
    usuarioId: null, // "Ocasional"
    metodoPago: 'cuenta_mesa',
    notas: 'Venta rápida en barra (Cuenta pendiente)',
    metadata: { origen: 'barra' },
    items: [{ productId: prodId, cantidad: 1 }]
  };

  const res = await request('POST', '/pedidos', body, token);
  console.log('Status:', res.status);
  console.log('Body:', res.body);
}

run().catch(console.error);
