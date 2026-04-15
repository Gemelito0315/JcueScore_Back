import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecursosService } from '../../services/recursos/recursos.service';
import { CreateRecursoDto, UpdateRecursoDto } from '../../dtos/recurso.dto';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';

@ApiTags('Recursos')
@ApiBearerAuth()
@Modules('billar', 'tejo', 'bolirama')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('recursos')
export class RecursosController {
    constructor(private readonly recursosService: RecursosService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todos los recursos' })
    findAll() {
        return this.recursosService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un recurso por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.recursosService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo recurso' })
    create(@Body() createRecursoDto: CreateRecursoDto) {
        return this.recursosService.create(createRecursoDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un recurso' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateRecursoDto: UpdateRecursoDto) {
        return this.recursosService.update(id, updateRecursoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un recurso' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.recursosService.remove(id);
    }
}
