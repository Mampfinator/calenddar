import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';

@Module({
    imports: [CqrsModule],
    providers: [WebsocketGateway, WebsocketService],
    exports: [WebsocketService],
})
export class WebsocketModule {}
