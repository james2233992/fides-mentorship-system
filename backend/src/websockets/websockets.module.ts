import { Module, Global } from '@nestjs/common';
import { WebSocketsGateway } from './websockets.gateway';

@Global()
@Module({
  providers: [WebSocketsGateway],
  exports: [WebSocketsGateway],
})
export class WebSocketsModule {}