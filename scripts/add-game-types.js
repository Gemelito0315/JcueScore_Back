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
    await client.query(`
      INSERT INTO public.game_type (name, description)
      SELECT 'Billar', 'Billar pool tradicional'
      WHERE NOT EXISTS (SELECT 1 FROM public.game_type WHERE name='Billar');
    `);
    await client.query(`
      INSERT INTO public.game_type (name, description)
      SELECT 'Tres Bandas', 'Billar a tres bandas'
      WHERE NOT EXISTS (SELECT 1 FROM public.game_type WHERE name='Tres Bandas');
    `);
    await client.query(`
      INSERT INTO public.game_type (name, description)
      SELECT 'Tejo', 'Juego de tejo tradicional'
      WHERE NOT EXISTS (SELECT 1 FROM public.game_type WHERE name='Tejo');
    `);
    await client.query(`
      INSERT INTO public.game_type (name, description)
      SELECT 'Bolirama', 'Máquina de bolirama'
      WHERE NOT EXISTS (SELECT 1 FROM public.game_type WHERE name='Bolirama');
    `);
    console.log('Game types ensured');
  }catch(err){
    console.error('Error:', err);
  }finally{
    await client.end();
  }
}
run();
