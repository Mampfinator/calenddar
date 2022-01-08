import { Injectable } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from 'eventemitter2';

@Injectable()
export class WebhooksService {
    constructor(public readonly eventEmitter: EventEmitter2) {}

    @OnEvent('webevent.**')
    handleWebevent(payload: IEvent) {
        //
    }
}
