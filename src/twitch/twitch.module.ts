import { forwardRef, Module, OnApplicationBootstrap } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WebeventsModule } from '../webevents/webevents.module';
import { StreamsModule } from '../streams/streams.module';
import { VTubersModule } from '../vtubers/vtubers.module';
import { TwitchEventHandlers } from './events';
import { TwitchStreamFactory } from './twitch-stream.factory';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';
import { TwitchEventSubService } from './eventsub/eventsub.service';
import { TwitchAPIModule } from './api/twitch-api.module';
import { TwitchEventSubModule } from './eventsub/twitch-eventsub.module';
import { TwitchAPIService } from './api/twitch-api.service';

@Module({
    imports: [forwardRef(() => StreamsModule), forwardRef(() => VTubersModule), CqrsModule, WebeventsModule, forwardRef(() => TwitchAPIModule), forwardRef(() => TwitchEventSubModule)],
    providers: [TwitchService, TwitchStreamFactory, ...TwitchEventHandlers],
    controllers: [TwitchController],
    exports: [TwitchService, TwitchEventSubModule, TwitchAPIModule],
})
export class TwitchModule implements OnApplicationBootstrap {
    constructor(
        private readonly twitchService: TwitchService,
        private readonly twitchEventsubService: TwitchEventSubService,
        private readonly twitchApiService: TwitchAPIService
    ) {}
    
    async onApplicationBootstrap() {
        const userIds = await this.twitchService.getAllUserIds();

        const promises = [];

        for (const userId of userIds) {
            promises.push(
                this.twitchEventsubService.subscribe(userId), 
                this.twitchService.syncUserState(userId)
            );
        }

        await Promise.all(promises);
    }
}
