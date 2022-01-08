import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from 'eventemitter2';
import { VTuberDeletedEvent } from './vtuber-deleted.event';

@EventsHandler(VTuberDeletedEvent)
export class VTuberDeletedHandler implements IEventHandler {
    constructor(private readonly eventEmitter: EventEmitter2) {}
    async handle(event: VTuberDeletedEvent) {
        this.eventEmitter.emit(`webevent.${event.event}`, event);
    }
}
