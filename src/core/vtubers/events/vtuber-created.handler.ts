import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from 'eventemitter2';
import { VTuberCreatedEvent } from './vtuber-created.event';

@EventsHandler(VTuberCreatedEvent)
export class VTuberCreatedHandler implements IEventHandler {
    constructor(private readonly eventEmitter: EventEmitter2) {}

    async handle(event: VTuberCreatedEvent) {
        this.eventEmitter.emit(`webevent.${event.event}`, event);
    }
}
