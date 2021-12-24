import { IEvent } from '@nestjs/cqrs';
export class TwitchStreamOfflineEvent implements IEvent {
    constructor(public readonly event) {}
}
