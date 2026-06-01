import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OperacionesService } from './operaciones.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Operaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('operaciones')
export class OperacionesController {
  constructor(private readonly svc: OperacionesService) {}



  // ================= TURNO =================
  @Get('turno/activo')
  @ApiOperation({ summary: 'Obtener turno activo' })
  getTurnoActivo() {
    return this.svc.getTurnoActivo();
  }

  @Post('turno/abrir')
  @ApiOperation({ summary: 'Abrir un nuevo turno' })
  abrirTurno(
    @Req() req: any,
    @Body()
    body: { baseCaja: number; valorHora: number; notasApertura?: string },
  ) {
    const userId = req.user?.id || 1; // Ajustar según payload
    return this.svc.abrirTurno(
      userId,
      body.baseCaja,
      body.valorHora,
      body.notasApertura,
    );
  }

  @Get('turno/:id/resumen')
  @ApiOperation({ summary: 'Obtener el resumen calculado de la caja para un turno' })
  getResumenTurno(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getResumenTurno(id);
  }

  @Get('turno/:id/reporte-detallado')
  @ApiOperation({ summary: 'Obtener reporte detallado con productos y mesas del turno' })
  getTurnoReporteDetallado(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getTurnoReporteDetallado(id);
  }

  @Post('turno/:id/cerrar')
  @ApiOperation({ summary: 'Cerrar turno' })
  cerrarTurno(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { efectivoContado: number; notasCierre?: string },
  ) {
    return this.svc.cerrarTurno(id, body.efectivoContado, body.notasCierre);
  }

  // ================= CAJA =================
  @Get('turno/:turnoId/gastos')
  getGastos(@Param('turnoId', ParseIntPipe) turnoId: number) {
    return this.svc.getGastos(turnoId);
  }

  @Post('turno/:turnoId/gastos')
  addGasto(
    @Param('turnoId', ParseIntPipe) turnoId: number,
    @Body() body: { descripcion: string; monto: number; tipo: string },
  ) {
    return this.svc.addGasto(turnoId, body.descripcion, body.monto, body.tipo);
  }

  @Delete('gastos/:id')
  deleteGasto(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteGasto(id);
  }

  // ================= TRANSFERENCIAS =================
  @Get('turno/:turnoId/transferencias')
  getTransferencias(@Param('turnoId', ParseIntPipe) turnoId: number) {
    return this.svc.getTransferencias(turnoId);
  }

  @Post('turno/:turnoId/transferencias')
  addTransferencia(
    @Param('turnoId', ParseIntPipe) turnoId: number,
    @Body()
    body: { cliente: string; monto: number; concepto: string; foto?: string },
  ) {
    return this.svc.addTransferencia(
      turnoId,
      body.cliente,
      body.monto,
      body.concepto,
      body.foto,
    );
  }

  @Delete('transferencias/:id')
  deleteTransferencia(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteTransferencia(id);
  }

  @Get('turnos')
  @ApiOperation({ summary: 'Obtener todos los turnos' })
  getTurnos() {
    return this.svc.getTurnos();
  }

  // ================= LLAMADOS DE ATENCION =================
  @Post('llamados/crear')
  @ApiOperation({ summary: 'Crear un llamado de atención de un usuario' })
  crearLlamado(
    @Req() req: any,
    @Body() body: { recursoId: number; mensaje: string },
  ) {
    const userId = req.user?.id || 1;
    return this.svc.crearLlamado(body.recursoId, userId, body.mensaje);
  }

  @Get('llamados/activos')
  @ApiOperation({ summary: 'Obtener llamados de atención pendientes' })
  obtenerLlamadosActivos() {
    return this.svc.obtenerLlamadosActivos();
  }

  @Post('llamados/:id/atender')
  @ApiOperation({ summary: 'Marcar llamado de atención como atendido' })
  atenderLlamado(@Param('id', ParseIntPipe) id: number) {
    return this.svc.atenderLlamado(id);
  }
}
