const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');
client.connect().then(async () => {
  try {
    // Verify customer table columns
    const custCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='customer'`);
    console.log('Customer cols:', custCols.rows.map(r => r.column_name).join(', '));

    // Verify resource table columns  
    const resCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='resource'`);
    console.log('Resource cols:', resCols.rows.map(r => r.column_name).join(', '));

    // Count data in key tables
    const counts = await client.query(`
      SELECT 
        (SELECT count(*) FROM "user") as users,
        (SELECT count(*) FROM customer) as customers,
        (SELECT count(*) FROM resource) as resources,
        (SELECT count(*) FROM product) as products,
        (SELECT count(*) FROM reservation) as reservations
    `);
    console.log('Counts:', counts.rows[0]);

    // Check roles with modules
    const roles = await client.query(`SELECT name FROM role`);
    console.log('Roles:', roles.rows.map(r => r.name).join(', '));
  } catch(e) {
    console.error(e.message);
  }
  client.end();
});
