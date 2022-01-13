import { Injectable } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';
import { GenericStream, VideoStatus } from '../../core';
import {
    YouTubeStreamLiveEvent,
    YouTubeStreamOfflineEvent,
    YouTubeStreamReservationMovedEvent,
    YouTubeStreamReservationRemovedEvent,
} from './events';

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
                oldValue: VideoStatus,
                newValue: VideoStatus,
            ) => {
                switch (oldValue) {
                    case VideoStatus.Live:
                        return new YouTubeStreamOfflineEvent(video);
                    case VideoStatus.Upcoming:
                        if (newValue === VideoStatus.Live)
                            return new YouTubeStreamLiveEvent(video, true);
                        if (newValue === VideoStatus.Offline)
                            return new YouTubeStreamReservationRemovedEvent(
                                video,
                            );
                }
            },
        )
        .set(
            'scheduledFor',
            (video: GenericStream, oldValue: Date, newValue: Date) => {
                if (
                    video.status !== VideoStatus.Upcoming ||
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
