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
  try{
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.club (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.venue (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255),
        city VARCHAR(100),
        phone VARCHAR(50),
        email VARCHAR(255),
        "openingTime" TIME,
        "closingTime" TIME,
        "clubId" INTEGER REFERENCES public.club(id)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.game_type (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT
      );
    `);
    console.log('Schemas ensured');
  } catch(err){
    console.error('Error creating schema:', err);
  } finally {
    await client.end();
  }
}
run();
