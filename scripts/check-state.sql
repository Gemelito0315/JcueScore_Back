-- Verificar estado actual
SELECT 'ROLES:' as info;
SELECT id, name FROM role ORDER BY id;

SELECT 'MODULES:' as info;
SELECT id, name FROM modules ORDER BY id;

SELECT 'USERS:' as info;
SELECT u.id, u.name, u.email FROM "user" u ORDER BY u.id;

SELECT 'USER_ROLES:' as info;
SELECT ur."userId", ur."roleId" FROM user_roles ur ORDER BY ur."userId";

SELECT 'ROLE_MODULES:' as info;
SELECT rm.role_id, rm.module_id FROM role_modules rm ORDER BY rm.role_id;
