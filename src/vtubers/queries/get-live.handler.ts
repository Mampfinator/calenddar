import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { StreamEntityRepository } from '../../streams/db/stream-entity.repository';
import { VideoStatusEnum } from '../../streams/stream.read';
import { VTuberEntityRepository } from '../db/vtuber-entity.repository';
import { VTuber } from '../vtuber.dto';
import { LiveVTubersQuery } from './get-live.event';

@QueryHandler(LiveVTubersQuery)
export class LiveVTubersHandler
    implements IQueryHandler<LiveVTubersQuery, VTuber[]>
{
    constructor(
        private readonly vtuberRepository: VTuberEntityRepository,
        private readonly streamRepository: StreamEntityRepository,
    ) {}

    async execute(query: LiveVTubersQuery): Promise<VTuber[]> {
        const allVtubers = await this.vtuberRepository.findAll();
        const liveVtubers = [];
        for (const vtuber of allVtubers) {
            const ids = [];
            if (query.platforms.includes('youtube') && vtuber.getYoutubeId())
                ids.push(vtuber.getYoutubeId());
            if (query.platforms.includes('twitch') && vtuber.getTwitchId())
                ids.push(vtuber.getTwitchId());

            const stream = await this.streamRepository
                .findOneByQuery({
                    channelId: { $in: ids },
                    status: VideoStatusEnum.Live,
                })
                .catch(() => {
                    /* ignore NotFound exceptions for streams; no stream = offline */
                });
            if (stream) liveVtubers.push(vtuber);
        }

        return liveVtubers;
    }
}
