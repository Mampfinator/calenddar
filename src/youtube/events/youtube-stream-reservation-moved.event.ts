import { GenericStream } from '../../streams/GenericStream';

export class YouTubeStreamReservationMovedEvent {
    constructor(
        public readonly stream: GenericStream,
        public readonly movedFrom: Date,
    ) {}
}
