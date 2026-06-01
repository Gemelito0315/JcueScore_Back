-- Crear tabla de deudas si no existe
CREATE TABLE IF NOT EXISTS deuda (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    descripcion VARCHAR(500) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    "montoPagado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    notas TEXT,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaPago" TIMESTAMP
);

-- Verificar todas las tablas
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
