import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, In, DataSource } from 'typeorm';
import { Pedido, EstadoPedido, MetodoPago } from '../entities/pedido.entity';
import { PedidoItem } from '../entities/pedido-item.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../productos/entities/product.entity';
import { WebsocketsGateway } from '../../websockets/websockets.gateway';
import { PushNotificationsService } from '../../users/services/push-notifications/push-notifications.service';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(PedidoItem)
    private pedidoItemRepository: Repository<PedidoItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private wsGateway: WebsocketsGateway,
    private pushNotificationsService: PushNotificationsService,
    private dataSource: DataSource,
  ) {}

  async findAll(usuarioId: number, role: string, query?: { usuarioId?: number; gariteroId?: number }) {
    if (role === 'admin' || role === 'garitero') {
      const where: any = {};
      if (query?.usuarioId) {
        where.usuarioId = query.usuarioId;
      }
      if (query?.gariteroId) {
        where.gariteroId = query.gariteroId;
      }
      return this.pedidoRepository.find({
        where,
        relations: ['usuario', 'items', 'items.product', 'recurso', 'venue'],
        order: { createdAt: 'DESC' },
      });
    } else {
      // Un usuario normal SOLO puede ver sus propios pedidos, ignorando cualquier intento de suplantación
      return this.pedidoRepository.find({
        where: { usuarioId },
        relations: ['items', 'items.product', 'recurso', 'venue'],
        order: { createdAt: 'DESC' },
      });
    }
  }

  async findActiveOrders() {
    return this.pedidoRepository.find({
      where: {
        estado: In([
          EstadoPedido.PENDIENTE,
          EstadoPedido.EN_PREPARACION,
          EstadoPedido.LISTO,
        ]),
      },
      relations: ['usuario', 'items', 'items.product', 'recurso', 'venue'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByTable(recursoId: number) {
    return this.pedidoRepository.find({
      where: {
        recursoId,
        estado: In([
          EstadoPedido.PENDIENTE,
          EstadoPedido.EN_PREPARACION,
          EstadoPedido.LISTO,
        ]),
      },
      relations: ['usuario', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.pedidoRepository.findOne({
      where: { id },
      relations: [
        'usuario',
        'items',
        'items.product',
        'recurso',
        'venue',
        'garitero',
      ],
    });
  }

  async create(usuarioId: number, createPedidoDto: any) {
    const { items, recursoId, notas, metodoPago, direccionEntrega } =
      createPedidoDto;

    // Validar usuario, si no existe usar usuario 1 (admin/default) por fallback
    let usuario = await this.userRepository.findOne({
      where: { id: usuarioId },
    });
    if (!usuario) {
      usuario = await this.userRepository.findOne({ where: { id: 1 } });
      usuarioId = 1;
    }
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    // Geolocation Validation
    const origen = createPedidoDto.metadata?.origen;
    if (origen !== 'barra' && origen !== 'admin') {
      if (createPedidoDto.userLat && createPedidoDto.userLng) {
        try {
          const rows = await this.dataSource.query(
            `SELECT value FROM app_settings WHERE key = 'configuracion'`,
          );
          if (rows.length > 0) {
            const config = JSON.parse(rows[0].value);
            if (config.ubicacion && config.ubicacion.lat && config.ubicacion.lng) {
              const R = 6371e3; // metres
              const φ1 = (config.ubicacion.lat * Math.PI) / 180; // φ, λ in radians
              const φ2 = (createPedidoDto.userLat * Math.PI) / 180;
              const Δφ = ((createPedidoDto.userLat - config.ubicacion.lat) * Math.PI) / 180;
              const Δλ = ((createPedidoDto.userLng - config.ubicacion.lng) * Math.PI) / 180;

              const a =
                Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

              const distance = R * c; // in metres

              if (distance > 50) {
                throw new BadRequestException('Debes estar en el establecimiento (a menos de 50 metros) para realizar pedidos.');
              }
            }
          }
        } catch (e) {
          if (e instanceof BadRequestException) throw e;
          console.error('Error checking geolocation:', e.message);
        }
      } else {
         const rows = await this.dataSource.query(
            `SELECT value FROM app_settings WHERE key = 'configuracion'`,
          );
          if (rows.length > 0) {
            const config = JSON.parse(rows[0].value);
            if (config.ubicacion && config.ubicacion.lat && config.ubicacion.lng) {
               throw new BadRequestException('Se requiere habilitar el GPS y estar en el establecimiento para realizar pedidos desde tu celular.');
            }
          }
      }
    }

    // Validar productos y stock
    let subtotal = 0;
    const pedidoItems: any[] = [];

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId, isActive: true },
      });

      if (!product) {
        throw new NotFoundException(
          `Producto #${item.productId} no encontrado`,
        );
      }

      if (product.stock < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.name}`,
        );
      }

      const itemSubtotal = item.cantidad * product.price;
      subtotal += itemSubtotal;

      // Actualizar stock
      product.stock -= item.cantidad;
      await this.productRepository.save(product);

      pedidoItems.push({
        productId: item.productId,
        cantidad: item.cantidad,
        precioUnitario: product.price,
        subtotal: itemSubtotal,
        notas: item.notas,
        personalizaciones: item.personalizaciones,
      });
    }

    // Calcular totales
    const impuestos = subtotal * 0.19; // 19% IVA
    const total = subtotal + impuestos;

    // Crear pedido
    const pedido = this.pedidoRepository.create({
      usuarioId,
      venueId: 1, // Asociar al club 1 por defecto
      recursoId,
      estado: EstadoPedido.PENDIENTE,
      metodoPago,
      subtotal,
      impuestos,
      total,
      pagado: 0,
      notas,
      direccionEntrega,
      metadata: {
        origen: 'app',
        prioridad: 'normal',
        canalNotificacion: 'app',
      },
    });

    const savedPedido = await this.pedidoRepository.save(pedido);

    // Crear items del pedido
    for (const item of pedidoItems) {
      const pedidoItem = this.pedidoItemRepository.create({
        pedidoId: savedPedido.id,
        ...item,
      });
      await this.pedidoItemRepository.save(pedidoItem);
    }

    const savedFullPedido = await this.findOne(savedPedido.id);

    // Emitir evento por WebSockets para el garitero
    if (savedFullPedido) {
      this.wsGateway.broadcast('nuevo_pedido', {
        pedidoId: savedFullPedido.id,
        mesa: savedFullPedido.recurso?.code || 'Barra',
        total: savedFullPedido.total
      });
    }

    return savedFullPedido;
  }

  async updateStatus(pedidoId: number, estado: string, gariteroId?: number) {
    const pedido = await this.pedidoRepository.findOne({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (pedido.estado === estado) {
      return this.pedidoRepository.save(pedido);
    }

    const validTransitions: Record<string, string[]> = {
      [EstadoPedido.PENDIENTE]: [
        EstadoPedido.EN_PREPARACION,
        EstadoPedido.LISTO,
        EstadoPedido.ENTREGADO,
        EstadoPedido.CANCELADO,
      ],
      [EstadoPedido.EN_PREPARACION]: [
        EstadoPedido.LISTO,
        EstadoPedido.ENTREGADO,
        EstadoPedido.CANCELADO,
      ],
      [EstadoPedido.LISTO]: [
        EstadoPedido.ENTREGADO, 
        EstadoPedido.CANCELADO
      ],
      [EstadoPedido.ENTREGADO]: [
        EstadoPedido.ENTREGADO
      ],
      [EstadoPedido.CANCELADO]: [
        EstadoPedido.CANCELADO
      ],
    };

    if (!validTransitions[pedido.estado].includes(estado)) {
      throw new BadRequestException(
        `Transición inválida de ${pedido.estado} a ${estado}`,
      );
    }

    pedido.estado = estado as EstadoPedido;

    if (gariteroId) {
      pedido.gariteroId = gariteroId;
    }

    if (estado === EstadoPedido.EN_PREPARACION) {
      pedido.fechaPreparacion = new Date();
    } else if (estado === EstadoPedido.ENTREGADO) {
      pedido.fechaEntregado = new Date();

      // Calcular tiempo de preparación
      if (pedido.fechaPreparacion) {
        const diff =
          pedido.fechaEntregado.getTime() - pedido.fechaPreparacion.getTime();
        pedido.tiempoPreparacionMinutos = Math.floor(diff / 60000);
      }
    }

    const savedPedido = await this.pedidoRepository.save(pedido);

    // Enviar notificación Push al usuario
    let mensaje = '';
    if (estado === EstadoPedido.EN_PREPARACION) mensaje = 'Tu pedido está siendo preparado por el garitero.';
    if (estado === EstadoPedido.LISTO) mensaje = '¡Tu pedido está listo para ser entregado!';
    if (estado === EstadoPedido.CANCELADO) mensaje = 'Tu pedido ha sido cancelado.';

    if (mensaje) {
      this.pushNotificationsService.sendNotificationToUser(pedido.usuarioId, {
        notification: {
          title: 'Actualización de Pedido',
          body: mensaje,
          icon: '/icons/icon-192x192.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
            url: '/garitero' // o una url para ver el estado
          }
        }
      });
    }

    return savedPedido;
  }

  async startPreparation(pedidoId: number, gariteroId: number) {
    return this.updateStatus(pedidoId, EstadoPedido.EN_PREPARACION, gariteroId);
  }

  async markAsReady(pedidoId: number) {
    return this.updateStatus(pedidoId, EstadoPedido.LISTO);
  }

  async markAsDelivered(
    pedidoId: number,
    body?: { metodoPago?: string; pagado?: number },
  ) {
    const pedido = await this.findOne(pedidoId);

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (body?.metodoPago) {
      pedido.metodoPago = body.metodoPago as MetodoPago;
    }

    if (body?.pagado) {
      pedido.pagado = body.pagado;
      pedido.cambio = body.pagado - pedido.total;
    }

    return this.updateStatus(pedidoId, EstadoPedido.ENTREGADO);
  }

  async cancelOrder(pedidoId: number, motivo?: string) {
    const pedido = await this.findOne(pedidoId);

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (pedido.estado === EstadoPedido.CANCELADO) {
      return pedido;
    }

    // Devolver stock de los productos
    for (const item of pedido.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (product) {
        product.stock += item.cantidad;
        await this.productRepository.save(product);
      }
    }

    if (motivo) {
      pedido.notas = pedido.notas
        ? `${pedido.notas}\n\nCancelado: ${motivo}`
        : `Cancelado: ${motivo}`;
    }

    return this.updateStatus(pedidoId, EstadoPedido.CANCELADO);
  }

  async getDailyStats(venueId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pedidosHoy = await this.pedidoRepository.find({
      where: {
        venueId,
        createdAt: MoreThan(today),
      },
    });

    const stats = {
      totalPedidos: pedidosHoy.length,
      pedidosPendientes: pedidosHoy.filter(
        (p) => p.estado === EstadoPedido.PENDIENTE,
      ).length,
      pedidosEnPreparacion: pedidosHoy.filter(
        (p) => p.estado === EstadoPedido.EN_PREPARACION,
      ).length,
      pedidosListos: pedidosHoy.filter((p) => p.estado === EstadoPedido.LISTO)
        .length,
      pedidosEntregados: pedidosHoy.filter(
        (p) => p.estado === EstadoPedido.ENTREGADO,
      ).length,
      ingresosTotales: pedidosHoy.reduce((sum, p) => sum + Number(p.total || 0), 0),
      tiempoPromedioPreparacion: 0,
      productosVendidos: 0,
    };

    // Calcular tiempo promedio de preparación
    const pedidosConTiempo = pedidosHoy.filter(
      (p) => p.tiempoPreparacionMinutos > 0,
    );
    if (pedidosConTiempo.length > 0) {
      stats.tiempoPromedioPreparacion = Math.round(
        pedidosConTiempo.reduce(
          (sum, p) => sum + p.tiempoPreparacionMinutos,
          0,
        ) / pedidosConTiempo.length,
      );
    }

    // Calcular productos vendidos
    stats.productosVendidos = pedidosHoy.reduce(
      (sum, p) =>
        sum +
        (p.items?.reduce((sumItems, item) => sumItems + item.cantidad, 0) || 0),
      0,
    );

    return stats;
  }

  async getTopProducts(venueId: number, limit: number = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = this.pedidoItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.pedido', 'pedido')
      .leftJoin('item.product', 'product')
      .select([
        'product.id',
        'product.name',
        'product.price',
        'SUM(item.cantidad) as totalVendidos',
        'SUM(item.subtotal) as totalIngresos',
      ])
      .where('pedido.venueId = :venueId', { venueId })
      .andWhere('pedido.createdAt >= :today', { today })
      .groupBy('product.id, product.name, product.price')
      .orderBy('totalVendidos', 'DESC')
      .limit(limit);

    return query.getRawMany();
  }
}
