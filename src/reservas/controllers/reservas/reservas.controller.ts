import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReservasService } from '../../services/reservas/reservas.service';
import { CreateReservaDto, UpdateReservaDto } from '../../dtos/reserva.dto';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';

@ApiTags('Reservas')
@ApiBearerAuth()
@Modules('reservations')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('reservas')
export class ReservasController {
    constructor(private readonly reservasService: ReservasService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todas las reservas' })
    findAll() {
        return this.reservasService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una reserva por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.reservasService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva reserva' })
    create(@Body() createReservaDto: CreateReservaDto) {
        return this.reservasService.create(createReservaDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar una reserva' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateReservaDto: UpdateReservaDto) {
        return this.reservasService.update(id, updateReservaDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una reserva' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.reservasService.remove(id);
    }
}
