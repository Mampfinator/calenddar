import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/common';

import { VTuberFactory } from './vtuber.factory';
import { VTubersController } from './vtubers.controller';
import { VTuberReadRepository } from './db/vtuber-read.repository';
import { VTuberEntityRepository } from './db/vtuber-entity.repository';
import { VTuberSchemaFactory } from './db/vtuber-schema.factory';
import { VTuberSchema } from './db/vtuber.schema';
import { VTuberResolver } from './vtuber.resolvers';

import { VTuberEventHandlers } from './events';
import { VTuberCommandHandlers } from './commands';
import { VTuberQueryHandlers } from './queries';
import { StreamsModule } from '../streams/streams.module';
import { TwitchModule } from '../twitch/twitch.module';
import { YouTubeModule } from '../youtube/youtube.module';

@Module({
    imports: [
        forwardRef(() => StreamsModule),
        forwardRef(() => TwitchModule),
        forwardRef(() => YouTubeModule),
        CqrsModule,
        MongooseModule.forFeatureAsync([
            {
                name: VTuberSchema.name,
                useFactory: async () =>
                    SchemaFactory.createForClass(VTuberSchema),
            },
        ]),
        CacheModule.register(),
    ],
    controllers: [VTubersController],
    providers: [
        VTuberEntityRepository,
        VTuberReadRepository,
        VTuberSchemaFactory,
        VTuberFactory,
        ...VTuberEventHandlers,
        ...VTuberCommandHandlers,
        ...VTuberQueryHandlers,
        VTuberResolver,
    ],
    exports: [
        VTuberEntityRepository,
        VTuberReadRepository,
        VTuberSchemaFactory,
    ],
})
export class VTubersModule {}
