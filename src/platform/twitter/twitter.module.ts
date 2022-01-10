// TODO: migrate Twitter usernames from DB to Twitter IDs **once**.

import {
    Module,
    OnApplicationBootstrap,
    OnApplicationShutdown,
} from '@nestjs/common';
import { DynamicTimer } from '../../common';
import {
    StreamsModule,
    VTubersModule,
    StreamEntityRepository,
    VideoStatus,
} from '../../core';

import { TwitterApiService } from './twitter-api.service';
import { TwitterService } from './twitter.service';

@Module({
    imports: [StreamsModule, VTubersModule],
    providers: [TwitterService, TwitterApiService],
    exports: [TwitterService],
})
export class TwitterModule
    implements OnApplicationBootstrap, OnApplicationShutdown
{
    private _spacesTimer: DynamicTimer;

    constructor(
        private readonly streamRepository: StreamEntityRepository,
        private readonly twitterService: TwitterService,
    ) {
        this._spacesTimer = new DynamicTimer(
            async () => {
                const count = (
                    await this.streamRepository.findByQuery({
                        status: {
                            $in: [VideoStatus.Live, VideoStatus.Upcoming],
                        },
                        platform: 'twitter',
                    })
                ).length;

                // total amount of requests needed * 15 minutes / 300 requests allowed per 15 minute window
                return (Math.ceil(count / 100) * (15 * 60 * 1000)) / 300;
            },
            async () => {
                await this.twitterService.syncUserStates(true);
            },
        );
    }

    onApplicationBootstrap() {}

    onApplicationShutdown() {}
}
