import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LealtadController } from './controllers/lealtad.controller';
import { LealtadService } from './services/lealtad.service';
import { TransaccionLealtad } from './entities/transaccion-lealtad.entity';
import { User } from '../users/entities/user.entity';
import { Club } from '../clubs/entities/club.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransaccionLealtad, User, Club])],
  controllers: [LealtadController],
  providers: [LealtadService],
  exports: [LealtadService],
})
export class LealtadModule {}
