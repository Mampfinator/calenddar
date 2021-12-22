import { Module } from '@nestjs/common';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { WebeventsService } from './webevents.service';

@Module({
    imports: [WebsocketModule, WebhooksModule],
    providers: [WebeventsService],
    exports: [WebeventsService],
})
export class WebeventsModule {}
