import { SetMetadata } from '@nestjs/common';
export type TwitchEvent = 'stream.online' | 'stream.offline';
export const EventSub = (...events: TwitchEvent[]) =>
    SetMetadata('events', events);
