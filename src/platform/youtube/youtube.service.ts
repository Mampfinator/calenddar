import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
    StreamFactory,
    StreamEntityRepository,
    VTuberEntityRepository,
} from '../../core';
import { YouTubeAPIService } from './api/youtube-api.service';
import { YouTubeEventFactory } from './youtube-event.factory';

@Injectable()
export class YouTubeService {
    public readonly logger = new Logger(YouTubeService.name);
    constructor(
        public readonly streamRepository: StreamEntityRepository,
        private readonly streamFactory: StreamFactory,
        private readonly vtuberRepository: VTuberEntityRepository,
        public readonly apiService: YouTubeAPIService,
        private readonly youtubeEventFactory: YouTubeEventFactory,
        private readonly eventBus: EventBus,
    ) {}

    async getAllChannelIds(): Promise<string[]> {
        const youtubeVTubers = await this.vtuberRepository.findByQuery({
            youtubeId: { $exists: true },
        });

        return youtubeVTubers.map((v) => v.getYoutubeId());
    }

    // TODO: split up live & upcoming checking into seperate methods; mainly to optimize quota usage.
    async syncVideoStates(doEvents?: boolean) {
        const videos = await this.streamRepository.findNonOffline('youtube');
        const apiVideos = new Map(
            (
                await this.apiService.getVideosByIds(
                    ...videos.map((v) => v.getId()),
                )
            ).map((video) => [video.id, video]),
        ); // Map id => apiVideo

        const videosUpdating = [];

        for (const video of videos) {
            const updates = video.updateFromYouTubeApi(
                apiVideos.get(video.getId()),
            );
            if (updates.size > 0)
                videosUpdating.push(
                    this.streamRepository.findOneAndReplaceById(
                        video._id,
                        video,
                    ),
                );
            if (!(doEvents ?? true)) continue;

            for (const [updateName, { oldValue, newValue }] of updates) {
                const event = this.youtubeEventFactory.createEventFromUpdate(
                    video,
                    updateName,
                    oldValue,
                    newValue,
                );
                if (event) this.eventBus.publish(event);
            }
        }

        // wait for all videos to have updated.
        await Promise.all(videosUpdating);

        return videosUpdating.length;
    }

    async syncFeedVideoState(...channelIds: string[]) {
        if (!channelIds)
            channelIds = (
                await this.vtuberRepository.findByQuery({
                    youtubeId: { $exists: true },
                })
            ).map((v) => v.getYoutubeId());

        const promises = [];

        for (const id of channelIds) {
            const feedVideoIds = (
                await this.apiService.fetchRecentVideosFromFeed(id)
            ).map((v) => v.videoId);
            const apiVideos = await this.apiService.getVideosByIds(
                ...feedVideoIds,
            );

            for (const video of apiVideos) {
                const dbVideo = await this.streamRepository.findByStreamId(
                    video.id,
                );

                if (!dbVideo) {
                    const {
                        streamId,
                        channelId,
                        title,
                        status,
                        description,
                        startedAt,
                        endedAt,
                        scheduledFor,
                    } = this.apiService.extractInfoFromApiVideo(video);
                    promises.push(
                        this.streamFactory.create(
                            streamId,
                            channelId,
                            'youtube',
                            title,
                            status,
                            description,
                            startedAt,
                            endedAt,
                            scheduledFor,
                        ),
                    );
                } else {
                    const updates = dbVideo.updateFromYouTubeApi(video);
                    if (updates.size > 0)
                        promises.push(
                            this.streamRepository.findOneAndReplaceById(
                                dbVideo._id,
                                dbVideo,
                            ),
                        );
                }
            }
        }

        await Promise.all(promises);
    }
}
