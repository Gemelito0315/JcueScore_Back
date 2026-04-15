import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DeudasService {
  constructor(@InjectDataSource() private ds: DataSource) {}

  async findAll() {
    return this.ds.query(`
      SELECT d.*, u.name, u."lastName", u.email
      FROM deuda d
      JOIN public.user u ON d."userId" = u.id
      ORDER BY d."fechaCreacion" DESC
    `);
  }

  async findByUser(userId: number) {
    return this.ds.query(`
      SELECT * FROM deuda WHERE "userId" = $1 ORDER BY "fechaCreacion" DESC
    `, [userId]);
  }

  async create(data: { userId: number; descripcion: string; monto: number; notas?: string }) {
    const result = await this.ds.query(`
      INSERT INTO deuda ("userId", descripcion, monto, notas)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [data.userId, data.descripcion, data.monto, data.notas ?? null]);
    return result[0];
  }

  async registrarPago(id: number, montoPago: number) {
    const deuda = await this.ds.query(`SELECT * FROM deuda WHERE id = $1`, [id]);
    if (!deuda.length) throw new Error('Deuda no encontrada');
    const d = deuda[0];
    const nuevoPagado = parseFloat(d.montoPagado) + montoPago;
    const nuevoEstado = nuevoPagado >= parseFloat(d.monto) ? 'pagada' : 'parcial';
    const result = await this.ds.query(`
      UPDATE deuda SET "montoPagado" = $1, estado = $2, "fechaPago" = $3 WHERE id = $4 RETURNING *
    `, [nuevoPagado, nuevoEstado, nuevoEstado === 'pagada' ? new Date() : null, id]);
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
