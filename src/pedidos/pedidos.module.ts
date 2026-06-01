import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosController } from './controllers/pedidos.controller';
import { PedidosService } from './services/pedidos.service';
import { Pedido } from './entities/pedido.entity';
import { PedidoItem } from './entities/pedido-item.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../productos/entities/product.entity';
import { Venue } from '../sedes/entities/venue.entity';
import { Resource } from '../resources/entities/resource.entity';
import { WebsocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      PedidoItem,
      User,
      Product,
      Venue,
      Resource,
    ]),
    WebsocketsModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
