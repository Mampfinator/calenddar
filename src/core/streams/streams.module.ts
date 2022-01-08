import { forwardRef, Module } from '@nestjs/common';
import { StreamResolver } from './stream.revolvers';
import { StreamsService } from './streams.service';
import { StreamsController } from './streams.controller';
import { StreamSchemaFactory } from './db/stream-schema.factory';
import { StreamReadFactory } from './db/stream-read.factory';
import { StreamReadRepository } from './db/stream-read.repository';

import { TwitchModule } from '../../platform/twitch/twitch.module';
import { YouTubeModule } from '../../platform/youtube/youtube.module';
import { MongooseModule } from '@nestjs/mongoose';
import { StreamSchema } from './db/stream.schema';

import { SchemaFactory } from '@nestjs/mongoose';
import { StreamEntityRepository } from './db/stream-entity.repository';
import { StreamFactory } from './stream.factory';

@Module({
    imports: [
        // forwardRef(() => TwitchModule),
        // forwardRef(() => YouTubeModule),
        MongooseModule.forFeatureAsync([
            {
                name: StreamSchema.name,
                useFactory: async () =>
                    SchemaFactory.createForClass(StreamSchema),
            },
        ]),
    ],
    providers: [
        StreamsService,
        StreamResolver,
        StreamSchemaFactory,
        StreamReadFactory,
        StreamReadRepository,
        StreamEntityRepository,
        StreamFactory,
    ],
    controllers: [StreamsController],
    exports: [
        StreamSchemaFactory,
        StreamReadFactory,
        StreamReadRepository,
        StreamEntityRepository,
        StreamFactory,
        StreamsService,
    ],
})
export class StreamsModule {}
