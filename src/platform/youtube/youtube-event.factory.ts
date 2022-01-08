import { Injectable } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';
import { GenericStream } from '../../core/streams/GenericStream';
import { VideoStatusEnum } from '../../core/streams/stream.read';
import { YouTubeStreamOfflineEvent } from './events/youtube-stream-offline.event';
import { YouTubeStreamLiveEvent } from './events/youtube-stream-live.event';
import { YouTubeStreamReservationRemovedEvent } from './events/youtube-stream-reservation-removed.event';
import { YouTubeStreamReservationMovedEvent } from './events/youtube-stream-reservation-moved.event';

@Injectable()
export class YouTubeEventFactory {
    private readonly updateEventTypes: Map<
        string,
        (video: GenericStream, oldValue: any, newValue: any) => IEvent
    > = new Map()
        .set(
            'status',
            (
                video: GenericStream,
                oldValue: VideoStatusEnum,
                newValue: VideoStatusEnum,
            ) => {
                switch (oldValue) {
                    case VideoStatusEnum.Live:
                        return new YouTubeStreamOfflineEvent(video);
                    case VideoStatusEnum.Upcoming:
                        if (newValue === VideoStatusEnum.Live)
                            return new YouTubeStreamLiveEvent(video, true);
                        if (newValue === VideoStatusEnum.Offline)
                            return new YouTubeStreamReservationRemovedEvent(video);
                }
            },
        )
        .set(
            'scheduledFor',
            (video: GenericStream, oldValue: Date, newValue: Date) => {
                if (
                    video.status !== VideoStatusEnum.Upcoming ||
                    !oldValue ||
                    !newValue ||
                    isNaN(oldValue.valueOf()) ||
                    isNaN(oldValue.valueOf())
                )
                    return;
                return new YouTubeStreamReservationMovedEvent(video, oldValue);
            },
        );

    createEventFromUpdate<T>(
        video: GenericStream,
        updateName: string,
        oldValue: T,
        newValue: T,
    ): IEvent {
        const eventFactory = this.updateEventTypes.get(updateName);
        if (eventFactory) return eventFactory(video, oldValue, newValue);
    }
}
