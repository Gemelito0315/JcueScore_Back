import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosService } from './services/pagos/pagos.service';
import { PagosController } from './controllers/pagos/pagos.controller';
import { Payment } from '../pagos/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  providers: [PagosService],
  controllers: [PagosController],
  exports: [PagosService],
})
export class PagosModule {}
