const { Client } = require('pg');
const c = new Client({user: 'root', host: '127.0.0.1', database: 'JcueScore_Db', password: '123456', port: 5432});
c.connect().then(() => c.query("UPDATE resource SET status = 'available' WHERE id NOT IN (SELECT \"recursoId\" FROM partidas WHERE estado = 'en_juego')")).then(r => console.log('Fixed', r.rowCount)).then(() => c.end()).catch(console.error);
