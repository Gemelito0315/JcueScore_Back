import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientesService } from '../../services/clientes/clientes.service';
import { CreateClienteDto, UpdateClienteDto } from '../../dtos/cliente.dto';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';

@ApiTags('Clientes')
@ApiBearerAuth()
@Modules('customers')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todos los clientes' })
    findAll() {
        return this.clientesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un cliente por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.clientesService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo cliente' })
    create(@Body() createClienteDto: CreateClienteDto) {
        return this.clientesService.create(createClienteDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un cliente' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateClienteDto: UpdateClienteDto) {
        return this.clientesService.update(id, updateClienteDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un cliente' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.clientesService.remove(id);
    }
}
