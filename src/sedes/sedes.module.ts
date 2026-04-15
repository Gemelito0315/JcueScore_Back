import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SedesService } from './services/sedes/sedes.service';
import { SedesController } from './controllers/sedes/sedes.controller';
import { Venue } from '../venues/entities/venue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venue])],
  providers: [SedesService],
  controllers: [SedesController],
  exports: [SedesService],
})
export class SedesModule {}
