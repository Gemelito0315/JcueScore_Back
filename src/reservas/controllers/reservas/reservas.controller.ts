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
import { ReservasService } from '../../services/reservas/reservas.service';
import { CreateReservaDto, UpdateReservaDto } from '../../dtos/reserva.dto';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';

@ApiTags('Reservas')
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las reservas (público)' })
  findAll() {
    return this.reservasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva por ID (público)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Modules('reservations')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.create(createReservaDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Modules('reservations')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Actualizar una reserva' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: UpdateReservaDto,
  ) {
    return this.reservasService.update(id, updateReservaDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Modules('reservations')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Eliminar una reserva' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.remove(id);
  }
}
