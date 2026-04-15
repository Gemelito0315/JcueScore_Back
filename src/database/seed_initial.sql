-- Roles
INSERT INTO role (name, description) VALUES 
('ADMIN', 'Acceso total al sistema'),
('USUARIO', 'Acceso al panel de usuario'),
('GARITERO', 'Acceso al panel de garitero')
ON CONFLICT (name) DO NOTHING;

-- Módulos
INSERT INTO modules (name, description) VALUES
('users','Usuarios'),('roles','Roles'),('venues','Sedes'),
('billar','Billar'),('tejo','Tejo'),('bolirama','Bolirama'),
('reservations','Reservas'),('customers','Clientes'),
('inventory','Inventario'),('invoicing','Facturación'),
('reports','Reportes'),('settings','Configuración')
ON CONFLICT (name) DO NOTHING;

-- Asignar todos los módulos al rol ADMIN (id=1)
INSERT INTO role_modules ("roleId", "moduleId")
SELECT 1, id FROM modules
ON CONFLICT DO NOTHING;

-- Tipos de juego
INSERT INTO game_type (name, description, "isActive") VALUES
('Billar', 'Mesas de billar profesional', true),
('Tejo', 'Canchas de tejo', true),
('Bolirama', 'Máquinas de bolirama', true)
ON CONFLICT (name) DO NOTHING;

-- Sede principal
INSERT INTO venue (name, address, phone, "openingTime", "closingTime")
SELECT 'JcueScore Principal', 'Dirección principal', '3001234567', '08:00', '22:00'
WHERE NOT EXISTS (SELECT 1 FROM venue LIMIT 1);
