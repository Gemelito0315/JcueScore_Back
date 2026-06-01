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
          ...(url
            ? { url }
            : {
                host,
                port,
                username: user,
                password,
                database: name,
              }),
          synchronize: true, // Sincronización automática de entidades (necesario para el demo comercial en producción)
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
