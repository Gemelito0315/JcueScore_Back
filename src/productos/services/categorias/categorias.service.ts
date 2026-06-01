import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from '../../../productos/entities/product-category.entity';
import { ProductSubcategory } from '../../../productos/entities/product-subcategory.entity';
import { ProductType } from '../../../productos/entities/product-type.entity';
import {
  CreateCategoriaDto,
  UpdateCategoriaDto,
  CreateSubcategoriaDto,
  UpdateSubcategoriaDto,
  CreateTipoProductoDto,
  UpdateTipoProductoDto,
} from '../../dtos/categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(ProductCategory)
    private categoriaRepo: Repository<ProductCategory>,
    @InjectRepository(ProductSubcategory)
    private subcategoriaRepo: Repository<ProductSubcategory>,
    @InjectRepository(ProductType)
    private tipoProductoRepo: Repository<ProductType>,
  ) {}

  // ── Categorías ──────────────────────────────────────────────
  findAllCategorias() {
    return this.categoriaRepo.find();
  }

  async findOneCategoria(id: number) {
    const cat = await this.categoriaRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Categoría #${id} no encontrada`);
    return cat;
  }

  createCategoria(dto: CreateCategoriaDto) {
    return this.categoriaRepo.save(this.categoriaRepo.create(dto));
  }

  async updateCategoria(id: number, dto: UpdateCategoriaDto) {
    const cat = await this.findOneCategoria(id);
    this.categoriaRepo.merge(cat, dto);
    return this.categoriaRepo.save(cat);
  }

  async removeCategoria(id: number) {
    const cat = await this.findOneCategoria(id);
    return this.categoriaRepo.remove(cat);
  }

  // ── Subcategorías ────────────────────────────────────────────
  findAllSubcategorias() {
    return this.subcategoriaRepo.find({ relations: ['category'] });
  }

  async findOneSubcategoria(id: number) {
    const sub = await this.subcategoriaRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!sub) throw new NotFoundException(`Subcategoría #${id} no encontrada`);
    return sub;
  }

  createSubcategoria(dto: CreateSubcategoriaDto) {
    return this.subcategoriaRepo.save(this.subcategoriaRepo.create(dto));
  }

  async updateSubcategoria(id: number, dto: UpdateSubcategoriaDto) {
    const sub = await this.findOneSubcategoria(id);
    this.subcategoriaRepo.merge(sub, dto);
    return this.subcategoriaRepo.save(sub);
  }

  async removeSubcategoria(id: number) {
    const sub = await this.findOneSubcategoria(id);
    return this.subcategoriaRepo.remove(sub);
  }

  // ── Tipos de producto ────────────────────────────────────────
  findAllTipos() {
    return this.tipoProductoRepo.find({ relations: ['subcategory'] });
  }

  async findOneTipo(id: number) {
    const tipo = await this.tipoProductoRepo.findOne({
      where: { id },
      relations: ['subcategory'],
    });
    if (!tipo)
      throw new NotFoundException(`Tipo de producto #${id} no encontrado`);
    return tipo;
  }

  createTipo(dto: CreateTipoProductoDto) {
    return this.tipoProductoRepo.save(this.tipoProductoRepo.create(dto));
  }

  async updateTipo(id: number, dto: UpdateTipoProductoDto) {
    const tipo = await this.findOneTipo(id);
    this.tipoProductoRepo.merge(tipo, dto);
    return this.tipoProductoRepo.save(tipo);
  }

  async removeTipo(id: number) {
    const tipo = await this.findOneTipo(id);
    return this.tipoProductoRepo.remove(tipo);
  }
}
