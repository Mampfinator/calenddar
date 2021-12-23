import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TwitchStreamOfflineEvent } from './twitch-stream-offline.event';

@EventsHandler(TwitchStreamOfflineEvent)
export class TwitchStreamOfflineHandler
    implements IEventHandler<TwitchStreamOfflineEvent>
{

    handle(event: TwitchStreamOfflineEvent) {
        // TODO: implement.
    }
}
