const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');
client.connect().then(async () => {
  try {
    await client.query(`ALTER TABLE reservation ALTER COLUMN "customerId" DROP NOT NULL`);
    await client.query(`ALTER TABLE reservation ADD COLUMN IF NOT EXISTS "guestName" VARCHAR(255)`);
    console.log('Migration OK');
  } catch(e) {
    console.error(e.message);
  }
  client.end();
});
