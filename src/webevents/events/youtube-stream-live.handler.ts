import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { StreamReadFactory } from '../../streams/db/stream-read.factory';
import { VTuberEntityRepository } from '../../vtubers/db/vtuber-entity.repository';
import { YouTubeStreamLiveEvent } from '../../youtube/events/youtube-stream-live.event';
import { WebeventsService } from '../webevents.service';

@EventsHandler(YouTubeStreamLiveEvent)
export class YoutubeStreamLiveHandler
    implements IEventHandler<YouTubeStreamLiveEvent>
{
    constructor(
        private readonly webeventService: WebeventsService,
        private readonly vtuberRepository: VTuberEntityRepository,
        private readonly streamReadFacotry: StreamReadFactory,
    ) {}

    async handle({ stream, wasScheduled }: YouTubeStreamLiveEvent) {
        const streamToSend = {
            ...this.streamReadFacotry.createFromRoot(stream),
            wasScheduled,
        };

        const vtubers = (
            await this.vtuberRepository.findByYoutubeId(streamToSend.channelId)
        ).map((v) => v.getId());
        await this.webeventService.send(
            'live',
            vtubers,
            'youtube',
            streamToSend,
        );
    }
}
