import { Module } from '@nestjs/common';
import { VTubersModule } from '../vtubers/vtubers.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { WebeventsService } from './webevents.service';
import { WebeventsEventHandlers } from './events';
import { StreamsModule } from '../streams/streams.module';
@Module({
    imports: [WebsocketModule, WebhooksModule, VTubersModule, StreamsModule],
    providers: [WebeventsService, ...WebeventsEventHandlers],
})
export class WebeventsModule {}
