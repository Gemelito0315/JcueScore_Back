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
import { EquipamientoService } from '../../services/equipamiento/equipamiento.service';
import {
  CreateEquipamientoDto,
  UpdateEquipamientoDto,
} from '../../dtos/equipamiento.dto';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';

@ApiTags('Equipamiento')
@ApiBearerAuth()
@Modules('billar', 'tejo', 'bolirama')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('equipamiento')
export class EquipamientoController {
  constructor(private readonly equipamientoService: EquipamientoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todo el equipamiento' })
  findAll() {
    return this.equipamientoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener equipamiento por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equipamientoService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo equipamiento' })
  create(@Body() createEquipamientoDto: CreateEquipamientoDto) {
    return this.equipamientoService.create(createEquipamientoDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar equipamiento' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEquipamientoDto: UpdateEquipamientoDto,
  ) {
    return this.equipamientoService.update(id, updateEquipamientoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar equipamiento' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.equipamientoService.remove(id);
  }
}
