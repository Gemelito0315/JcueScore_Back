import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class OperacionesService {
  constructor(@InjectDataSource() private ds: DataSource) {
    if (process.env.NODE_ENV === 'dev') {
      this.initDb();
    }
  }

  async initDb() {
    try {
      await this.ds.query(`
        CREATE TABLE IF NOT EXISTS llamado_atencion (
          id SERIAL PRIMARY KEY,
          "recursoId" INT,
          "usuarioId" INT,
          estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
          mensaje VARCHAR(255),
          hora TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS turno (
          id SERIAL PRIMARY KEY,
          "userId" INT,
          "baseCaja" DECIMAL,
          "valorHora" DECIMAL,
          "notasApertura" TEXT,
          "notasCierre" TEXT,
          "efectivoContado" DECIMAL,
          estado VARCHAR(20) NOT NULL DEFAULT 'abierto',
          "horaInicio" TIMESTAMP NOT NULL DEFAULT NOW(),
          "horaFin" TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS gasto_interno (
          id SERIAL PRIMARY KEY,
          "turnoId" INT,
          descripcion VARCHAR(255),
          monto DECIMAL,
          tipo VARCHAR(50),
          hora TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS transferencia (
          id SERIAL PRIMARY KEY,
          "turnoId" INT,
          cliente VARCHAR(255),
          monto DECIMAL,
          concepto VARCHAR(255),
          foto TEXT,
          hora TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS pago_deuda (
          id SERIAL PRIMARY KEY,
          "deudaId" INT,
          "turnoId" INT,
          monto DECIMAL NOT NULL,
          "metodoPago" VARCHAR(50) DEFAULT 'efectivo',
          fecha TIMESTAMP NOT NULL DEFAULT NOW()
        );

        -- FIX TIMEZONE ISSUES BY ALTERING COLUMNS TO TIMESTAMPTZ
        ALTER TABLE llamado_atencion ALTER COLUMN hora TYPE TIMESTAMPTZ USING hora AT TIME ZONE 'UTC';
        ALTER TABLE turno ALTER COLUMN "horaInicio" TYPE TIMESTAMPTZ USING "horaInicio" AT TIME ZONE 'UTC';
        ALTER TABLE turno ALTER COLUMN "horaFin" TYPE TIMESTAMPTZ USING "horaFin" AT TIME ZONE 'UTC';
        ALTER TABLE gasto_interno ALTER COLUMN hora TYPE TIMESTAMPTZ USING hora AT TIME ZONE 'UTC';
        ALTER TABLE pago_deuda ALTER COLUMN fecha TYPE TIMESTAMPTZ USING fecha AT TIME ZONE 'UTC';
        ALTER TABLE partidas ADD COLUMN IF NOT EXISTS "metodoPago" VARCHAR(50);
      `);
    } catch (e) {
      console.error('Error initializing table:', e);
    }
  }

  // ================= TURNO =================
  async getTurnoActivo() {
    const res = await this.ds.query(
      `SELECT *, NOW() as "serverTime" FROM turno WHERE estado = 'abierto' ORDER BY "horaInicio" DESC LIMIT 1`,
    );
    return res.length ? res[0] : null;
  }

  async abrirTurno(
    userId: number,
    baseCaja: number,
    valorHora: number,
    notasApertura?: string,
  ) {
    const activo = await this.getTurnoActivo();
    if (activo) throw new Error('Ya hay un turno abierto');

    const result = await this.ds.query(
      `
      INSERT INTO turno ("userId", "baseCaja", "valorHora", "notasApertura")
      VALUES ($1, $2, $3, $4) RETURNING *, NOW() as "serverTime"
    `,
      [userId, baseCaja, valorHora, notasApertura],
    );
    return result[0];
  }

  async cerrarTurno(
    turnoId: number,
    efectivoContado: number,
    notasCierre?: string,
  ) {
    const result = await this.ds.query(
      `
      UPDATE turno 
      SET estado = 'cerrado', "horaFin" = NOW(), "efectivoContado" = $1, "notasCierre" = $2
      WHERE id = $3 RETURNING *
    `,
      [efectivoContado, notasCierre, turnoId],
    );
    return result[0];
  }

  async getResumenTurno(turnoId: number) {
    const turno = await this.ds.query(`SELECT * FROM turno WHERE id = $1`, [turnoId]);
    if (!turno.length) throw new Error('Turno no encontrado');
    const t = turno[0];

    // Gastos
    const gastosRes = await this.ds.query(`SELECT COALESCE(SUM(monto), 0) as total FROM gasto_interno WHERE "turnoId" = $1`, [turnoId]);
    const totalGastos = Number(gastosRes[0].total);

    // Ingresos en efectivo (mesas + barra cobradas durante el tiempo de este turno)
    const ingresosRes = await this.ds.query(`
      SELECT COALESCE(SUM(total), 0) as total 
      FROM pedidos 
      WHERE estado = 'entregado' 
        AND "metodoPago" = 'efectivo' 
        AND "createdAt" >= $1 
        AND "createdAt" <= COALESCE($2, '2100-01-01'::timestamp)
    `, [t.horaInicio, t.horaFin]);
    let totalIngresosEfectivo = Number(ingresosRes[0].total);

    // Ingresos por transferencia (mesas + barra pedidos)
    const ingresosTransferenciaRes = await this.ds.query(`
      SELECT COALESCE(SUM(total), 0) as total 
      FROM pedidos 
      WHERE estado = 'entregado' 
        AND "metodoPago" IN ('nequi', 'daviplata', 'tarjeta') 
        AND "createdAt" >= $1 
        AND "createdAt" <= COALESCE($2, '2100-01-01'::timestamp)
    `, [t.horaInicio, t.horaFin]);
    let totalIngresosTransferencia = Number(ingresosTransferenciaRes[0].total);

    // INGRESO: Tiempo de mesas en efectivo
    const mesasEfectivoRes = await this.ds.query(`
      SELECT COALESCE(SUM("costoTotal"), 0) as total 
      FROM partidas
      WHERE estado = 'finalizada'
        AND "metodoPago" = 'efectivo'
        AND "horaFin" >= $1
        AND "horaFin" <= COALESCE($2, '2100-01-01'::timestamp)
    `, [t.horaInicio, t.horaFin]);
    totalIngresosEfectivo += Number(mesasEfectivoRes[0].total);

    // INGRESO: Tiempo de mesas en transferencia
    const mesasTransferenciaRes = await this.ds.query(`
      SELECT COALESCE(SUM("costoTotal"), 0) as total 
      FROM partidas
      WHERE estado = 'finalizada'
        AND "metodoPago" IN ('nequi', 'daviplata', 'tarjeta', 'transferencia')
        AND "horaFin" >= $1
        AND "horaFin" <= COALESCE($2, '2100-01-01'::timestamp)
    `, [t.horaInicio, t.horaFin]);
    totalIngresosTransferencia += Number(mesasTransferenciaRes[0].total);

    // Pagos de deudas en efectivo recibidos en este turno
    const pagosDeudasRes = await this.ds.query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pago_deuda
      WHERE "metodoPago" = 'efectivo'
        AND "fecha" >= $1
        AND "fecha" <= COALESCE($2, '2100-01-01'::timestamp)
    `, [t.horaInicio, t.horaFin]);
    const totalPagosDeudasEfectivo = Number(pagosDeudasRes[0].total);

    // Pagos de deudas por transferencia
    const pagosDeudasTransferenciaRes = await this.ds.query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pago_deuda
      WHERE "metodoPago" IN ('nequi', 'daviplata', 'tarjeta', 'transferencia')
        AND "fecha" >= $1
        AND "fecha" <= COALESCE($2, '2100-01-01'::timestamp)
    `, [t.horaInicio, t.horaFin]);
    const totalPagosDeudasTransferencia = Number(pagosDeudasTransferenciaRes[0].total);

    // Transferencias directas (módulo Transferencias)
    const transferenciasDirectasRes = await this.ds.query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM transferencia
      WHERE "turnoId" = $1
    `, [turnoId]);
    const totalTransferenciasDirectas = Number(transferenciasDirectasRes[0].total);

    // Total Transferencias Entrantes
    const totalTransferenciasEntrantes = totalIngresosTransferencia + totalPagosDeudasTransferencia + totalTransferenciasDirectas;

    // Total Cash Received
    const totalEfectivoEntrante = totalIngresosEfectivo + totalPagosDeudasEfectivo;

    // Sueldo: difference in hours * valorHora
    const endTime = t.horaFin || new Date();
    const diffMs = endTime.getTime() - t.horaInicio.getTime();
    const hours = diffMs / 3600000;
    const sueldoEstimado = Math.round(hours * Number(t.valorHora || 0));

    // Base + Entrante - Saliente(Gastos)
    const efectivoEsperado = Number(t.baseCaja || 0) + totalEfectivoEntrante - totalGastos;

    return {
      turno: t,
      totalGastos,
      totalIngresosEfectivo,
      totalPagosDeudasEfectivo,
      totalEfectivoEntrante,
      totalIngresosTransferencia,
      totalPagosDeudasTransferencia,
      totalTransferenciasEntrantes,
      sueldoEstimado,
      efectivoEsperado,
      horasTrabajadas: hours
    };
  }

  async getTurnoReporteDetallado(turnoId: number) {
    const resumen = await this.getResumenTurno(turnoId);
    const t = resumen.turno;

    // Productos vendidos
    const productosRes = await this.ds.query(`
      SELECT p.name, SUM(pi.cantidad) as cantidad, SUM(pi.subtotal) as subtotal
      FROM pedido_items pi
      JOIN pedidos ped ON pi."pedidoId" = ped.id
      JOIN product p ON pi."productId" = p.id
      WHERE ped.estado = 'entregado'
        AND ped."createdAt" >= $1
        AND ped."createdAt" <= COALESCE($2, '2100-01-01'::timestamp)
      GROUP BY p.name
      ORDER BY cantidad DESC
    `, [t.horaInicio, t.horaFin]);

    // Mesas cobradas
    const mesasRes = await this.ds.query(`
      SELECT r.code as mesa, SUM(ped.total) as total
      FROM pedidos ped
      JOIN resource r ON ped."recursoId" = r.id
      WHERE ped.estado = 'entregado'
        AND ped."recursoId" IS NOT NULL
        AND ped."createdAt" >= $1
        AND ped."createdAt" <= COALESCE($2, '2100-01-01'::timestamp)
      GROUP BY r.code
      ORDER BY total DESC
    `, [t.horaInicio, t.horaFin]);
    // Tiempo de mesas cobrado
    const tiempoMesasRes = await this.ds.query(`
      SELECT r.code as mesa, SUM(p."costoTotal") as total
      FROM partidas p
      JOIN resource r ON p."recursoId" = r.id
      WHERE p.estado = 'finalizada'
        AND p."metodoPago" IS NOT NULL
        AND p."metodoPago" != 'deuda'
        AND p."horaFin" >= $1
        AND p."horaFin" <= COALESCE($2, '2100-01-01'::timestamp)
      GROUP BY r.code
      ORDER BY total DESC
    `, [t.horaInicio, t.horaFin]);
    // Deudas cobradas detalladas
    const deudasRes = await this.ds.query(`
      SELECT 
        d.descripcion, 
        d."nombreCliente", 
        u.name as "usuarioName", 
        u."lastName" as "usuarioLastName", 
        pd.monto, 
        pd."metodoPago"
      FROM pago_deuda pd
      JOIN deuda d ON pd."deudaId" = d.id
      LEFT JOIN "user" u ON d."userId" = u.id
      WHERE pd."fecha" >= $1
        AND pd."fecha" <= COALESCE($2, '2100-01-01'::timestamp)
      ORDER BY pd."fecha" DESC
    `, [t.horaInicio, t.horaFin]);

    return {
      ...resumen,
      productosVendidos: productosRes,
      mesasCobradas: mesasRes,
      tiempoMesas: tiempoMesasRes,
      deudasCobradasList: deudasRes
    };
  }

  // ================= CAJA (GASTOS INTERNOS) =================
  async getGastos(turnoId: number) {
    return this.ds.query(
      `SELECT * FROM gasto_interno WHERE "turnoId" = $1 ORDER BY hora DESC`,
      [turnoId],
    );
  }

  async addGasto(
    turnoId: number,
    descripcion: string,
    monto: number,
    tipo: string,
  ) {
    const result = await this.ds.query(
      `
      INSERT INTO gasto_interno ("turnoId", descripcion, monto, tipo)
      VALUES ($1, $2, $3, $4) RETURNING *
    `,
      [turnoId, descripcion, monto, tipo],
    );
    return result[0];
  }

  async deleteGasto(id: number) {
    return this.ds.query(`DELETE FROM gasto_interno WHERE id = $1`, [id]);
  }

  // ================= TRANSFERENCIAS =================
  async getTransferencias(turnoId: number) {
    return this.ds.query(
      `SELECT * FROM transferencia WHERE "turnoId" = $1 ORDER BY hora DESC`,
      [turnoId],
    );
  }

  async addTransferencia(
    turnoId: number,
    cliente: string,
    monto: number,
    concepto: string,
    foto?: string,
  ) {
    const result = await this.ds.query(
      `
      INSERT INTO transferencia ("turnoId", cliente, monto, concepto, foto)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `,
      [turnoId, cliente, monto, concepto, foto],
    );
    return result[0];
  }

  async deleteTransferencia(id: number) {
    return this.ds.query(`DELETE FROM transferencia WHERE id = $1`, [id]);
  }

  async getTurnos() {
    const turnosRows = await this.ds.query(`SELECT id FROM turno ORDER BY "horaInicio" DESC`);
    const turnos: any[] = [];

    for (const r of turnosRows) {
      try {
        const resumen = await this.getResumenTurno(r.id);
        const t = resumen.turno;
        
        // Calcular deudas generadas en este turno (para mostrar la métrica)
        const deudasGeneradasRes = await this.ds.query(`
          SELECT COALESCE(SUM(monto), 0) as total 
          FROM deuda 
          WHERE "fechaCreacion" >= $1 
            AND "fechaCreacion" <= COALESCE($2, '2100-01-01'::timestamp)
        `, [t.horaInicio, t.horaFin]);
        const totalDeudas = Number(deudasGeneradasRes[0].total);

        // Ventas = Efectivo Entrante + Transferencias + Deudas generadas (sin restar gastos ni saldos iniciales)
        const totalVentas = resumen.totalIngresosEfectivo + resumen.totalIngresosTransferencia + totalDeudas;

        const saldoFinal = t.estado === 'abierto' ? 0 : Number(t.baseCaja || 0) + resumen.totalEfectivoEntrante - resumen.totalGastos;
        const diferencia = t.estado === 'abierto' ? 0 : Number(t.efectivoContado || 0) - saldoFinal;

        const userName = await this.ds.query(`SELECT name, "lastName" FROM "user" WHERE id = $1`, [t.userId]);

        turnos.push({
          id: t.id,
          garitero: userName.length ? `${userName[0].name} ${userName[0].lastName || ''}`.trim() : 'Desconocido',
          fechaApertura: t.horaInicio ? new Date(t.horaInicio).toISOString().split('T')[0] : '',
          fechaCierre: t.horaFin ? new Date(t.horaFin).toISOString().split('T')[0] : null,
          horaApertura: t.horaInicio ? new Date(t.horaInicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
          horaCierre: t.horaFin ? new Date(t.horaFin).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }) : null,
          saldoInicial: Number(t.baseCaja || 0),
          totalVentas,
          totalEfectivo: resumen.totalIngresosEfectivo, // Efectivo directamente de ventas (no cuenta base caja ni pagos de deudas de otros turnos)
          totalTransferencia: resumen.totalTransferenciasEntrantes,
          totalDeudas,
          gastos: resumen.totalGastos,
          saldoFinal,
          diferencia,
          estado: t.estado === 'abierto' ? 'abierto' : (diferencia === 0 ? 'cuadrado' : 'cerrado'),
          observaciones: t.estado === 'abierto' ? (t.notasApertura || 'Turno en curso.') : (t.notasCierre || 'Turno cerrado sin novedades.')
        });
      } catch(e) {
        console.error('Error cargando resumen de turno', r.id, e);
      }
    }
    return turnos;
  }

  async crearLlamado(recursoId: number, usuarioId: number, mensaje: string) {
    const res = await this.ds.query(
      `
      INSERT INTO llamado_atencion ("recursoId", "usuarioId", mensaje)
      VALUES ($1, $2, $3) RETURNING *
    `,
      [recursoId, usuarioId, mensaje],
    );
    return res[0];
  }

  async obtenerLlamadosActivos() {
    return this.ds.query(`
      SELECT l.*, r.code as "recursoCode", u.name as "usuarioName", u."lastName" as "usuarioLastName"
      FROM llamado_atencion l
      LEFT JOIN resource r ON l."recursoId" = r.id
      LEFT JOIN "user" u ON l."usuarioId" = u.id
      WHERE l.estado = 'pendiente'
      ORDER BY l.hora ASC
    `);
  }

  async atenderLlamado(id: number) {
    const res = await this.ds.query(
      `
      UPDATE llamado_atencion
      SET estado = 'atendido'
      WHERE id = $1 RETURNING *
    `,
      [id],
    );

    const atendido = res[0];

    // Si el llamado era para una mesa (tiene recursoId), rechazar/cancelar otros llamados pendientes para la misma mesa
    if (atendido && atendido.recursoId) {
      await this.ds.query(
        `
        UPDATE llamado_atencion
        SET estado = 'rechazado'
        WHERE "recursoId" = $1 AND id != $2 AND estado = 'pendiente'
      `,
        [atendido.recursoId, id],
      );
    }

    return atendido;
  }
}
