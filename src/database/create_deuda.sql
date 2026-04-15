CREATE TABLE IF NOT EXISTS deuda (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES public.user(id),
  descripcion VARCHAR(500) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  "montoPagado" DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
  "fechaPago" TIMESTAMP,
  CONSTRAINT chk_estado CHECK (estado IN ('pendiente','parcial','pagada'))
);
