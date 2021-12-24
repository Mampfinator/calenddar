import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { YouTubeStreamOfflineEvent } from '../../youtube/events/youtube-stream-offline.event';
import { StreamReadFactory } from '../../streams/db/stream-read.factory';
import { VTuberEntityRepository } from '../../vtubers/db/vtuber-entity.repository';
import { WebeventsService } from '../webevents.service';

@EventsHandler(YouTubeStreamOfflineEvent)
export class YoutubeStreamOfflineHandler
    implements IEventHandler<YouTubeStreamOfflineEvent>
{
    constructor(
        private readonly webeventService: WebeventsService,
        private readonly vtuberRepository: VTuberEntityRepository,
        private readonly streamReadFacotry: StreamReadFactory,
    ) {}

    async handle({ stream }: YouTubeStreamOfflineEvent) {
        const streamToSend = this.streamReadFacotry.createFromRoot(stream);

        const vtubers = (
            await this.vtuberRepository.findByYoutubeId(streamToSend.channelId)
        ).map((v) => v.getId());
        await this.webeventService.send(
            'offline',
            vtubers,
            'youtube',
            streamToSend,
        );
    }
}
