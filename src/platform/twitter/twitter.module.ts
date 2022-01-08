import { forwardRef, Module, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { StreamEntityRepository } from "src/core/streams/db/stream-entity.repository";
import { VideoStatusEnum } from "src/core/streams/stream.read";
import { StreamsModule } from "src/core/streams/streams.module";
import { DynamicTimer } from "src/common/util";
import { TwitterApiService } from "./twitter-api.service";
import { TwitterService } from "./twitter.service";

@Module({
    imports: [forwardRef(() => StreamsModule)],
    providers: [TwitterApiService],
    exports: []
})
export class TwitterModule implements OnApplicationBootstrap, OnApplicationShutdown {
    private _spacesTimer: DynamicTimer;
    
    constructor(
        private readonly streamRepository: StreamEntityRepository,
        private readonly twitterService: TwitterService
    ) {
        this._spacesTimer = new DynamicTimer(
            async () => {
                const count = (
                    await this.streamRepository.findByQuery({
                        status: {$in: [VideoStatusEnum.Live, VideoStatusEnum.Upcoming]},
                        platform: "twitter"
                    })
                ).length;

                // total amount of requests needed * 15 minutes / 300 requests allowed per 15 minute window
                return Math.ceil(count/100) * (15 * 60 * 1000)/300;
            },
            async () => {
                await this.twitterService.syncUserStates(true);
            }
        );

    }
    
    onApplicationBootstrap() {
        
    }

    onApplicationShutdown() {
        
    }
}