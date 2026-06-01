const { Client } = require('pg');

async function verifyExistingUsers() {
  const client = new Client({
    user: 'root',
    host: '127.0.0.1',
    database: 'JcueScore_Db',
    password: '123456',
    port: 5432,
  });

  try {
    await client.connect();
    // Mark ALL existing users as verified (they were created before this feature)
    const result = await client.query(`UPDATE "user" SET "isVerified" = true WHERE "isVerified" = false OR "isVerified" IS NULL;`);
    console.log(`Updated ${result.rowCount} users to verified.`);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

verifyExistingUsers();
