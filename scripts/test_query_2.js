const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');

async function run() {
  await client.connect();
  
  const turnoRes = await client.query(`SELECT * FROM turno ORDER BY id DESC LIMIT 1`);
  const t = turnoRes.rows[0];

  const ingresosRes = await client.query(`
    SELECT COALESCE(SUM(total), 0) as total 
    FROM pedidos 
    WHERE estado = 'entregado' 
      AND "metodoPago" = 'efectivo' 
      AND "createdAt" >= $1 
      AND "createdAt" <= COALESCE($2, NOW())
  `, [t.horaInicio, t.horaFin]);
  const totalIngresosEfectivo = Number(ingresosRes.rows[0].total);

  const pagosDeudasRes = await client.query(`
    SELECT COALESCE(SUM(monto), 0) as total
    FROM pago_deuda
    WHERE "metodoPago" = 'efectivo'
      AND "fecha" >= $1
      AND "fecha" <= COALESCE($2, NOW())
  `, [t.horaInicio, t.horaFin]);
  const totalPagosDeudasEfectivo = Number(pagosDeudasRes.rows[0].total);

  const totalEfectivoEntrante = totalIngresosEfectivo + totalPagosDeudasEfectivo;
  
  const gastosRes = await client.query(`SELECT COALESCE(SUM(monto), 0) as total FROM gasto_interno WHERE "turnoId" = $1`, [t.id]);
  const totalGastos = Number(gastosRes.rows[0].total);

  const efectivoEsperado = Number(t.baseCaja) + totalEfectivoEntrante - totalGastos;

  console.log("=== RESULTADOS ===");
  console.log("totalIngresosEfectivo:", totalIngresosEfectivo);
  console.log("totalPagosDeudasEfectivo:", totalPagosDeudasEfectivo);
  console.log("efectivoEsperado:", efectivoEsperado);
  console.log("==================");

  await client.end();
}

run().catch(console.error);
