import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PedidosService } from '../services/pedidos.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiTags('Pedidos')
@ApiBearerAuth()
@Modules('orders')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('pedidos')
export class PedidosController {
    constructor(private readonly pedidosService: PedidosService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todos los pedidos' })
    findAll(@Req() req: any) {
        return this.pedidosService.findAll(req.user.id, req.user.role);
    }

    @Get('activos')
    @ApiOperation({ summary: 'Obtener pedidos activos (para gariteros)' })
    findActiveOrders() {
        return this.pedidosService.findActiveOrders();
    }

    @Get('mesa/:recursoId')
    @ApiOperation({ summary: 'Obtener pedidos de una mesa específica' })
    findByTable(@Param('recursoId') recursoId: string) {
        return this.pedidosService.findByTable(+recursoId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener pedido por ID' })
    findOne(@Param('id') id: string) {
        return this.pedidosService.findOne(+id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear nuevo pedido' })
    create(@Req() req: any, @Body() createPedidoDto: any) {
        return this.pedidosService.create(req.user.id, createPedidoDto);
    }

    @Put(':id/estado')
    @ApiOperation({ summary: 'Actualizar estado del pedido' })
    updateStatus(@Param('id') id: string, @Body() body: { estado: string; gariteroId?: number }) {
        return this.pedidosService.updateStatus(+id, body.estado, body.gariteroId);
    }

    @Put(':id/preparar')
    @ApiOperation({ summary: 'Marcar pedido como en preparación' })
    startPreparation(@Param('id') id: string, @Req() req: any) {
        return this.pedidosService.startPreparation(+id, req.user.id);
    }

    @Put(':id/listo')
    @ApiOperation({ summary: 'Marcar pedido como listo para entrega' })
    markAsReady(@Param('id') id: string) {
        return this.pedidosService.markAsReady(+id);
    }

    @Put(':id/entregar')
    @ApiOperation({ summary: 'Marcar pedido como entregado' })
    markAsDelivered(@Param('id') id: string, @Body() body?: { metodoPago?: string; pagado?: number }) {
        return this.pedidosService.markAsDelivered(+id, body);
    }

    @Put(':id/cancelar')
    @ApiOperation({ summary: 'Cancelar pedido' })
    cancelOrder(@Param('id') id: string, @Body() body: { motivo?: string }) {
        return this.pedidosService.cancelOrder(+id, body.motivo);
    }

    @Get('estadisticas/dia')
    @ApiOperation({ summary: 'Obtener estadísticas del día' })
    getDailyStats(@Req() req: any) {
        return this.pedidosService.getDailyStats(req.user.venueId);
    }

    @Get('estadisticas/productos-mas-vendidos')
    @ApiOperation({ summary: 'Obtener productos más vendidos' })
    getTopProducts(@Req() req: any) {
        return this.pedidosService.getTopProducts(req.user.venueId);
    }
}
