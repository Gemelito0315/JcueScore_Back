const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');
client.connect().then(async () => {
  try {
    // Get admin user roles
    const roles = await client.query(`
      SELECT u.email, r.name as role_name
      FROM "user" u
      JOIN user_roles ur ON ur."userId" = u.id
      JOIN role r ON r.id = ur."roleId"
      WHERE u.email LIKE '%admin%'
    `);
    console.log('Admin roles:', roles.rows);
    
    // Get all users and their roles
    const allUsers = await client.query(`
      SELECT u.id, u.name, u.email, array_agg(r.name) as roles
      FROM "user" u
      LEFT JOIN user_roles ur ON ur."userId" = u.id
      LEFT JOIN role r ON r.id = ur."roleId"
      GROUP BY u.id, u.name, u.email
      LIMIT 5
    `);
    console.log('Users:', allUsers.rows);
    
    // Check ADMIN role has all modules
    const adminModules = await client.query(`
      SELECT m.name FROM modules m
      JOIN role_modules rm ON rm.module_id = m.id
      JOIN role r ON r.id = rm.role_id
      WHERE r.name = 'ADMIN'
    `);
    console.log('ADMIN modules:', adminModules.rows.map(x => x.name).join(', '));
    
    // Does ADMIN have 'modules' module?
    const hasModules = adminModules.rows.find(x => x.name === 'modules');
    console.log('ADMIN has modules permission:', !!hasModules);
  } catch(e) {
    console.error(e.message);
  }
  client.end();
});
