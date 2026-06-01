const { Client } = require('pg');

const client = new Client({
  user: 'root',
  host: '127.0.0.1',
  database: 'JcueScore_Db',
  password: '123456',
  port: 5432,
});

async function run() {
  await client.connect();
  console.log('Conectado a la base de datos');

  try {
    // 1. Forzar que la sede principal tenga el ID = 1
    await client.query(`
      UPDATE public.venue SET id = 1 WHERE name = 'Sede Principal';
    `);
    console.log('Venue forzado a ID 1');

    // 2. Asegurar Product Categories
    await client.query(`
      INSERT INTO public.product_category (name, description, "isActive")
      SELECT 'Bebidas', 'Bebidas', true
      WHERE NOT EXISTS (SELECT 1 FROM public.product_category WHERE name = 'Bebidas');
      
      INSERT INTO public.product_category (name, description, "isActive")
      SELECT 'Snacks', 'Snacks', true
      WHERE NOT EXISTS (SELECT 1 FROM public.product_category WHERE name = 'Snacks');
    `);
    console.log('Product Category insertado');

    // 3. Asegurar Product Subcategories
    await client.query(`
      INSERT INTO public.product_subcategory ("categoryId", name, description, "isActive")
      SELECT (SELECT id FROM public.product_category WHERE name='Bebidas' LIMIT 1), 'Gaseosas', 'Bebidas carbonatadas', true
      WHERE NOT EXISTS (SELECT 1 FROM public.product_subcategory WHERE name = 'Gaseosas');

      INSERT INTO public.product_subcategory ("categoryId", name, description, "isActive")
      SELECT (SELECT id FROM public.product_category WHERE name='Bebidas' LIMIT 1), 'Cervezas', 'Bebidas alcoholicas', true
      WHERE NOT EXISTS (SELECT 1 FROM public.product_subcategory WHERE name = 'Cervezas');

      INSERT INTO public.product_subcategory ("categoryId", name, description, "isActive")
      SELECT (SELECT id FROM public.product_category WHERE name='Snacks' LIMIT 1), 'Paquetes', 'Papas y snacks', true
      WHERE NOT EXISTS (SELECT 1 FROM public.product_subcategory WHERE name = 'Paquetes');
    `);
    console.log('Product Subcategory insertado');

    // 4. Asegurar Product Types
    await client.query(`
      INSERT INTO public.product_type ("subcategoryId", name, description, "isActive")
      SELECT (SELECT id FROM public.product_subcategory WHERE name='Gaseosas' LIMIT 1), 'Cola', 'Gaseosas oscuras', true
      WHERE NOT EXISTS (SELECT 1 FROM public.product_type WHERE name = 'Cola');

      INSERT INTO public.product_type ("subcategoryId", name, description, "isActive")
      SELECT (SELECT id FROM public.product_subcategory WHERE name='Cervezas' LIMIT 1), 'Lager', 'Cervezas claras', true
      WHERE NOT EXISTS (SELECT 1 FROM public.product_type WHERE name = 'Lager');

      INSERT INTO public.product_type ("subcategoryId", name, description, "isActive")
      SELECT (SELECT id FROM public.product_subcategory WHERE name='Paquetes' LIMIT 1), 'Papas', 'Papas fritas', true
      WHERE NOT EXISTS (SELECT 1 FROM public.product_type WHERE name = 'Papas');
    `);
    console.log('Product Type insertado');

    console.log('Base de datos arreglada. TODO LISTO.');

  } catch (err) {
    console.error('Error insertando datos:', err);
  } finally {
    await client.end();
  }
}

run();
