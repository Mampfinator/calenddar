import { GenericStream } from '../../streams/GenericStream';

export class YouTubeStreamReservationRemovedEvent {
    constructor(public readonly stream: GenericStream) {}
}
