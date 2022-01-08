import { GenericStream } from '../../../core/streams/GenericStream';

export class YouTubeStreamOfflineEvent {
    constructor(public readonly stream: GenericStream) {}
}
