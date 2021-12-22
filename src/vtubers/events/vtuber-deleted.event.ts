import { Webevent } from 'src/webevents/interfaces/webevent.dto';

export class VTuberDeletedEvent implements Webevent {
    constructor(public readonly id: string) {}
    event = 'vtuber.deleted';
}
