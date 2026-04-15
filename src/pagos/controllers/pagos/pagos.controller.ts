import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PagosService } from '../../services/pagos/pagos.service';
import { CreatePagoDto, UpdatePagoDto } from '../../dtos/pago.dto';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';

@ApiTags('Pagos')
@ApiBearerAuth()
@Modules('invoicing')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('pagos')
export class PagosController {
    constructor(private readonly pagosService: PagosService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todos los pagos' })
    findAll() {
        return this.pagosService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un pago por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.pagosService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo pago' })
    create(@Body() createPagoDto: CreatePagoDto) {
        return this.pagosService.create(createPagoDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un pago' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updatePagoDto: UpdatePagoDto) {
        return this.pagosService.update(id, updatePagoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un pago' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.pagosService.remove(id);
    }
}
