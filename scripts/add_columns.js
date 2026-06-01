const { Client } = require('pg');

async function addColumns() {
  const client = new Client({
    user: 'root',
    host: '127.0.0.1',
    database: 'JcueScore_Db',
    password: '123456',
    port: 5432,
  });

  try {
    await client.connect();
    await client.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "isVerified" boolean DEFAULT false;`);
    await client.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "verificationToken" varchar;`);
    console.log('Columns added');
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

addColumns();
