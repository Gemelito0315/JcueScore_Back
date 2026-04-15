import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoDataService } from './demo-data';
import { User } from '../users/entities/user.entity';
import { Resource } from '../resources/entities/resource.entity';
import { Venue } from '../venues/entities/venue.entity';
import { GameType } from '../game-types/entities/game-type.entity';
import { Club } from '../clubs/entities/club.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Resource, Venue, GameType, Club, Product])],
  providers: [DemoDataService],
  exports: [DemoDataService],
})
export class SeedModule {}
