import { AggregateRoot } from '@nestjs/cqrs';
import { YouTubeAPIVideo } from 'src/youtube/api/interfaces/YouTubeAPIVideo';
import { VideoStatusEnum } from './stream.read';

export class GenericStream extends AggregateRoot {
    constructor(
        public _id: string,
        public id: string,

        public channelId: string,
        public platform: string, 
        public title: string,
        public status: VideoStatusEnum,
        public startedAt?: Date,

        // YouTube-specific fields:
        public description?: string,
        public endedAt?: Date,
        public scheduledFor?: Date,
    ) {
        super();
    }

    getId(): string {
        return this.id;
    }

    getChannelId(): string {
        return this.channelId;
    }

    getPlatform(): string {
        return this.platform;
    }

    isLive(): boolean {
        return this.status === VideoStatusEnum.Live;
    }

    isOffline(): boolean {
        return this.status === VideoStatusEnum.Offline;
    }

    updateFromYouTubeApi(video: YouTubeAPIVideo) {
        if (this.platform !== "youtube") throw new Error(`Tried updating non-YouTube stream from YouTube API!`);
    }
}
