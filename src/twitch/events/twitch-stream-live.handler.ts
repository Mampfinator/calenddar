import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TwitchStreamLiveEvent } from './twitch-stream-live.event';

@EventsHandler()
export class TwitchStreamLiveHandler
    implements IEventHandler<TwitchStreamLiveEvent>
{

    handle(event: TwitchStreamLiveEvent) {
        // TODO: implement
    }
}
