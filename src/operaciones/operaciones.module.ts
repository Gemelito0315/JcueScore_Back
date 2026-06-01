import { Module } from '@nestjs/common';
import { OperacionesService } from './operaciones.service';
import { OperacionesController } from './operaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [],
  providers: [OperacionesService],
  controllers: [OperacionesController],
})
export class OperacionesModule {}
