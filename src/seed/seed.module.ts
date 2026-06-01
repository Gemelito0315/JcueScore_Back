import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoDataService } from './demo-data';
import { User } from '../users/entities/user.entity';
import { Resource } from '../resources/entities/resource.entity';
import { Venue } from '../sedes/entities/venue.entity';
import { GameType } from '../tipos-juego/entities/game-type.entity';
import { Club } from '../clubs/entities/club.entity';
import { Product } from '../productos/entities/product.entity';

import { ProductCategory } from '../productos/entities/product-category.entity';
import { ProductSubcategory } from '../productos/entities/product-subcategory.entity';
import { ProductType } from '../productos/entities/product-type.entity';

import { Role } from '../roles/entities/role.entity';
import { ModuleEntity } from '../modules/entities/module.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, Resource, Venue, GameType, Club, Product,
      ProductCategory, ProductSubcategory, ProductType,
      Role, ModuleEntity
    ]),
  ],
  providers: [DemoDataService],
  exports: [DemoDataService],
})
export class SeedModule {}
