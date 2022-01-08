import { Webevent } from 'src/core/webevents/interfaces/webevent.dto';

export class WebsocketBroadcast<T extends Webevent> {
    event: string;
    data: { [key: string]: any };

    constructor(event: T);
    constructor(event: string, data?: { [key: string]: any });
    constructor(event: string | T, data?: { [key: string]: any }) {
        if (typeof event === 'string') {
            this.event = event;
            this.data = data;
        } else {
            this.event = event.event;
            const data = { ...event };
            Reflect.deleteProperty(data, 'event');
            this.data = data;
        }
    }
}
