import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturasService } from './services/facturas/facturas.service';
import { FacturasController } from './controllers/facturas/facturas.controller';
import { Invoice } from '../facturas/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  providers: [FacturasService],
  controllers: [FacturasController],
  exports: [FacturasService],
})
export class FacturasModule {}
