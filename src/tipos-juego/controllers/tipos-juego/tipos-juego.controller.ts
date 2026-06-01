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
import { TiposJuegoService } from '../../services/tipos-juego/tipos-juego.service';
import {
  CreateTipoJuegoDto,
  UpdateTipoJuegoDto,
} from '../../dtos/tipo-juego.dto';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';

@ApiTags('Tipos de Juego')
@Controller('tipos-juego')
export class TiposJuegoController {
  constructor(private readonly tiposJuegoService: TiposJuegoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de juego (público)' })
  findAll() {
    return this.tiposJuegoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de juego por ID (público)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiposJuegoService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Modules('billar', 'tejo', 'bolirama')
  @UseGuards(ModulesGuard)
  @ApiOperation({ summary: 'Crear un nuevo tipo de juego' })
  create(@Body() createTipoJuegoDto: CreateTipoJuegoDto) {
    return this.tiposJuegoService.create(createTipoJuegoDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Modules('billar', 'tejo', 'bolirama')
  @UseGuards(ModulesGuard)
  @ApiOperation({ summary: 'Actualizar un tipo de juego' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoJuegoDto: UpdateTipoJuegoDto,
  ) {
    return this.tiposJuegoService.update(id, updateTipoJuegoDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Modules('billar', 'tejo', 'bolirama')
  @UseGuards(ModulesGuard)
  @ApiOperation({ summary: 'Eliminar un tipo de juego' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tiposJuegoService.remove(id);
  }
}
