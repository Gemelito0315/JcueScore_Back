const { Client } = require('pg');

async function run() {
  const c = new Client({ user: 'root', host: '127.0.0.1', database: 'JcueScore_Db', password: '123456', port: 5432 });
  await c.connect();

  console.log('\n=== MODULES TABLE ===');
  const modules = await c.query('SELECT id, name FROM modules ORDER BY name');
  console.log(JSON.stringify(modules.rows, null, 2));

  console.log('\n=== ROLES ===');
  const roles = await c.query('SELECT id, name FROM role ORDER BY name');
  console.log(JSON.stringify(roles.rows, null, 2));

  console.log('\n=== ROLE_MODULES ===');
  const roleModules = await c.query(`
    SELECT r.name as role_name, m.name as module_name
    FROM role r
    LEFT JOIN role_modules rm ON rm."roleId" = r.id
    LEFT JOIN modules m ON m.id = rm."modulesId"
    ORDER BY r.name, m.name
  `);
  console.log(JSON.stringify(roleModules.rows, null, 2));

  console.log('\n=== GARITERO USER ===');
  const garitero = await c.query(`
    SELECT u.email, u."isVerified", r.name as role_name, m.name as module_name
    FROM "user" u
    JOIN user_roles ur ON ur."userId" = u.id
    JOIN role r ON r.id = ur."roleId"
    LEFT JOIN role_modules rm ON rm."roleId" = r.id
    LEFT JOIN modules m ON m.id = rm."modulesId"
    WHERE u.email = 'garitero@jcuescore.com'
    ORDER BY r.name, m.name
  `);
  console.log(JSON.stringify(garitero.rows, null, 2));

  await c.end();
}
run().catch(console.error);
