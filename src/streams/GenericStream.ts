import { AggregateRoot } from '@nestjs/cqrs';
import { YouTubeV3Video } from '../youtube/api/interfaces/V3Video';
import { VideoStatusEnum } from './stream.read';
import { isValidDate } from '../util/';

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

    updateFromYouTubeApi(
        video: YouTubeV3Video,
    ): Map<string, { oldValue: any; newValue: any }> {
        if (this.platform !== 'youtube') {
            throw new Error(
                `Tried updating non-YouTube stream from YouTube API!`,
            );
        }
        if (!video) throw new Error(`No video passed! Expected video with ID ${this.id}.`);
        if (!video.id || video.id !== this.id) throw new Error(`Got unexpected video ID. Expected: ${this.id}, got: ${video.id}.`);

        const updates = new Map<string, { oldValue: any; newValue: any }>();

        // return just Map(1) => {"status" => {oldValue: [...], newValue: VideoStatus.Offline}} if a stream was unarchived.
        // That should be enough.
        if (video.deleted && this.status !== VideoStatusEnum.Offline) {
            updates.set('status', {
                oldValue: this.status,
                newValue: VideoStatusEnum.Offline,
            });
            this.status = VideoStatusEnum.Offline;
            return updates;
        }

        function compare<T = any>(
            key: string,
            newValue: T,
            compareMethod = (oldValue: T, newValue: T) => oldValue == newValue,
        ) {
            if (!compareMethod(this[key], newValue)) {
                updates.set(key, { oldValue: this[key], newValue });
                this[key] = newValue;
            }
        }

        const { snippet, liveStreamingDetails } = video;
        // general details
        const { title, description, liveBroadcastContent } = snippet;

        if (liveStreamingDetails) {
            // figure out time
            const { scheduledStartTime } = liveStreamingDetails;
            var scheduledFor = new Date(scheduledStartTime);
            scheduledFor = isValidDate(scheduledFor) ? scheduledFor : undefined;

            var status: VideoStatusEnum;
            switch (liveBroadcastContent) {
                case 'live':
                    status = VideoStatusEnum.Live;
                    break;
                case 'none':
                    status = VideoStatusEnum.Offline;
                    break;
                case 'upcoming':
                    status = VideoStatusEnum.Upcoming;
                    break;
            }
        }

        // might be undefined for uploads
        Reflect.apply(compare, this, ['status', status]);
        Reflect.apply(compare, this, ['title', title]);
        Reflect.apply(compare, this, ['description', description]);
        Reflect.apply(compare, this, [
            'scheduledFor',
            scheduledFor,
            (o, n) => o?.valueOf() === n?.valueOf(),
        ]);

        return updates;
    }
}
