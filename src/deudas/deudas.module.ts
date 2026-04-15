import { Module } from '@nestjs/common';
import { DeudasController } from './deudas.controller';
import { DeudasService } from './deudas.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DeudasController],
  providers: [DeudasService],
})
export class DeudasModule {}
