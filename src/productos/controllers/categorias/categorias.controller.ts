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
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { Modules } from '../../../auth/decorators/modules.decorator';
import { CategoriasService } from '../../services/categorias/categorias.service';
import {
  CreateCategoriaDto,
  UpdateCategoriaDto,
  CreateSubcategoriaDto,
  UpdateSubcategoriaDto,
  CreateTipoProductoDto,
  UpdateTipoProductoDto,
} from '../../dtos/categoria.dto';

@ApiTags('Categorías de Productos')
@Controller('inventario')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  // ── Categorías ──────────────────────────────────────────────
  @Get('categorias')
  @ApiOperation({ summary: 'Listar categorías' })
  findAllCategorias() {
    return this.categoriasService.findAllCategorias();
  }

  @Get('categorias/:id')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  findOneCategoria(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOneCategoria(id);
  }

  @Post('categorias')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Modules('inventory')
  @ApiOperation({ summary: 'Crear categoría' })
  createCategoria(@Body() dto: CreateCategoriaDto) {
    return this.categoriasService.createCategoria(dto);
  }

  @Put('categorias/:id')
  @ApiBearerAuth()
  @Modules('inventory')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Actualizar categoría' })
  updateCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.updateCategoria(id, dto);
  }

  @Delete('categorias/:id')
  @ApiBearerAuth()
  @Modules('inventory')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Eliminar categoría' })
  removeCategoria(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.removeCategoria(id);
  }

  // ── Subcategorías ────────────────────────────────────────────
  @Get('subcategorias')
  @ApiOperation({ summary: 'Listar subcategorías' })
  findAllSubcategorias() {
    return this.categoriasService.findAllSubcategorias();
  }

  @Get('subcategorias/:id')
  @ApiOperation({ summary: 'Obtener subcategoría por ID' })
  findOneSubcategoria(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOneSubcategoria(id);
  }

  @Post('subcategorias')
  @ApiBearerAuth()
  @Modules('inventory')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Crear subcategoría' })
  createSubcategoria(@Body() dto: CreateSubcategoriaDto) {
    return this.categoriasService.createSubcategoria(dto);
  }

  @Put('subcategorias/:id')
  @ApiBearerAuth()
  @Modules('inventory')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Actualizar subcategoría' })
  updateSubcategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubcategoriaDto,
  ) {
    return this.categoriasService.updateSubcategoria(id, dto);
  }

  @Delete('subcategorias/:id')
  @ApiBearerAuth()
  @Modules('inventory')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Eliminar subcategoría' })
  removeSubcategoria(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.removeSubcategoria(id);
  }

  // ── Tipos de producto ────────────────────────────────────────
  @Get('tipos')
  @ApiOperation({ summary: 'Listar tipos de producto' })
  findAllTipos() {
    return this.categoriasService.findAllTipos();
  }

  @Get('tipos/:id')
  @ApiOperation({ summary: 'Obtener tipo de producto por ID' })
  findOneTipo(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOneTipo(id);
  }

  @Post('tipos')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear tipo de producto' })
  createTipo(@Body() dto: CreateTipoProductoDto) {
    return this.categoriasService.createTipo(dto);
  }

  @Put('tipos/:id')
  @ApiBearerAuth()
  @Modules('inventory')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Actualizar tipo de producto' })
  updateTipo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoProductoDto,
  ) {
    return this.categoriasService.updateTipo(id, dto);
  }

  @Delete('tipos/:id')
  @ApiBearerAuth()
  @Modules('inventory')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @ApiOperation({ summary: 'Eliminar tipo de producto' })
  removeTipo(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.removeTipo(id);
  }
}
