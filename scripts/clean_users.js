const { Client } = require('pg');

async function cleanUsers() {
  const client = new Client({
    user: 'root',
    host: '127.0.0.1',
    database: 'JcueScore_Db',
    password: '123456',
    port: 5432,
  });

  try {
    await client.connect();
    const ids = '3,4';
    const tablesToDelete = [
      `DELETE FROM "partidas"`,
      `DELETE FROM "user" WHERE id NOT IN (${ids})`
    ];

    for (let query of tablesToDelete) {
      try {
        const res = await client.query(query);
        console.log(`Executed: ${query}. Rows affected: ${res.rowCount}`);
      } catch (err) {
        console.error(`Failed to execute ${query}:`, err.message);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

cleanUsers();
