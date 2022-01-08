import { GenericStream } from '../../../core/streams/GenericStream';

export class YouTubeStreamReservationRemovedEvent {
    constructor(public readonly stream: GenericStream) {}
}
