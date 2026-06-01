/**
 * Script de inicialización de datos base para JcueScore
 * Corregido: admin@correo.com
 */
const http = require('http');

const BASE = 'http://localhost:3000';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = http.request(opts, res => {
      let out = '';
      res.on('data', c => out += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(out) }); }
        catch { resolve({ status: res.statusCode, body: out }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function seed() {
  console.log('🌱 Iniciando seed de datos base JcueScore...\n');

  // ... (mantiene la lógica de creación de módulos igual)
  const modules = [{ name: 'users' }, { name: 'roles' }, { name: 'modules' }, { name: 'clientes' }, { name: 'productos' }, { name: 'reservas' }, { name: 'partidas' }, { name: 'torneos' }, { name: 'reportes' }, { name: 'caja' }, { name: 'deudas' }, { name: 'mesas' }, { name: 'leaderboard' }, { name: 'pedidos' }, { name: 'perfil' }];
  
  const createdModules = {};
  for (const mod of modules) {
    const r = await request('POST', '/modules', { name: mod.name, description: 'Modulo ' + mod.name });
    if (r.status === 201 || r.status === 200) createdModules[mod.name] = r.body.id;
  }

  const allModuleIds = Object.values(createdModules).filter(Boolean);

  // Crear Rol Admin
  const adminRole = await request('POST', '/roles', { name: 'Admin', description: 'Admin total', moduleIds: allModuleIds });
  const adminRoleId = adminRole.body?.id || 1;

  console.log('\n👤 Creando usuario Admin...');
  // CORRECCIÓN AQUÍ: Correo y clave solicitados
  const adminUser = await request('POST', '/users/register', {
    name: 'Admin',
    lastName: 'Sistema',
    docType: 'CC',
    docNumber: '111111111',
    email: 'admin@correo.com', 
    password: 'admin123',
    isActive: true,
    roleIds: [adminRoleId]
  });

  console.log('Resultado creación Admin:', adminUser.status, adminUser.body);
  console.log('\n✅ SEED FINALIZADO');
  console.log('Credencial: admin@correo.com / admin123');
}

seed().catch(console.error);