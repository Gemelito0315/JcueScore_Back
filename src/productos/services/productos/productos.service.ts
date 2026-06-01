import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../productos/entities/product.entity';
import { ProductCategory } from '../../../productos/entities/product-category.entity';
import { ProductSubcategory } from '../../../productos/entities/product-subcategory.entity';
import { ProductType } from '../../../productos/entities/product-type.entity';
import { CreateProductoDto, UpdateProductoDto } from '../../dtos/producto.dto';
import {
  CreateCategoriaDto,
  UpdateCategoriaDto,
  CreateSubcategoriaDto,
  UpdateSubcategoriaDto,
  CreateTipoProductoDto,
  UpdateTipoProductoDto,
} from '../../dtos/categoria.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Product)
    private productoRepo: Repository<Product>,
    @InjectRepository(ProductCategory)
    private categoriaRepo: Repository<ProductCategory>,
    @InjectRepository(ProductSubcategory)
    private subcategoriaRepo: Repository<ProductSubcategory>,
    @InjectRepository(ProductType)
    private tipoProductoRepo: Repository<ProductType>,
  ) {}

  async findAll() {
    return await this.productoRepo.find({
      relations: ['venue', 'productType'],
    });
  }

  async findOne(id: number) {
    const producto = await this.productoRepo.findOne({
      where: { id },
      relations: ['venue', 'productType'],
    });
    if (!producto) {
      throw new NotFoundException(`Producto #${id} no encontrado`);
    }
    return producto;
  }

  async create(createProductoDto: CreateProductoDto) {
    const newProducto = this.productoRepo.create(createProductoDto);
    return await this.productoRepo.save(newProducto);
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    const producto = await this.findOne(id);
    this.productoRepo.merge(producto, updateProductoDto);
    return await this.productoRepo.save(producto);
  }

  async remove(id: number) {
    const producto = await this.findOne(id);
    return await this.productoRepo.remove(producto);
  }
}
