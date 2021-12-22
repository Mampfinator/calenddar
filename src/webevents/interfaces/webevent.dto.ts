import { IEvent } from '@nestjs/cqrs';

export interface Webevent extends IEvent {
    event: string;
}
