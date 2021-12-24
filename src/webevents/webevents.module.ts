import { Module } from '@nestjs/common';
import { VTubersModule } from '../vtubers/vtubers.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { WebeventsService } from './webevents.service';

@Module({
    imports: [WebsocketModule, WebhooksModule, VTubersModule],
    providers: [WebeventsService],
})
export class WebeventsModule {}
