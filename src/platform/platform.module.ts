import { Module, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { TwitchModule } from './twitch/twitch.module';
import { TwitchService } from './twitch/twitch.service';
import { YouTubeModule } from './youtube/youtube.module';
import { YouTubeService } from './youtube/youtube.service';
import { TwitcastingModule } from './twitcasting/twitcasting.module';
import { TwitcastingService } from './twitcasting/twitcasting.service';
import { TwitterModule } from './twitter/twitter.module';
import { TwitterService } from './twitter/twitter.service';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [TwitchModule, YouTubeModule, TwitcastingModule, TwitterModule],
})
export class PlatformModule implements OnModuleInit {
    constructor(
        private readonly config: ConfigService,
        private readonly twitchService: TwitchService,
        private readonly youtubeService: YouTubeService,
        private readonly twitcastingService: TwitcastingService,
        private readonly twitterService: TwitterService,
    ) {}

    async onModuleInit() {
        // TODO: think of less scuffed way of doing this
        const services = new Set<{
            init?: () => Promise<void>;
            [key: string]: any;
        }>();

        const platforms = new Set(
            ...(this.config.get<string[]>('platforms') ?? []),
        );
        if (!platforms || platforms.has('all') || platforms.size === 0) {
            services.add(this.twitchService);
            services.add(this.youtubeService);
            services.add(this.twitcastingService);
            services.add(this.twitterService);
        } else {
            if (platforms.has('twitch')) services.add(this.twitchService);
            if (platforms.has('youtube')) services.add(this.youtubeService);
            if (platforms.has('twitcasting'))
                services.add(this.twitcastingService);
            if (platforms.has('twitter')) services.add(this.twitterService);
        }

        const promises = [];
        for (const service of services) {
            if (service.init && typeof service.init === 'function')
                promises.push(service.init());
        }

        await Promise.all(promises);
    }
}
