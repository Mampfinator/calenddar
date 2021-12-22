import { Webevent } from 'src/webevents/interfaces/webevent.dto';

export class VTuberCreatedEvent implements Webevent {
    constructor(public readonly id: string) {}
    event = 'vtuber.created';
}
