import { GenericStream } from '../../../core/streams/GenericStream';

export class YouTubeStreamReservationMovedEvent {
    constructor(
        public readonly stream: GenericStream,
        public readonly movedFrom: Date,
    ) {}
}
