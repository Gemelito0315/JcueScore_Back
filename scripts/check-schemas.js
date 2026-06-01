const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');
client.connect().then(async () => {
  try {
    const r1 = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pedidos'`);
    console.log('Pedidos:', r1.rows);
    const r2 = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pedido_items'`);
    console.log('Pedido Items:', r2.rows);
  } catch(e) { console.error(e); }
  client.end();
});
