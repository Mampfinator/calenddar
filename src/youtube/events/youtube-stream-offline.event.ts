import { GenericStream } from '../../streams/GenericStream';

export class YouTubeStreamOfflineEvent {
    constructor(public readonly stream: GenericStream) {}
}
