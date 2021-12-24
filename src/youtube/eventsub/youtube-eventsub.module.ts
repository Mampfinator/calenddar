import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StreamsModule } from '../../streams/streams.module';
import { YouTubeAPIModule } from '../api/youtube-api.module';
import { YouTubeEventSubFeedHandler } from './events/youtube-eventsub-feed.handler';
import { YouTubeEventSubController } from './youtube-eventsub.controller';
import { YouTubeEventSubService } from './youtube-eventsub.service';

@Module({
    imports: [
        CqrsModule,
        EventEmitterModule,
        YouTubeAPIModule,
        forwardRef(() => StreamsModule),
    ],
    providers: [YouTubeEventSubService, YouTubeEventSubFeedHandler],
    exports: [YouTubeEventSubService],
    controllers: [YouTubeEventSubController],
})
export class YouTubeEventSubModule {}
