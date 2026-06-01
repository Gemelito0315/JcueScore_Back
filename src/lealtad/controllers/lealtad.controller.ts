import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LealtadService } from '../services/lealtad.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiTags('Lealtad')
@ApiBearerAuth()
@Modules('loyalty')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('lealtad')
export class LealtadController {
  constructor(private readonly lealtadService: LealtadService) {}

  @Get('usuario/:usuarioId/balance')
  @ApiOperation({ summary: 'Obtener balance de JcueCoins de un usuario' })
  getBalance(@Param('usuarioId') usuarioId: string) {
    return this.lealtadService.getBalance(+usuarioId);
  }

  @Get('usuario/:usuarioId/historial')
  @ApiOperation({ summary: 'Obtener historial de transacciones de un usuario' })
  getHistorial(@Param('usuarioId') usuarioId: string) {
    return this.lealtadService.getHistorial(+usuarioId);
  }

  @Post('minar')
  @ApiOperation({ summary: 'Minar JcueCoins por tiempo en el billar' })
  minarCoins(
    @Req() req: any,
    @Body()
    body: {
      minutos: number;
      ubicacionGPS?: { latitud: number; longitud: number };
    },
  ) {
    return this.lealtadService.minarCoins(req.user.id, body);
  }

  @Post('canjear')
  @ApiOperation({ summary: 'Canjear JcueCoins por recompensas' })
  canjearRecompensa(
    @Req() req: any,
    @Body()
    body: {
      tipo: string;
      costo: number;
      descripcion: string;
    },
  ) {
    return this.lealtadService.canjearRecompensa(req.user.id, body);
  }

  @Post('bono')
  @ApiOperation({ summary: 'Otorgar bono de JcueCoins (solo admin)' })
  otorgarBono(
    @Body() body: { usuarioId: number; cantidad: number; motivo: string },
  ) {
    return this.lealtadService.otorgarBono(body);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Obtener ranking de JcueCoins' })
  getLeaderboard() {
    return this.lealtadService.getLeaderboard();
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas generales del sistema' })
  getEstadisticas() {
    return this.lealtadService.getEstadisticas();
  }
}
