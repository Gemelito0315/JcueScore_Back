import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipamientoService } from './services/equipamiento/equipamiento.service';
import { EquipamientoController } from './controllers/equipamiento/equipamiento.controller';
import { Equipment } from '../equipamiento/entities/equipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment])],
  providers: [EquipamientoService],
  controllers: [EquipamientoController],
  exports: [EquipamientoService],
})
export class EquipamientoModule {}
