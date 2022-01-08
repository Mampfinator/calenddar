import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import type { WebSocketServer as WSS, WebSocket } from 'ws';
import { WebsocketService } from './websocket.service';

@WebSocketGateway()
export class WebsocketGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly websocketService: WebsocketService) {}

    @WebSocketServer()
    server: WSS;

    handleConnection(socket: WebSocket) {
        socket.send(`{"event": "welcome"}`);
        this.websocketService.sockets.add(socket);
    }

    handleDisconnect(socket: WebSocket) {
        this.websocketService.sockets.delete(socket);
    }
}
