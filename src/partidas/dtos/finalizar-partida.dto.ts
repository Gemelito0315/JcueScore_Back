import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MarcadorDto {
  @ApiProperty({ example: 10, description: 'Puntos del Jugador 1' })
  @IsInt()
  @Min(0)
  j1: number;

  @ApiProperty({ example: 8, description: 'Puntos del Jugador 2' })
  @IsInt()
  @Min(0)
  j2: number;
}

export class FinalizarPartidaDto {
  @ApiProperty({ example: 123, description: 'ID de la partida a finalizar' })
  @IsInt()
  @IsNotEmpty()
  partidaId: number;

  @ApiProperty({ type: MarcadorDto, description: 'Marcador final de la partida' })
  @ValidateNested()
  @Type(() => MarcadorDto)
  @IsNotEmpty()
  marcador: MarcadorDto;

  @ApiProperty({ example: '2026-05-25T13:30:00.000Z', description: 'Fecha y hora de finalización de la partida' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 'efectivo', required: false, description: 'Método de pago opcional' })
  @IsString()
  @IsOptional()
  metodoPago?: string;
}
