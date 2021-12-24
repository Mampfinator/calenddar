import {
    Module,
    forwardRef,
    OnApplicationBootstrap,
    Logger,
    OnApplicationShutdown,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DynamicTimer } from '../util';
import { StreamsModule } from '../streams/streams.module';
import { VTubersModule } from '../vtubers/vtubers.module';
import { YouTubeAPIModule } from './api/youtube-api.module';
import { YouTubeAPIService } from './api/youtube-api.service';
import { YouTubeEventSubModule } from './eventsub/youtube-eventsub.module';
import { YouTubeEventSubService } from './eventsub/youtube-eventsub.service';
import { YouTubeController } from './youtube.controller';
import { YouTubeService } from './youtube.service';
import { ConfigService } from '@nestjs/config';
import { YouTubeOptions } from 'src/config/config';
import { YouTubeEventFactory } from './youtube-event.factory';

@Module({
    imports: [
        CqrsModule,
        forwardRef(() => VTubersModule),
        forwardRef(() => StreamsModule),
        YouTubeAPIModule,
        YouTubeEventSubModule,
    ],
    providers: [YouTubeService, YouTubeEventFactory],
    controllers: [YouTubeController],
    exports: [YouTubeService, YouTubeEventFactory],
})
export class YouTubeModule
    implements OnApplicationBootstrap, OnApplicationShutdown
{
    private readonly logger = new Logger(YouTubeModule.name);

    private _videoTimer: DynamicTimer;
    constructor(
        private readonly youtubeService: YouTubeService,
        private readonly youtubeApiService: YouTubeAPIService,
        private readonly youtubeEventsubService: YouTubeEventSubService,
        private readonly configService: ConfigService,
    ) {}

    async onApplicationBootstrap() {
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
            this.logger.debug(`YouTube PubSub requests processed so far: ${counter.value}/${ids.length}.`);
            if (counter.value == ids.length) clearInterval(i);
        }, 1500);

        await this.youtubeService.syncFeedVideoState();
        await this.youtubeService.syncVideoStates(false);

        this._videoTimer = new DynamicTimer(
            async () => {
                const amount = (
                    await this.youtubeService.streamRepository.findNonOffline(
                        'youtube',
                    )
                ).length;

                const { quotaLimit, usableQuota } =
                    this.configService.get<YouTubeOptions>('youtube');
                const interval =
                    ((24 * 60 * 60 * 1000) / (quotaLimit * usableQuota)) *
                    Math.ceil(amount / 50);
                return interval;
            },
            () => this.youtubeService.syncVideoStates(),
        );

        await this._videoTimer.start();
    }

    onApplicationShutdown() {
        this._videoTimer.stop();
    }
}
