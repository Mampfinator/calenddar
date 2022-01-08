import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from 'eventemitter2';
import { WebSocket } from 'ws';
import { Webevent } from 'src/core/webevents/interfaces/webevent.dto';

@Injectable()
export class WebsocketService {
    sockets = new Set<WebSocket>();

    constructor(public readonly eventEmitter: EventEmitter2) {}

    broadcast(broadcast: Record<string, any>) {
        // TODO: look into using a faster stringify implementation
        const message = JSON.stringify(broadcast);
        for (const socket of this.sockets) {
            socket.send(message);
        }
    }
}
