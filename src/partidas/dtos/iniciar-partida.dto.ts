import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsArray, IsString } from 'class-validator';

export class IniciarPartidaDto {
  @ApiProperty({ example: 1, description: 'ID de la mesa / recurso de billar' })
  @IsInt()
  @IsNotEmpty()
  resourceId: number;

  @ApiProperty({ example: ['Jugador 1', 'Jugador 2'], description: 'Nombres de los jugadores' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  jugadores: string[];

  @ApiProperty({ example: '2026-05-25T12:00:00.000Z', description: 'Fecha y hora de inicio de la partida' })
  @IsString()
  @IsNotEmpty()
  startTime: string;
}
