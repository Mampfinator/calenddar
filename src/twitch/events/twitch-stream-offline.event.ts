import { IEvent } from '@nestjs/cqrs';
import { EventSubStreamOfflineEvent } from '@twurple/eventsub/lib';
export class TwitchStreamOfflineEvent implements IEvent {
    constructor(
        public readonly event: EventSubStreamOfflineEvent
    ) {}
}
