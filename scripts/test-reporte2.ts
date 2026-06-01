import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { OperacionesService } from '../src/operaciones/operaciones.service';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);
  try {
    const res = await ds.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'pedido_items'`);
    console.log('Columns in pedido_items:', res);
  } catch(e) {
    console.error('ERROR:', e);
  }
  await app.close();
}
bootstrap();
