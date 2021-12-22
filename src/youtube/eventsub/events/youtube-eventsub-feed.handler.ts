import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { _logToFile } from "../../../util";
import { YouTubeEventSubFeedEvent } from "./youtube-eventsub-feed.event.ts";

@EventsHandler(YouTubeEventSubFeedEvent)
export class YouTubeEventSubFeedHandler implements IEventHandler<YouTubeEventSubFeedEvent> {
    private readonly logger = new Logger(YouTubeEventSubFeedHandler.name);
    
    async handle(event: YouTubeEventSubFeedEvent) {
        this.logger.debug(`Got YouTube PubSub event. See log file for more info.`);
        await _logToFile(event.raw, `youtube-eventsub.log`, YouTubeEventSubFeedHandler.name);
    }
}