import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { DeudasService } from './deudas.service';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeudaDto {
  @ApiProperty({ example: 1 })
  @IsInt() @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 'Partida del 10 de abril' })
  @IsString() @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 25000 })
  @IsNumber() @Min(1)
  monto: number;

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  notas?: string;
}

export class PagoDto {
  @ApiProperty({ example: 10000 })
  @IsNumber() @Min(1)
  montoPago: number;
}

@ApiTags('Deudas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deudas')
export class DeudasController {
  constructor(private readonly deudasService: DeudasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las deudas (admin)' })
  findAll() { return this.deudasService.findAll(); }

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen de deudas' })
  getSummary() { return this.deudasService.getSummary(); }

  @Get('usuario/:userId')
  @ApiOperation({ summary: 'Deudas de un usuario' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.deudasService.findByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nueva deuda' })
  create(@Body() dto: CreateDeudaDto) { return this.deudasService.create(dto); }

  @Post(':id/pago')
  @ApiOperation({ summary: 'Registrar pago de deuda' })
  pago(@Param('id', ParseIntPipe) id: number, @Body() dto: PagoDto) {
    return this.deudasService.registrarPago(id, dto.montoPago);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar deuda' })
  delete(@Param('id', ParseIntPipe) id: number) { return this.deudasService.delete(id); }
}
