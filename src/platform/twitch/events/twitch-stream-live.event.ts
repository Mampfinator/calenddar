import { IEvent } from '@nestjs/cqrs';
import { StreamLiveEventType, TwitchEventSubPayload } from '../api/interfaces/TwitchEventSubPayload';

export class TwitchStreamLiveEvent implements IEvent {
    constructor(public readonly event: TwitchEventSubPayload<StreamLiveEventType>) {}
}
