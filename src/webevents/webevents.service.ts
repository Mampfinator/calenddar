import { Injectable } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';
import { EventEmitter2 } from 'eventemitter2';
import { WebhooksService } from '../webhooks/webhooks.service';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable()
export class WebeventsService {
    constructor(
        public readonly eventEmitter: EventEmitter2,
        private readonly websocketService: WebsocketService,
        private readonly webhooksService: WebhooksService,
    ) {}

    send(event: string, payload: IEvent): { ws: boolean; wh: boolean } {
        const hasListeners = {
            ws: this.websocketService.eventEmitter.emit(event, payload),
            wh: this.webhooksService.eventEmitter.emit(event, payload),
        };

        return hasListeners;
    }
}
