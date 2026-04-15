import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TorneosController } from './controllers/torneos.controller';
import { TorneosService } from './services/torneos.service';
import { Torneo } from './entities/torneo.entity';
import { InscripcionTorneo } from './entities/inscripcion-torneo.entity';
import { PartidoTorneo } from './entities/partido-torneo.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Torneo, InscripcionTorneo, PartidoTorneo, User])],
  controllers: [TorneosController],
  providers: [TorneosService],
  exports: [TorneosService],
})
export class TorneosModule {}
