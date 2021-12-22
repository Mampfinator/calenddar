import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TwitchStreamOfflineEvent } from './twitch-stream-offline.event';
import { WebeventsService } from '../../webevents/webevents.service';

@EventsHandler(TwitchStreamOfflineEvent)
export class TwitchStreamOfflineHandler
    implements IEventHandler<TwitchStreamOfflineEvent>
{

    constructor(
        private readonly webeventsService: WebeventsService
    ) {}

    handle(event: TwitchStreamOfflineEvent) {
        // TODO: implement properly. Database update, webevent generation.
        const webEvent = {test: true};
        this.webeventsService.send("webevent.twitch.live", webEvent);
    }
}
