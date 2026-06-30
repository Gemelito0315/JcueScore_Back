import { Module } from '@nestjs/common';
import { MantenimientoController } from './mantenimiento.controller';
import { MantenimientoService } from './mantenimiento.service';
import { WebsocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [WebsocketsModule],
  controllers: [MantenimientoController],
  providers: [MantenimientoService],
  exports: [MantenimientoService],
})
export class MantenimientoModule {}
