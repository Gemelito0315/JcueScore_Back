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
import { SedesService } from '../../services/sedes/sedes.service';
import { CreateSedeDto, UpdateSedeDto } from '../../dtos/sede.dto';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';

@ApiTags('Sedes')
@ApiBearerAuth()
@Modules('venues')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las sedes' })
  findAll() {
    return this.sedesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sede por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sedesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva sede' })
  create(@Body() createSedeDto: CreateSedeDto) {
    return this.sedesService.create(createSedeDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una sede' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSedeDto: UpdateSedeDto,
  ) {
    return this.sedesService.update(id, updateSedeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una sede' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sedesService.remove(id);
  }
}
