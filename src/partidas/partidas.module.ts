import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartidasController } from './controllers/partidas.controller';
import { PartidasService } from './services/partidas.service';
import { Partida } from './entities/partida.entity';
import { Resource } from '../resources/entities/resource.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Partida, Resource, User])],
  controllers: [PartidasController],
  providers: [PartidasService],
  exports: [PartidasService],
})
export class PartidasModule {}
