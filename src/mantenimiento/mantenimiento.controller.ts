import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MantenimientoService, MaintenanceConfig } from './mantenimiento.service';

@ApiTags('Mantenimiento')
@Controller('maintenance')
export class MantenimientoController {
  constructor(private service: MantenimientoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener estado del mantenimiento' })
  getStatus() {
    return this.service.getStatus();
  }

  @Put()
  @ApiOperation({ summary: 'Actualizar configuración de mantenimiento' })
  updateStatus(@Body() data: { active: boolean; message?: string; estimatedTime?: string }) {
    return this.service.updateStatus(data);
  }
}
