const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');
client.connect().then(async () => {
  try {
    const r = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%role%' OR table_name LIKE '%user%'`);
    console.log('Tables:', r.rows.map(x => x.table_name).join(', '));
    
    // Find the user-role join table name
    const cols = await client.query(`
      SELECT table_name, column_name FROM information_schema.columns 
      WHERE table_name IN (SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%user%role%' OR table_name LIKE '%role%user%')
    `);
    console.log('User-role join cols:', cols.rows);
    
    // Get admin users
    const users = await client.query(`SELECT id, email FROM "user" WHERE email LIKE '%admin%'`);
    console.log('Admin users:', users.rows);
  } catch(e) {
    console.error(e.message);
  }
  client.end();
});
