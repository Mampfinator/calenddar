import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { YouTubeEventSubFeedHandler } from "./events/youtube-eventsub-feed.handler";
import { YouTubeEventSubController } from "./youtube-eventsub.controller";
import { YouTubeEventSubService } from "./youtube-eventsub.service";

@Module({
    imports: [
        CqrsModule, 
        EventEmitterModule
    ],
    providers: [
        YouTubeEventSubService, 
        YouTubeEventSubFeedHandler
    ],
    exports: [YouTubeEventSubService], 
    controllers: [YouTubeEventSubController]
})
export class YouTubeEventSubModule {}