const { DataSource } = require('typeorm');
const ds = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite'
});
ds.initialize().then(async () => {
  try {
    const res = await ds.query(`
      SELECT p.name, SUM(pi.cantidad) as cantidad, SUM(pi.subtotal) as subtotal
      FROM pedido_items pi
      JOIN pedidos ped ON pi."pedidoId" = ped.id
      JOIN product p ON pi."productId" = p.id
      WHERE ped.estado = 'entregado'
      GROUP BY p.name
    `);
    console.log('Success:', res);
  } catch(e) { console.error('Error:', e.message); }
  await ds.destroy();
});
