const { Client } = require('pg');

async function run() {
  const c = new Client({ user: 'root', host: '127.0.0.1', database: 'JcueScore_Db', password: '123456', port: 5432 });
  await c.connect();

  // List all tables
  const tables = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
  console.log('=== ALL TABLES ===');
  tables.rows.forEach(r => console.log(r.table_name));

  await c.end();
}
run().catch(console.error);
