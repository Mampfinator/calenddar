import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { YouTubeStreamReservationRemovedEvent } from '../../youtube/events/youtube-stream-reservation-removed.event';
import { StreamReadFactory } from '../../streams/db/stream-read.factory';
import { VTuberEntityRepository } from '../../vtubers/db/vtuber-entity.repository';
import { WebeventsService } from '../webevents.service';

@EventsHandler(YouTubeStreamReservationRemovedEvent)
export class YoutubeStreamOfflineHandler
    implements IEventHandler<YouTubeStreamReservationRemovedEvent>
{
    constructor(
        private readonly webeventService: WebeventsService,
        private readonly vtuberRepository: VTuberEntityRepository,
        private readonly streamReadFacotry: StreamReadFactory,
    ) {}

    async handle({ stream }: YouTubeStreamReservationRemovedEvent) {
        const streamToSend = this.streamReadFacotry.createFromRoot(stream);

        const vtubers = (
            await this.vtuberRepository.findByYoutubeId(streamToSend.channelId)
        ).map((v) => v.getId());
        await this.webeventService.send(
            'reservation-removed',
            vtubers,
            'youtube',
            streamToSend,
        );
    }
}
