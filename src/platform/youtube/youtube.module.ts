import {
    Module,
    Logger,
    OnApplicationShutdown,
    forwardRef,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { DynamicTimer } from '../../common';
import { StreamsModule, VTubersModule, YouTubeOptions } from '../../core';
import { YouTubeAPIModule } from './api/youtube-api.module';
import { YouTubeEventSubModule } from './eventsub/youtube-eventsub.module';
import { YouTubeEventSubService } from './eventsub/youtube-eventsub.service';
import { YouTubeController } from './youtube.controller';
import { YouTubeService } from './youtube.service';
import { YouTubeEventFactory } from './youtube-event.factory';
import { YouTubeCommunityPostsModule } from './community-posts/youtube-community-posts.module';
@Module({
    imports: [
        CqrsModule,
        forwardRef(() => VTubersModule),
        forwardRef(() => StreamsModule),
        YouTubeAPIModule,
        YouTubeEventSubModule,
        YouTubeCommunityPostsModule,
    ],
    providers: [YouTubeService, YouTubeEventFactory],
    controllers: [YouTubeController],
    exports: [
        YouTubeService,
        YouTubeEventFactory,
        YouTubeAPIModule,
        YouTubeEventSubModule,
    ],
})
export class YouTubeModule implements OnApplicationShutdown {
    private readonly logger = new Logger(YouTubeModule.name);

    private _videoTimer: DynamicTimer;
    constructor(
        private readonly youtubeService: YouTubeService,
        private readonly youtubeEventsubService: YouTubeEventSubService,
        private readonly configService: ConfigService,
    ) {}

    // init function called by PlatformModule
    async init() {
        const counter = {
            value: 0,
            inc() {
                this.value += 1;
            },
        };

        const ids = await this.youtubeService.getAllChannelIds();
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];

            setTimeout(async () => {
                await this.youtubeEventsubService.subscribe(id);
                counter.inc();
            }, 100 * i);
        }

        const i = setInterval(() => {
            // debug for sanity.
            this.logger.debug(
                `YouTube PubSub requests processed so far: ${counter.value}/${ids.length}.`,
            );
            if (counter.value == ids.length) clearInterval(i);
        }, 1500);

        await this.youtubeService.syncFeedVideoState();
        await this.youtubeService.syncVideoStates(false);

        this._videoTimer = new DynamicTimer(
            async () => {
                const totalVideos = (
                    await this.youtubeService.streamRepository.findNonOffline(
                        'youtube',
                    )
                ).length;

                const { quotaLimit, usableQuota } =
                    this.configService.get<YouTubeOptions>('youtube');

                const interval =
                    ((24 * 60 * 60 * 1000) / (quotaLimit * usableQuota)) * // figure out how many requests we can do per day
                    Math.ceil(totalVideos / 50); // figure out how many batches of requests we'll need to do at the current rate

                return interval;
            },
            async () => {
                this.youtubeService
                    .syncVideoStates()
                    .catch((error) => this.logger.error(error));
            },
        );

        await this._videoTimer.start();
    }

    onApplicationShutdown() {
        this._videoTimer.stop();
    }
}
