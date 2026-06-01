const { Client } = require('pg');

async function run() {
  const c = new Client({ user: 'root', host: '127.0.0.1', database: 'JcueScore_Db', password: '123456', port: 5432 });
  await c.connect();

  const res = await c.query('SELECT id, code, "venueId", "gameTypeId", status, "pricePerHour", "isActive" FROM resource ORDER BY id');
  console.log('=== RESOURCES ===');
  console.table(res.rows);

  await c.end();
}
run().catch(console.error);
