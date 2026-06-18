import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { MailModule } from '../mail/mail.module';

import { PushNotificationsService } from './services/push-notifications/push-notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RolesModule, MailModule],

  controllers: [UsersController],
  providers: [UsersService, PushNotificationsService],
  exports: [UsersService, PushNotificationsService],
})
export class UsersModule {}
