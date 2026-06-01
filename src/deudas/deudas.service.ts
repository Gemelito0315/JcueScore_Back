import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DeudasService {
  constructor(@InjectDataSource() private ds: DataSource) {
    this.initDb();
  }

  async initDb() {
    try {
      await this.ds.query(`
        ALTER TABLE deuda 
        ADD COLUMN IF NOT EXISTS "nombreCliente" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "telefonoCliente" VARCHAR(50),
        ADD COLUMN IF NOT EXISTS "esExterno" BOOLEAN DEFAULT FALSE;
      `);
    } catch (e) {
      console.error('Error initializing deuda table:', e);
    }
  }

  async findAll() {
    return this.ds.query(`
      SELECT d.*, u.name, u."lastName", u.email
      FROM deuda d
      LEFT JOIN public.user u ON d."userId" = u.id
      ORDER BY d."fechaCreacion" DESC
    `);
  }

  async findByUser(userId: number) {
    return this.ds.query(
      `
      SELECT * FROM deuda WHERE "userId" = $1 ORDER BY "fechaCreacion" DESC
    `,
      [userId],
    );
  }

  async create(data: {
    userId?: number;
    descripcion: string;
    monto: number;
    notas?: string;
    nombreCliente?: string;
    telefonoCliente?: string;
    esExterno?: boolean;
  }) {
    const result = await this.ds.query(
      `
      INSERT INTO deuda ("userId", descripcion, monto, notas, "nombreCliente", "telefonoCliente", "esExterno")
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `,
      [data.userId ?? null, data.descripcion, data.monto, data.notas ?? null, data.nombreCliente ?? null, data.telefonoCliente ?? null, data.esExterno ?? false],
    );
    return result[0];
  }

  async registrarPago(id: number, montoPago: number, metodoPago: string = 'efectivo') {
    const deuda = await this.ds.query(`SELECT * FROM deuda WHERE id = $1`, [
      id,
    ]);
    if (!deuda.length) throw new Error('Deuda no encontrada');
    const d = deuda[0];
    
    // El monto real abonado no puede superar lo que falta por pagar
    const pendiente = parseFloat(d.monto) - parseFloat(d.montoPagado);
    const abonoReal = Math.min(montoPago, pendiente);

    const nuevoPagado = parseFloat(d.montoPagado) + abonoReal;
    const nuevoEstado =
      nuevoPagado >= parseFloat(d.monto) ? 'pagada' : 'parcial';
    const result = await this.ds.query(
      `
      UPDATE deuda SET "montoPagado" = $1, estado = $2, "fechaPago" = $3 WHERE id = $4 RETURNING *
    `,
      [
        nuevoPagado,
        nuevoEstado,
        nuevoEstado === 'pagada' ? new Date() : null,
        id,
      ],
    );

    // Buscar si hay un turno activo
    const turnoRes = await this.ds.query(`SELECT id FROM turno WHERE estado = 'abierto' ORDER BY "horaInicio" DESC LIMIT 1`);
    if (turnoRes.length > 0) {
      await this.ds.query(
        `INSERT INTO pago_deuda ("deudaId", "turnoId", monto, "metodoPago", fecha) VALUES ($1, $2, $3, $4, NOW())`,
        [id, turnoRes[0].id, abonoReal, metodoPago]
      );
    }

    return result[0];
  }

  async delete(id: number) {
    return this.ds.query(`DELETE FROM deuda WHERE id = $1`, [id]);
  }

  async getSummary() {
    const result = await this.ds.query(`
      SELECT 
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'parcial') as parciales,
        COUNT(*) FILTER (WHERE estado = 'pagada') as pagadas,
        COALESCE(SUM(monto - "montoPagado") FILTER (WHERE estado != 'pagada'), 0) as total_pendiente
      FROM deuda
    `);
    return result[0];
  }
}
