const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');
client.connect().then(async () => {
  try {
    const r = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
    console.log(r.rows.map(x=>x.table_name));
  } catch(e) { console.error(e); }
  client.end();
});
