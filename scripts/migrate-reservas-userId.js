const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');
client.connect().then(async () => {
  try {
    await client.query(`ALTER TABLE reservation ADD COLUMN IF NOT EXISTS "userId" INT`);
    await client.query(`ALTER TABLE reservation ADD CONSTRAINT "FK_res_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL`);
    console.log('Migration OK');
  } catch(e) {
    console.error(e.message);
  }
  client.end();
});
