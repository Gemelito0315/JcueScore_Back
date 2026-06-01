const http = require('http');

async function fetchJSON(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ path, status: res.statusCode, count: JSON.parse(data).length ?? '?' }); }
        catch { resolve({ path, status: res.statusCode, data: data.substring(0, 100) }); }
      });
    });
    req.on('error', e => resolve({ path, error: e.message }));
  });
}

async function main() {
  const results = await Promise.all([
    fetchJSON('/clientes'),
    fetchJSON('/productos'),
    fetchJSON('/recursos'),
    fetchJSON('/deudas/resumen'),
    fetchJSON('/reservas'),
    fetchJSON('/partidas'),
  ]);
  results.forEach(r => console.log(JSON.stringify(r)));
}

main();
