import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OperacionesService } from './operaciones/operaciones.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const svc = app.get(OperacionesService);
  try {
    const res = await svc.getResumenTurno(6);
    console.log("SUCCESS:", res);
  } catch (e) {
    console.error("ERROR:", e);
  }
  await app.close();
}
bootstrap();
