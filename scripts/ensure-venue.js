const { Client } = require('pg');

const client = new Client({
  user: 'root',
  host: '127.0.0.1',
  database: 'JcueScore_Db',
  password: '123456',
  port: 5432,
});

async function run(){
  await client.connect();
  console.log('Conectado a DB');
  try{
    // Asegurar que la columna clubId exista en venue
    await client.query(`
      ALTER TABLE public.venue ADD COLUMN IF NOT EXISTS "clubId" INTEGER;
    `);
    // Añadir FK si no existe (PostgreSQL no tiene IF NOT EXISTS para FK, usar ignore con catch)
    try {
      await client.query(`
        ALTER TABLE public.venue ADD CONSTRAINT venue_club_fk FOREIGN KEY ("clubId") REFERENCES public.club(id);
      `);
    } catch(e) { console.log('FK may already exist, ignoring'); }

    // Insert club with id 1 if not exists
    await client.query(`
      INSERT INTO public.club (id, name, description)
      SELECT 1, 'JcueScore Elite', 'Club principal'
      WHERE NOT EXISTS (SELECT 1 FROM public.club WHERE id = 1);
    `);
    // Insert venue with id 1 linked to club 1 if not exists
    await client.query(`
      INSERT INTO public.venue (id, name, address, city, phone, email, "openingTime", "closingTime", "clubId")
      SELECT 1, 'Sede Principal', 'Calle 123 #45-67', 'Bogotá', '3001234567', 'principal@jcuescore.com', '10:00:00', '23:00:00', 1
      WHERE NOT EXISTS (SELECT 1 FROM public.venue WHERE id = 1);
    `);
    console.log('Club y sede asegurados con id 1');
  }catch(err){
    console.error('Error:', err);
  }finally{
    await client.end();
  }
}
run();
