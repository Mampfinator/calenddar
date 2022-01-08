import { Webevent } from 'src/core/webevents/interfaces/webevent.dto';

export class VTuberDeletedEvent implements Webevent {
    constructor(public readonly id: string) {}
    event = 'vtuber.deleted';
}
