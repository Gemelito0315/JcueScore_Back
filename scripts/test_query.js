const { Client } = require('pg');
const client = new Client('postgresql://root:123456@127.0.0.1:5432/JcueScore_Db');

async function run() {
  await client.connect();
  
  // Get latest active turno
  const resTurno = await client.query(`SELECT * FROM turno ORDER BY id DESC LIMIT 1`);
  const t = resTurno.rows[0];
  console.log("Turno Activo:", t);

  // Get total pagos deudas
  const pagosDeudasRes = await client.query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pago_deuda
      WHERE "metodoPago" = 'efectivo'
        AND "fecha" >= $1
        AND "fecha" <= COALESCE($2, NOW())
  `, [t.horaInicio, t.horaFin]);
  console.log("Total Pagos Deudas Efectivo:", pagosDeudasRes.rows[0]);

  await client.end();
}

run().catch(console.error);
