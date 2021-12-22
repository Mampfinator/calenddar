import { Injectable } from '@nestjs/common';
import { StreamEntityRepository } from '../streams/db/stream-entity.repository';
import { VTuberEntityRepository } from '../vtubers/db/vtuber-entity.repository';

@Injectable()
export class YouTubeService {
    constructor(
        private readonly streamRepository: StreamEntityRepository,
        private readonly vtuberRepository: VTuberEntityRepository
    ) {}

    async getAllChannelIds(): Promise<string[]> {
        const youtubeVTubers = await this.vtuberRepository.findByQuery(
            {youtubeId: {$exists: true}}
        );

        return youtubeVTubers.map(v => v.getYoutubeId());
    }
}
