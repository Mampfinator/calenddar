import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebsocketBroadcast } from './dto/websocket-broadcast.dto';
import { EventEmitter2 } from 'eventemitter2';
import { WebSocket } from 'ws';
import { Webevent } from 'src/webevents/interfaces/webevent.dto';

@Injectable()
export class WebsocketService {
    sockets = new Set<WebSocket>();

    constructor(public readonly eventEmitter: EventEmitter2) {}

    broadcast(broadcast: WebsocketBroadcast<any>) {
        const message = JSON.stringify(broadcast);
        for (const socket of this.sockets) {
            socket.send(message);
        }
    }
}
