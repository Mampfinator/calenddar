import { IEvent } from '@nestjs/cqrs';
import { EventSubStreamOnlineEvent } from '@twurple/eventsub/lib';

export class TwitchStreamLiveEvent implements IEvent {
    constructor(
        public readonly event: EventSubStreamOnlineEvent
    ) {}
}
