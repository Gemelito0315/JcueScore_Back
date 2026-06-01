import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FacturasService } from '../../services/facturas/facturas.service';
import { CreateFacturaDto, UpdateFacturaDto } from '../../dtos/factura.dto';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';

@ApiTags('Facturas')
@ApiBearerAuth()
@Modules('invoicing')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las facturas' })
  findAll() {
    return this.facturasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una factura por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva factura' })
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturasService.create(createFacturaDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una factura' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacturaDto: UpdateFacturaDto,
  ) {
    return this.facturasService.update(id, updateFacturaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una factura' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.remove(id);
  }
}
