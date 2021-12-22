import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WebeventsService } from '../../webevents/webevents.service';
import { TwitchStreamLiveEvent } from './twitch-stream-live.event';

@EventsHandler()
export class TwitchStreamLiveHandler
    implements IEventHandler<TwitchStreamLiveEvent>
{
    constructor(
        private readonly webeventsService : WebeventsService
    ) {}

    handle(event: TwitchStreamLiveEvent) {
        // TODO: Implement properly. Database update, webevent generation.
        const webEvent = {test: true};
        this.webeventsService.send("webevent.twitch.live", webEvent);
    }
}
