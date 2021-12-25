import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StreamEntityRepository } from '../../../streams/db/stream-entity.repository';
import { StreamReadFactory } from '../../../streams/db/stream-read.factory';
import { StreamFactory } from '../../../streams/stream.factory';
import { VideoStatusEnum } from '../../../streams/stream.read';
import { YouTubeAPIService } from '../../api/youtube-api.service';
import { isValidDate, _logToFile } from '../../../util';
import { YouTubeEventSubFeedEvent } from './youtube-eventsub-feed.event.ts';

@EventsHandler(YouTubeEventSubFeedEvent)
export class YouTubeEventSubFeedHandler
    implements IEventHandler<YouTubeEventSubFeedEvent>
{
    private readonly logger = new Logger(YouTubeEventSubFeedHandler.name);

    constructor(
        private readonly apiService: YouTubeAPIService,
        private readonly streamRepository: StreamEntityRepository,
        private readonly streamFactory: StreamFactory,
        private readonly streamReadFactory: StreamReadFactory,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async handle(event: YouTubeEventSubFeedEvent) {
        const { videoId } = event;

        if (
            await this.streamRepository
                .findOneByQuery({ streamId: videoId })
                .catch(() => {
                    /* */
                })
        )
            return;

        const video = await this.apiService.getVideoById(videoId);
        const {channelId, title, status, description, startedAt, endedAt, scheduledFor} = this.apiService.extractInfoFromApiVideo(video);

        const dbVideo = await this.streamFactory.create(
            videoId,
            channelId,
            'youtube',
            title,
            status,
            description,
            startedAt, // TODO: figure out if there's a "start-time" equivalent for uploads
            endedAt,
            scheduledFor,
        );

        // send to clients
        const newVideo = this.streamReadFactory.createFromRoot(dbVideo);
        let webevent: string;
        if (newVideo.status === VideoStatusEnum.Live)
            webevent = 'webevents.youtube.live';
        else if (newVideo.status === VideoStatusEnum.Offline)
            webevent = 'webevents.youtube.upload';
        else if (newVideo.status === VideoStatusEnum.Upcoming)
            webevent = 'webevents.youtube.upcoming';
        if (!webevent)
            throw new Error(
                `Could not determine webevent for video [${videoId}]: ${title}`,
            );
        this.eventEmitter.emit(webevent, newVideo);

        return dbVideo;
    }
}
