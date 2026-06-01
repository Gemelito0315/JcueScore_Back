import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PedidosService } from '../services/pedidos.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todos los pedidos' })
  findAll(
    @Req() req: any,
    @Query('usuarioId') usuarioId?: string,
    @Query('gariteroId') gariteroId?: string,
  ) {
    const userRoles = req.user.roles?.map((r: any) => r.name.toLowerCase()) || [];
    const roleStr = (userRoles.includes('admin') || userRoles.includes('garitero')) ? 'admin' : 'usuario';

    const queryParams: any = {};
    if (usuarioId) queryParams.usuarioId = +usuarioId;
    if (gariteroId) queryParams.gariteroId = +gariteroId;
    return this.pedidosService.findAll(req.user.id, roleStr, queryParams);
  }

  @Get('activos')
  @ApiOperation({ summary: 'Obtener pedidos activos (público)' })
  findActiveOrders() {
    return this.pedidosService.findActiveOrders();
  }

  @Get('mesa/:recursoId')
  @ApiOperation({ summary: 'Obtener pedidos de una mesa específica (público)' })
  findByTable(@Param('recursoId') recursoId: string) {
    return this.pedidosService.findByTable(+recursoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pedido por ID (público)' })
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(+id);
  }

  @Post()
  @ApiBearerAuth()
  @Modules('orders')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Crear nuevo pedido' })
  create(@Req() req: any, @Body() createPedidoDto: any) {
    return this.pedidosService.create(req.user.id, createPedidoDto);
  }

  @Put(':id/estado')
  @ApiBearerAuth()
  @Modules('orders')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Actualizar estado del pedido' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { estado: string; gariteroId?: number },
  ) {
    return this.pedidosService.updateStatus(+id, body.estado, body.gariteroId);
  }

  @Put(':id/preparar')
  @ApiBearerAuth()
  @Modules('orders')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Marcar pedido como en preparación' })
  startPreparation(@Param('id') id: string, @Req() req: any) {
    return this.pedidosService.startPreparation(+id, req.user.id);
  }

  @Put(':id/listo')
  @ApiBearerAuth()
  @Modules('orders')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Marcar pedido como listo para entrega' })
  markAsReady(@Param('id') id: string) {
    return this.pedidosService.markAsReady(+id);
  }

  @Put(':id/entregar')
  @ApiBearerAuth()
  @Modules('orders')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Marcar pedido como entregado' })
  markAsDelivered(
    @Param('id') id: string,
    @Body() body?: { metodoPago?: string; pagado?: number },
  ) {
    return this.pedidosService.markAsDelivered(+id, body);
  }

  @Put(':id/cancelar')
  @ApiBearerAuth()
  @Modules('orders')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Cancelar pedido' })
  cancelOrder(@Param('id') id: string, @Body() body: { motivo?: string }) {
    return this.pedidosService.cancelOrder(+id, body.motivo);
  }

  @Get('estadisticas/dia')
  @ApiBearerAuth()
  @Modules('orders')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Obtener estadísticas del día' })
  getDailyStats(@Req() req: any) {
    return this.pedidosService.getDailyStats(req.user.venueId);
  }

  @Get('estadisticas/productos-mas-vendidos')
  @ApiBearerAuth()
  @Modules('orders')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Obtener productos más vendidos' })
  getTopProducts(@Req() req: any) {
    return this.pedidosService.getTopProducts(req.user.venueId);
  }
}
