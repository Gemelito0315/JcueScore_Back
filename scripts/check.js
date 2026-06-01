const { Client } = require('pg');
const client = new Client('postgresql://postgres:postgres@localhost:5432/jcuescore');
client.connect().then(() => {
  return client.query(`SELECT "horaInicio" FROM turno WHERE estado='abierto'`);
}).then(res => {
  console.log(res.rows);
  client.end();
});
