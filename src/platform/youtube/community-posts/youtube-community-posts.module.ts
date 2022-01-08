import {
    forwardRef,
    Logger,
    Module,
    OnApplicationBootstrap,
    OnApplicationShutdown,
} from '@nestjs/common';
import {
    InjectConnection,
    MongooseModule,
    SchemaFactory,
} from '@nestjs/mongoose';
import { YouTubeCommunityPostsService } from './youtube-community-posts.service';
import { Connection } from 'mongoose';
import { DynamicTimer } from '../../../common/util';
import { VTuberEntityRepository } from '../../../core/vtubers/db/vtuber-entity.repository';
import { YouTubeCommunityPostsController } from './youtube-community-posts.controller';
import { CommunityPostFactory } from './communitypost.factory';
import { CommunityPostEntityRepository } from './db/communitypost-entity.repository';
import { CommunityPostSchemaFactory } from './db/communitypost-schema.factory';
import { CommunityPostEventHandlers } from './events';
import { VTubersModule } from '../../../core/vtubers/vtubers.module';
import { CommunityPostSchema } from './db/communitypost.schema';
import { CommunityPostReadRepository } from './db/communitypost-read.repository';
import { CommunityPostResolver } from './communitypost.resolvers';

@Module({
    imports: [
        forwardRef(() => VTubersModule),
        MongooseModule.forFeatureAsync([
            {
                name: CommunityPostSchema.name,
                useFactory: async () =>
                    SchemaFactory.createForClass(CommunityPostSchema),
            },
        ]),
    ],
    providers: [
        YouTubeCommunityPostsService,
        CommunityPostFactory,
        CommunityPostEntityRepository,
        CommunityPostSchemaFactory,
        CommunityPostReadRepository,
        ...CommunityPostEventHandlers,
        CommunityPostResolver,
    ],
    exports: [YouTubeCommunityPostsService],
    controllers: [YouTubeCommunityPostsController],
})
export class YouTubeCommunityPostsModule
    implements OnApplicationBootstrap, OnApplicationShutdown
{
    private readonly _timer: DynamicTimer;
    private readonly logger = new Logger();
    private _initialSet: Set<string>;
    private _initialThreshold: number;
    constructor(
        private readonly postsService: YouTubeCommunityPostsService,
        @InjectConnection() private readonly connection: Connection,
        private readonly vtuberRepository: VTuberEntityRepository,
    ) {
        let isReady = (id: string) => {
            this._initialSet.add(id);
            if (this._initialSet.size >= this._initialThreshold) {
                this.logger.log(
                    'Finished initial fetching of community posts!',
                );
                this.postsService.finishedFetching();
                delete this._initialSet;
                isReady = (id: string) => {}; //no-op
            }
        };

        this._timer = new DynamicTimer(
            async () => {
                const time =
                    (await this.vtuberRepository.getAllYouTubeIds()).size *
                    2500;
                return time;
            },
            async () => {
                const ids = await this.vtuberRepository.getAllYouTubeIds();
                [...ids].forEach((id, index) => {
                    setTimeout(async () => {
                        isReady(id);
                        await this.postsService
                            .syncPostsById(id)
                            .catch((error) => this.logger.error(error));
                    }, index * 2250);
                });
            },
        );
    }

    async onApplicationBootstrap() {
        this._initialSet = new Set<string>();
        this._initialThreshold = (
            await this.vtuberRepository.getAllYouTubeIds()
        ).size;
        await this._timer.start();
    }

    async onApplicationShutdown() {
        this._timer.stop();
    }
}
