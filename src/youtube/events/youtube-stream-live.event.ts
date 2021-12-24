import { GenericStream } from '../../streams/GenericStream';

export class YouTubeStreamLiveEvent {
    constructor(
        public readonly stream: GenericStream,
        public readonly wasScheduled = false,
    ) {}
}
