import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposJuegoService } from './services/tipos-juego/tipos-juego.service';
import { TiposJuegoController } from './controllers/tipos-juego/tipos-juego.controller';
import { GameType } from '../tipos-juego/entities/game-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameType])],
  providers: [TiposJuegoService],
  controllers: [TiposJuegoController],
  exports: [TiposJuegoService],
})
export class TiposJuegoModule {}
