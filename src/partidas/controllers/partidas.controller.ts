import { Controller, Post, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PartidasService } from '../services/partidas.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiTags('Partidas')
@ApiBearerAuth()
@Modules('partidas')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('partidas')
export class PartidasController {
    constructor(private readonly partidasService: PartidasService) {}

    @Post('iniciar')
    @ApiOperation({ summary: 'Iniciar nueva partida' })
    iniciarPartida(@Body() body: { resourceId: number; jugadores: string[]; startTime: string }) {
        return this.partidasService.iniciarPartida(body);
    }

    @Put('finalizar')
    @ApiOperation({ summary: 'Finalizar partida' })
    finalizarPartida(@Body() body: { partidaId: number; marcador: { j1: number; j2: number }; endTime: string }) {
        return this.partidasService.finalizarPartida(body);
    }

    @Get('activas')
    @ApiOperation({ summary: 'Obtener partidas activas' })
    obtenerPartidasActivas() {
        return this.partidasService.obtenerPartidasActivas();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener partida por ID' })
    findOne(@Param('id') id: string) {
        return this.partidasService.findOne(+id);
    }
}
