import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { enviroments } from './enviroments';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuthModule } from './auth/auth.module';
import { ModulesModule } from './modules/modules.module';
import { SedesModule } from './sedes/sedes.module';
import { TiposJuegoModule } from './tipos-juego/tipos-juego.module';
import { RecursosModule } from './recursos/recursos.module';
import { ClientesModule } from './clientes/clientes.module';
import { ReservasModule } from './reservas/reservas.module';
import { ProductosModule } from './productos/productos.module';
import { FacturasModule } from './facturas/facturas.module';
import { PagosModule } from './pagos/pagos.module';
import { EquipamientoModule } from './equipamiento/equipamiento.module';
import { DeudasModule } from './deudas/deudas.module';
import { ClubsModule } from './clubs/clubs.module';
import { PartidasModule } from './partidas/partidas.module';
import { TorneosModule } from './torneos/torneos.module';
import { LealtadModule } from './lealtad/lealtad.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { SeedModule } from './seed/seed.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: enviroments[process.env.NODE_ENV || '.env'],
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.number().required(),
      }),
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    ModulesModule,
    SedesModule,
    TiposJuegoModule,
    RecursosModule,
    ClientesModule,
    ReservasModule,
    ProductosModule,
    FacturasModule,
    PagosModule,
    EquipamientoModule,
    DeudasModule,
    ClubsModule,
    PartidasModule,
    TorneosModule,
    LealtadModule,
    PedidosModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
