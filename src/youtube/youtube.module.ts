import { Module, forwardRef, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StreamsModule } from '../streams/streams.module';
import { VTubersModule } from '../vtubers/vtubers.module';
import { YouTubeAPIModule } from './api/youtube-api.module';
import { YouTubeAPIService } from './api/youtube-api.service';
import { YouTubeEventSubModule } from './eventsub/youtube-eventsub.module';
import { YouTubeEventSubService } from './eventsub/youtube-eventsub.service';
import { YouTubeController } from './youtube.controller';
import { YouTubeService } from './youtube.service';

@Module({
    imports: [
        CqrsModule,
        forwardRef(() =>VTubersModule), 
        forwardRef(() => StreamsModule), 
        YouTubeAPIModule, 
        YouTubeEventSubModule
    ],
    providers: [YouTubeService],
    controllers: [YouTubeController],
    exports: [YouTubeService]
})
export class YouTubeModule implements OnApplicationBootstrap {
    private readonly logger = new Logger(YouTubeModule.name);
    constructor(
        private readonly youtubeService: YouTubeService,
        private readonly youtubeApiService: YouTubeAPIService,
        private readonly youtubeEventsubService: YouTubeEventSubService
    ) {}
    
    async onApplicationBootstrap() {
        /*const counter = {
            value: 0,
            inc() {
                this.value += 1;
            }
        }

        const ids = await this.youtubeService.getAllChannelIds();
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            
            setTimeout(async () => {
                this.logger.debug(`Doing PubSubHubbub subscription for ${id}.`);
                await this.youtubeEventsubService.subscribe(id);
                counter.inc();
            }, 100*i);
        }

        const i = setInterval(() => {
            this.logger.debug(`Requests processed so far: ${counter.value}`);
            if (counter.value == ids.length) clearInterval(i);
        }, 1500);*/
    }
}