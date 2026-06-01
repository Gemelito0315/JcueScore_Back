const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');
client.connect().then(async () => {
  try {
    const res = await client.query(`SELECT * FROM reservation`);
    console.log(res.rows);
  } catch(e) {
    console.error(e.message);
  }
  client.end();
});
