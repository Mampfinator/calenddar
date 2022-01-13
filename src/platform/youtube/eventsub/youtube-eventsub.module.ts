import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StreamsModule } from '../../../core';
import { YouTubeAPIModule } from '../api/youtube-api.module';
import { YouTubeEventSubFeedHandler } from './events/youtube-eventsub-feed.handler';
import { YouTubeEventSubController } from './youtube-eventsub.controller';
import { YouTubeEventSubService } from './youtube-eventsub.service';

@Module({
    imports: [
        CqrsModule,
        EventEmitterModule,
        YouTubeAPIModule,
        // TODO: move actual hanndling logic to main module
        forwardRef(() => StreamsModule),
    ],
    providers: [YouTubeEventSubService, YouTubeEventSubFeedHandler],
    exports: [YouTubeEventSubService],
    controllers: [YouTubeEventSubController],
})
export class YouTubeEventSubModule {}
