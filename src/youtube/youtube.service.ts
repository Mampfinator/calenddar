import { Injectable, Logger } from '@nestjs/common';
import { StreamEntityRepository } from '../streams/db/stream-entity.repository';
import { VTuberEntityRepository } from '../vtubers/db/vtuber-entity.repository';
import { YouTubeAPIService } from './api/youtube-api.service';
import { YouTubeEventSubService } from './eventsub/youtube-eventsub.service';

@Injectable()
export class YouTubeService {
    public readonly logger = new Logger(YouTubeService.name); 
    constructor(
        public readonly streamRepository: StreamEntityRepository,
        private readonly vtuberRepository: VTuberEntityRepository,
        public readonly apiService: YouTubeAPIService,
        private readonly eventsubService: YouTubeEventSubService
    ) {}

    async getAllChannelIds(): Promise<string[]> {
        const youtubeVTubers = await this.vtuberRepository.findByQuery(
            {youtubeId: {$exists: true}}
        );

        return youtubeVTubers.map(v => v.getYoutubeId());
    }
    
    // TODO: split up live & upcoming checking into seperate methods; mainly to optimize quota usage.
    async syncVideoStates() {
        const videos = await this.streamRepository.findNonOffline("youtube");
        const apiVideos = new Map((await this.apiService.getVideosByIds(...videos.map(v => v.getId())))
            .map(video => [video.id, video])); // Map id => apiVideo


        for (const video of videos) {
            const updates = video.updateFromYouTubeApi(apiVideos.get(video.getId()));
        }
    }

    
}
