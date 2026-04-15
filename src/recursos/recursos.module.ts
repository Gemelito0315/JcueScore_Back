import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecursosService } from './services/recursos/recursos.service';
import { RecursosController } from './controllers/recursos/recursos.controller';
import { Resource } from '../resources/entities/resource.entity';
import { Partida } from '../partidas/entities/partida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resource, Partida])],
  providers: [RecursosService],
  controllers: [RecursosController],
  exports: [RecursosService],
})
export class RecursosModule {}
