import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductosService } from '../../services/productos/productos.service';
import { CreateProductoDto, UpdateProductoDto } from '../../dtos/producto.dto';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';

@ApiTags('Productos')
@ApiBearerAuth()
@Modules('inventory')
@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('productos')
export class ProductosController {
    constructor(private readonly productosService: ProductosService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todos los productos' })
    findAll() {
        return this.productosService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un producto por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productosService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo producto' })
    create(@Body() createProductoDto: CreateProductoDto) {
        return this.productosService.create(createProductoDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un producto' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProductoDto: UpdateProductoDto) {
        return this.productosService.update(id, updateProductoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un producto' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productosService.remove(id);
    }
}
