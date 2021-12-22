import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventSubStreamOfflineEvent } from '@twurple/eventsub/lib';
import { WebeventsService } from '../../webevents/webevents.service';

@EventsHandler()
export class TwitchStreamOfflineHandler
    implements IEventHandler<EventSubStreamOfflineEvent>
{

    constructor(
        private readonly webeventsService: WebeventsService
    ) {}

    handle(event: EventSubStreamOfflineEvent) {
        // TODO: implement properly. Database update, webevent generation.
        const webEvent = {test: true};
        this.webeventsService.send("webevent.twitch.live", webEvent);
    }
}
