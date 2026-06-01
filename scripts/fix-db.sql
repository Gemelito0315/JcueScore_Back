-- ====================================================
-- FIX COMPLETO BASE DE DATOS JcueScore
-- ====================================================

-- 1. Renombrar "Player" a "Usuario" para consistencia con el frontend
UPDATE role SET name = 'Usuario', description = 'Jugador registrado. Puede reservar mesas y ver productos' WHERE id = 2;

-- 2. Crear rol Garitero (id=3) si no existe
INSERT INTO role (id, name, description)
VALUES (3, 'Garitero', 'Operador de turno. Gestiona caja, mesas y ventas')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Resetear la secuencia del rol para evitar conflictos futuros
SELECT setval(pg_get_serial_sequence('role', 'id'), GREATEST((SELECT MAX(id) FROM role), 3));

-- 3. Asignar TODOS los módulos al rol Admin (id=1)
-- Borrar asignaciones previas del admin (si existen)
DELETE FROM role_modules WHERE role_id = 1;

-- Insertar todos los módulos para Admin
INSERT INTO role_modules (role_id, module_id)
SELECT 1, id FROM modules;

-- 4. Asignar módulos al rol Garitero (id=3)
DELETE FROM role_modules WHERE role_id = 3;

INSERT INTO role_modules (role_id, module_id)
SELECT 3, id FROM modules WHERE name IN ('caja', 'mesas', 'reservas', 'productos', 'deudas', 'partidas', 'pedidos', 'leaderboard');

-- 5. Asignar módulos al rol Usuario (id=2)
DELETE FROM role_modules WHERE role_id = 2;

INSERT INTO role_modules (role_id, module_id)
SELECT 2, id FROM modules WHERE name IN ('reservas', 'productos', 'leaderboard', 'deudas', 'pedidos', 'perfil');

-- 6. Asignar rol Garitero (id=3) a Pedro
DELETE FROM user_roles WHERE "userId" = 4;
INSERT INTO user_roles ("userId", "roleId") VALUES (4, 3);

-- 7. Asignar rol Usuario (id=2) a los usuarios demo sin rol
INSERT INTO user_roles ("userId", "roleId")
SELECT u.id, 2
FROM "user" u
WHERE u.id NOT IN (SELECT "userId" FROM user_roles)
ON CONFLICT DO NOTHING;

-- ====================================================
-- VERIFICACIÓN FINAL
-- ====================================================
SELECT '=== ROLES ===' as resultado;
SELECT id, name, description FROM role ORDER BY id;

SELECT '=== ROLE_MODULES ===' as resultado;
SELECT r.name as rol, m.name as modulo
FROM role_modules rm
JOIN role r ON rm.role_id = r.id
JOIN modules m ON rm.module_id = m.id
ORDER BY r.id, m.name;

SELECT '=== USUARIOS CON ROLES ===' as resultado;
SELECT u.id, u.name, u.email, r.name as rol
FROM "user" u
LEFT JOIN user_roles ur ON u.id = ur."userId"
LEFT JOIN role r ON ur."roleId" = r.id
ORDER BY u.id;
