const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');
client.connect().then(() => {
  return client.query(`SELECT m.name as module, r.name as role FROM role_module rm JOIN module m ON rm."moduleId" = m.id JOIN role r ON rm."roleId" = r.id`);
}).then(res => {
  console.log(res.rows);
  client.end();
}).catch(e => { console.log(e); client.end(); });
