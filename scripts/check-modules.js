const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');
client.connect().then(async () => {
  try {
    // Check modules table
    const modules = await client.query(`SELECT id, name FROM modules`);
    console.log('Modules:', modules.rows);

    // Check role_modules join table
    const roleModules = await client.query(`
      SELECT r.name as role, m.name as module
      FROM role_modules rm
      JOIN role r ON rm.role_id = r.id
      JOIN modules m ON rm.module_id = m.id
      ORDER BY r.name, m.name
    `);
    console.log('Role-Modules:', roleModules.rows);

    // Check users and their roles
    const users = await client.query(`
      SELECT u.email, r.name as role
      FROM "user" u
      JOIN user_roles_role ur ON ur."userId" = u.id
      JOIN role r ON r.id = ur."roleId"
      WHERE u.email LIKE '%admin%'
    `);
    console.log('Admin users:', users.rows);
  } catch(e) {
    console.error(e.message);
  }
  client.end();
});
