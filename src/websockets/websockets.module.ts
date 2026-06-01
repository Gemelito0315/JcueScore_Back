import { Module, Global } from '@nestjs/common';
import { WebsocketsGateway } from './websockets.gateway';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [WebsocketsGateway],
  exports: [WebsocketsGateway],
})
export class WebsocketsModule {}
