const { Client } = require('pg');

const client = new Client({
  user: 'root',
  host: '127.0.0.1',
  database: 'JcueScore_Db',
  password: '123456',
  port: 5432,
});

async function run() {
  await client.connect();
  console.log('Conectado a la base de datos para la inicialización básica...');

  try {
    // 1. Crear tabla deuda si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS deuda (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES public."user"(id) ON DELETE CASCADE,
        descripcion VARCHAR(500) NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        "montoPagado" DECIMAL(10,2) NOT NULL DEFAULT 0,
        estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
        notas TEXT,
        "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
        "fechaPago" TIMESTAMP,
        CONSTRAINT chk_estado CHECK (estado IN ('pendiente','parcial','pagada'))
      );
    `);
    console.log('Tabla "deuda" verificada/creada.');

    // 2. Insertar roles básicos
    await client.query(`
      INSERT INTO public.role (id, name, description) VALUES
      (1, 'ADMIN', 'Acceso total al sistema'),
      (2, 'USUARIO', 'Acceso al panel de usuario'),
      (3, 'GARITERO', 'Acceso al panel de garitero')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
    `);
    console.log('Roles básicos verificados/creados.');

    // 3. Insertar módulos básicos
    const modules = [
      'users', 'roles', 'venues', 'billar', 'tejo', 'bolirama', 
      'reservations', 'customers', 'inventory', 'invoicing', 'reports', 'settings',
      'caja', 'mesas', 'reservas', 'productos', 'deudas', 'partidas', 'pedidos', 
      'leaderboard', 'perfil'
    ];

    for (const modName of modules) {
      await client.query(`
        INSERT INTO public.modules (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING;
      `, [modName, `Módulo ${modName}`]);
    }
    console.log('Módulos básicos verificados/creados.');

    // 4. Asignar módulos a Admin (id=1)
    await client.query(`DELETE FROM public.role_modules WHERE role_id = 1;`);
    await client.query(`
      INSERT INTO public.role_modules (role_id, module_id)
      SELECT 1, id FROM public.modules;
    `);
    console.log('Módulos asignados a Admin.');

    // 5. Asignar módulos a Garitero (id=3)
    await client.query(`DELETE FROM public.role_modules WHERE role_id = 3;`);
    await client.query(`
      INSERT INTO public.role_modules (role_id, module_id)
      SELECT 3, id FROM public.modules 
      WHERE name IN ('caja', 'mesas', 'reservas', 'productos', 'deudas', 'partidas', 'pedidos', 'leaderboard');
    `);
    console.log('Módulos asignados a Garitero.');

    // 6. Asignar módulos a Usuario (id=2)
    await client.query(`DELETE FROM public.role_modules WHERE role_id = 2;`);
    await client.query(`
      INSERT INTO public.role_modules (role_id, module_id)
      SELECT 2, id FROM public.modules 
      WHERE name IN ('reservas', 'productos', 'leaderboard', 'deudas', 'pedidos', 'perfil');
    `);
    console.log('Módulos asignados a Usuario.');

    // Resetear las secuencias
    await client.query(`SELECT setval(pg_get_serial_sequence('role', 'id'), COALESCE((SELECT MAX(id) FROM public.role), 1));`);
    await client.query(`SELECT setval(pg_get_serial_sequence('modules', 'id'), COALESCE((SELECT MAX(id) FROM public.modules), 1));`);
    console.log('Secuencias de bases de datos reseteadas.');

    console.log('Inicialización básica de base de datos COMPLETADA.');
  } catch (err) {
    console.error('Error durante la inicialización:', err);
  } finally {
    await client.end();
  }
}

run();
