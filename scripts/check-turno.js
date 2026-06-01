const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');
client.connect().then(async () => {
  try {
    const r = await client.query(`SELECT "horaInicio", "horaFin", estado FROM turno`);
    console.log(r.rows);
  } catch(e) {
    console.error(e.message);
  }
  client.end();
});
