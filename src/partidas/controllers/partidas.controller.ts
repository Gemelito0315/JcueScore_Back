import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PartidasService } from '../services/partidas.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';
import { IniciarPartidaDto } from '../dtos/iniciar-partida.dto';
import { FinalizarPartidaDto } from '../dtos/finalizar-partida.dto';

@ApiTags('Partidas')
@Controller('partidas')
export class PartidasController {
  constructor(private readonly partidasService: PartidasService) {}

  @Post('iniciar')
  @ApiBearerAuth()
  @Modules('partidas')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Iniciar nueva partida' })
  iniciarPartida(
    @Body()
    iniciarPartidaDto: IniciarPartidaDto,
  ) {
    return this.partidasService.iniciarPartida(iniciarPartidaDto);
  }

  @Put('finalizar')
  @ApiBearerAuth()
  @Modules('partidas')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Finalizar partida' })
  finalizarPartida(
    @Body()
    finalizarPartidaDto: FinalizarPartidaDto,
  ) {
    return this.partidasService.finalizarPartida(finalizarPartidaDto);
  }

  @Get('activas')
  @ApiOperation({ summary: 'Obtener partidas activas (público)' })
  obtenerPartidasActivas() {
    return this.partidasService.obtenerPartidasActivas();
  }

  @Get('me/activa')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener partida activa del usuario logueado' })
  getPartidaActiva(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.partidasService.getPartidaActivaUser(userId);
  }

  @Get('ingresos-dia')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener ingresos del día' })
  getIngresosDia() {
    return this.partidasService.getIngresosDia();
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todas las partidas' })
  findAll(@Query('periodo') periodo: string) {
    return this.partidasService.findAll(periodo || 'mes');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener partida por ID (público)' })
  findOne(@Param('id') id: string) {
    return this.partidasService.findOne(+id);
  }
}
