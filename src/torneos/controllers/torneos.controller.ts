import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TorneosService } from '../services/torneos.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiTags('Torneos')
@ApiBearerAuth()
@Modules('tournaments')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('torneos')
export class TorneosController {
  constructor(private readonly torneosService: TorneosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los torneos' })
  findAll() {
    return this.torneosService.findAll();
  }

  @Get('activos')
  @ApiOperation({ summary: 'Obtener torneos activos' })
  findActiveTournaments() {
    return this.torneosService.findActiveTournaments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener torneo por ID' })
  findOne(@Param('id') id: string) {
    return this.torneosService.findOne(+id);
  }

  @Get(':id/inscripciones')
  @ApiOperation({ summary: 'Obtener inscripciones de un torneo' })
  getInscripciones(@Param('id') id: string) {
    return this.torneosService.getInscripciones(+id);
  }

  @Get(':id/partidos')
  @ApiOperation({ summary: 'Obtener partidos de un torneo' })
  getPartidos(@Param('id') id: string) {
    return this.torneosService.getPartidos(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo torneo' })
  create(@Body() createTorneoDto: any) {
    return this.torneosService.create(createTorneoDto);
  }

  @Post(':id/inscribir')
  @ApiOperation({ summary: 'Inscribir jugador en torneo' })
  inscribirJugador(
    @Param('id') id: string,
    @Body() body: { jugadorId: number; handicap?: number },
  ) {
    return this.torneosService.inscribirJugador(+id, body);
  }

  @Post(':id/generar-partidos')
  @ApiOperation({ summary: 'Generar partidos del torneo' })
  generarPartidos(@Param('id') id: string) {
    return this.torneosService.generarPartidos(+id);
  }

  @Put('partidos/:partidoId/resultado')
  @ApiOperation({ summary: 'Registrar resultado de partido' })
  registrarResultado(
    @Param('partidoId') partidoId: string,
    @Body()
    body: {
      jugador1Score: number;
      jugador2Score: number;
      jugador1Innings: number;
      jugador2Innings: number;
    },
  ) {
    return this.torneosService.registrarResultado(+partidoId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar torneo' })
  update(@Param('id') id: string, @Body() updateTorneoDto: any) {
    return this.torneosService.update(+id, updateTorneoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar torneo' })
  remove(@Param('id') id: string) {
    return this.torneosService.remove(+id);
  }
}
