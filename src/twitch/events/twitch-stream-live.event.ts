import { IEvent } from '@nestjs/cqrs';

export class TwitchStreamLiveEvent implements IEvent {
    constructor(public readonly event) {}
}
