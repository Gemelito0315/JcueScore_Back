import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecursosService } from '../services/recursos/recursos.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiTags('Recursos')
@ApiBearerAuth()
@Modules('resources')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('recursos')
export class RecursosController {
    constructor(private readonly recursosService: RecursosService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todos los recursos' })
    findAll() {
        return this.recursosService.findAll();
    }

    @Get('activas')
    @ApiOperation({ summary: 'Obtener mesas con partidas activas' })
    findActiveTables() {
        return this.recursosService.findActiveTables();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener recurso por ID' })
    findOne(@Param('id') id: string) {
        return this.recursosService.findOne(+id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear nuevo recurso' })
    create(@Body() createRecursoDto: any) {
        return this.recursosService.create(createRecursoDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar recurso' })
    update(@Param('id') id: string, @Body() updateRecursoDto: any) {
        return this.recursosService.update(+id, updateRecursoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar recurso' })
    remove(@Param('id') id: string) {
        return this.recursosService.remove(+id);
    }
}
