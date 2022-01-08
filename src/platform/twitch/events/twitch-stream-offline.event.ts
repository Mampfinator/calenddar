import { IEvent } from '@nestjs/cqrs';
import {
    StreamOfflineEventType,
    TwitchEventSubPayload,
} from '../api/interfaces/TwitchEventSubPayload';
export class TwitchStreamOfflineEvent implements IEvent {
    constructor(
        public readonly event: TwitchEventSubPayload<StreamOfflineEventType>,
    ) {}
}
