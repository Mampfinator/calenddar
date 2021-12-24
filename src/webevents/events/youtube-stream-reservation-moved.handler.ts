import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { StreamReadFactory } from '../../streams/db/stream-read.factory';
import { VTuberEntityRepository } from '../../vtubers/db/vtuber-entity.repository';
import { WebeventsService } from '../webevents.service';
import { YouTubeStreamReservationMovedEvent } from '../../youtube/events/youtube-stream-reservation-moved.event';

@EventsHandler(YouTubeStreamReservationMovedEvent)
export class YoutubeStreamOfflineHandler
    implements IEventHandler<YouTubeStreamReservationMovedEvent>
{
    constructor(
        private readonly webeventService: WebeventsService,
        private readonly vtuberRepository: VTuberEntityRepository,
        private readonly streamReadFacotry: StreamReadFactory,
    ) {}

    async handle({ stream, movedFrom }: YouTubeStreamReservationMovedEvent) {
        const streamToSend = {
            ...this.streamReadFacotry.createFromRoot(stream),
            movedFrom,
        };

        const vtubers = (
            await this.vtuberRepository.findByYoutubeId(streamToSend.channelId)
        ).map((v) => v.getId());
        await this.webeventService.send(
            'moved',
            vtubers,
            'youtube',
            streamToSend,
        );
    }
}
