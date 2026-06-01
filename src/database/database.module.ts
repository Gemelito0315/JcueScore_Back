import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import config from '../config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configType: ConfigType<typeof config>) => {
        const { user, host, name, password, port, url, ssl } = configType.dataBase;
        return {
          type: 'postgres',
          url,
          host,
          port,
          username: user,
          password,
          database: name,
          synchronize: process.env.NODE_ENV === 'dev', // Solo en dev; en prod usar migraciones
          autoLoadEntities: true,
          ssl: ssl ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
