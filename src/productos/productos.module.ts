import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './services/productos/productos.service';
import { ProductosController } from './controllers/productos/productos.controller';
import { CategoriasService } from './services/categorias/categorias.service';
import { CategoriasController } from './controllers/categorias/categorias.controller';
import { Product } from '../products/entities/product.entity';
import { ProductCategory } from '../products/entities/product-category.entity';
import { ProductSubcategory } from '../products/entities/product-subcategory.entity';
import { ProductType } from '../products/entities/product-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCategory, ProductSubcategory, ProductType])],
  providers: [ProductosService, CategoriasService],
  controllers: [ProductosController, CategoriasController],
  exports: [ProductosService, CategoriasService],
})
export class ProductosModule {}
