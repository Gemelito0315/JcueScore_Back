import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { OperacionesService } from '../src/operaciones/operaciones.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const svc = app.get(OperacionesService);
  try {
    const turnos = await svc.getTurnos();
    const active = turnos.find(t => t.estado === 'abierto') || turnos[0];
    if (active) {
      console.log('Testing shift', active.id);
      const rep = await svc.getTurnoReporteDetallado(active.id);
      console.log('Success:', JSON.stringify(rep).substring(0, 500));
    } else {
      console.log('No shifts found');
    }
  } catch(e) {
    console.error('ERROR:', e.message);
  }
  await app.close();
}
bootstrap();
